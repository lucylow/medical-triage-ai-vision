import torch
import torch.nn as nn
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    pipeline
)
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import logging
from typing import Dict, List, Tuple
import re
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedTriageService:
    def __init__(self, model_name: str = "microsoft/BioGPT-Large"):
        """
        Initialize the enhanced triage service with a biomedical language model
        
        Args:
            model_name: Name of the pre-trained model to use
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Initialize models (will be loaded if available)
        self.tokenizer = None
        self.model = None
        self.classifier = None
        self.generator = None
        
        # Try to load models
        self._load_models(model_name)
        
        # Medical knowledge base
        self.medical_knowledge = self._load_medical_knowledge()
        
        # Triage guidelines
        self.triage_guidelines = {
            "emergency": {
                "keywords": [
                    "chest pain", "difficulty breathing", "severe bleeding",
                    "stroke", "unconscious", "severe head injury", "heart attack",
                    "suicidal", "choking", "severe burn", "poisoning",
                    "severe allergic reaction", "anaphylaxis", "seizure"
                ],
                "response_template": "Based on your symptoms, this appears to be a medical emergency. Please seek immediate care at the nearest emergency room or call 911."
            },
            "urgent": {
                "keywords": [
                    "fever with rash", "broken bone", "deep cut", "high fever",
                    "severe pain", "vomiting blood", "dehydration", "abdominal pain",
                    "asthma attack", "urinary tract infection", "migraine"
                ],
                "response_template": "Your symptoms suggest you should visit an urgent care center within the next 24 hours."
            },
            "routine": {
                "keywords": [
                    "cold symptoms", "mild fever", "rash", "headache", "back pain",
                    "sprain", "cough", "sore throat", "allergies", "ear pain"
                ],
                "response_template": "Based on your symptoms, you should schedule an appointment with your primary care provider."
            }
        }
        
        # Conversation context memory
        self.conversation_context = {}

    def _load_models(self, model_name: str):
        """Load AI models if available"""
        try:
            # Try to load fine-tuned triage model
            model_path = "models/TRIAGE A.I.-triage"
            if os.path.exists(model_path):
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.model = AutoModelForCausalLM.from_pretrained(model_path).to(self.device)
                logger.info("Loaded fine-tuned triage model")
            else:
                # Fallback to base model
                logger.info("Fine-tuned model not found, using rule-based approach")
                
            # Try to load classifier
            classifier_path = "models/TRIAGE A.I.-classifier"
            if os.path.exists(classifier_path):
                self.classifier = AutoModelForSequenceClassification.from_pretrained(
                    classifier_path
                ).to(self.device)
                logger.info("Loaded fine-tuned triage classifier")
                
        except Exception as e:
            logger.warning(f"Could not load AI models: {e}. Using rule-based approach.")

    def _load_medical_knowledge(self) -> Dict:
        """Load medical knowledge base"""
        try:
            knowledge = {
                "symptoms": {
                    "chest_pain": {
                        "description": "Pain or discomfort in the chest area",
                        "emergency_indicators": ["radiating to arm/jaw", "with shortness of breath", "with nausea"],
                        "questions": ["Is the pain radiating to your arm, neck, or jaw?", 
                                     "Are you experiencing shortness of breath?",
                                     "Are you feeling nauseous or sweating excessively?"]
                    },
                    "abdominal_pain": {
                        "description": "Pain in the abdominal area",
                        "emergency_indicators": ["severe pain", "with fever", "with vomiting"],
                        "questions": ["Where exactly is the pain located?",
                                     "How severe is the pain on a scale of 1-10?",
                                     "Are you experiencing any other symptoms?"]
                    },
                    "headache": {
                        "description": "Pain in the head or upper neck",
                        "emergency_indicators": ["sudden severe pain", "with confusion", "after head injury"],
                        "questions": ["When did the headache start?",
                                     "Is this the worst headache you've ever had?",
                                     "Are you experiencing any vision changes?"]
                    }
                },
                "conditions": {
                    "myocardial_infarction": {
                        "name": "Heart Attack",
                        "symptoms": ["chest_pain", "shortness_of_breath", "nausea"],
                        "urgency": "emergency"
                    },
                    "appendicitis": {
                        "name": "Appendicitis",
                        "symptoms": ["abdominal_pain", "nausea", "fever"],
                        "urgency": "urgent"
                    }
                }
            }
            return knowledge
        except Exception as e:
            logger.error(f"Error loading medical knowledge: {e}")
            return {}

    def preprocess_symptoms(self, text: str) -> str:
        """Preprocess symptom description text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep medical terms
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def determine_triage_level(self, text: str) -> Tuple[str, float]:
        """
        Determine the appropriate triage level based on symptoms
        
        Args:
            text: Preprocessed symptom description
            
        Returns:
            Tuple of (triage_level, confidence)
        """
        text_lower = text.lower()
        
        # Use fine-tuned classifier if available
        if self.classifier and self.tokenizer:
            try:
                inputs = self.tokenizer(
                    text_lower, 
                    return_tensors="pt", 
                    truncation=True, 
                    padding=True,
                    max_length=512
                ).to(self.device)
                
                with torch.no_grad():
                    outputs = self.classifier(**inputs)
                    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                    confidence, predicted_class = torch.max(predictions, dim=1)
                    
                triage_levels = ["emergency", "urgent", "routine"]
                return triage_levels[predicted_class.item()], confidence.item()
            except Exception as e:
                logger.error(f"Classifier error: {e}. Falling back to rule-based approach.")
        
        # Fallback to rule-based approach
        emergency_score = 0
        urgent_score = 0
        routine_score = 0
        
        # Score based on keyword matching
        for level, data in self.triage_guidelines.items():
            for keyword in data["keywords"]:
                if keyword in text_lower:
                    if level == "emergency":
                        emergency_score += 3  # Higher weight for emergency keywords
                    elif level == "urgent":
                        urgent_score += 2
                    else:
                        routine_score += 1
        
        # Additional scoring based on symptom patterns
        if any(word in text_lower for word in ["can't breathe", "difficulty breathing", "choking"]):
            emergency_score += 5
        
        if any(word in text_lower for word in ["sharp pain", "severe pain", "unbearable pain"]):
            emergency_score += 3
        
        # Determine the level with the highest score
        scores = {
            "emergency": emergency_score,
            "urgent": urgent_score,
            "routine": routine_score
        }
        
        max_level = max(scores, key=scores.get)
        max_score = scores[max_level]
        total_score = sum(scores.values())
        
        confidence = max_score / total_score if total_score > 0 else 0.5
        
        return max_level, confidence

    def generate_medical_response(self, symptoms: str, image_analysis: str = "", 
                                conversation_history: List[Dict] = None) -> str:
        """
        Generate a medical response using AI or rule-based approach
        
        Args:
            symptoms: Patient's symptom description
            image_analysis: Analysis from vision model (if any)
            conversation_history: Previous conversation turns
            
        Returns:
            Generated medical response
        """
        # If AI models are available, use them
        if self.generator:
            try:
                prompt = self._build_medical_prompt(symptoms, image_analysis, conversation_history)
                
                response = self.generator(
                    prompt,
                    max_length=512,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    repetition_penalty=1.2,
                    pad_token_id=self.tokenizer.eos_token_id
                )
                
                generated_text = response[0]['generated_text']
                assistant_response = generated_text[len(prompt):].strip()
                
                # Post-process the response
                assistant_response = self._postprocess_response(assistant_response)
                
                return assistant_response
                
            except Exception as e:
                logger.error(f"Error generating AI response: {e}")
                return self._get_fallback_response(symptoms)
        else:
            # Use rule-based approach
            return self._get_rule_based_response(symptoms, image_analysis)

    def _build_medical_prompt(self, symptoms: str, image_analysis: str, 
                            conversation_history: List[Dict]) -> str:
        """Build a prompt for the medical AI"""
        prompt = """You are a medical triage assistant named TRIAGE A.I.. Your role is to:
1. Ask clarifying questions about symptoms
2. Assess urgency based on medical guidelines
3. Provide appropriate medical guidance
4. NEVER provide a definitive diagnosis
5. Always recommend consulting a healthcare professional

Current conversation:
"""
        
        # Add conversation history if available
        if conversation_history:
            for turn in conversation_history[-5:]:  # Keep last 5 turns for context
                role = "Patient" if turn["role"] == "user" else "TRIAGE A.I."
                prompt += f"{role}: {turn['content']}\n"
        
        # Add current symptoms
        prompt += f"Patient: {symptoms}\n"
        
        # Add image analysis if available
        if image_analysis:
            prompt += f"Image analysis: {image_analysis}\n"
        
        prompt += "TRIAGE A.I.:"
        
        return prompt

    def _postprocess_response(self, response: str) -> str:
        """Post-process the generated response to ensure medical safety"""
        # Remove any diagnostic statements
        response = re.sub(r'\b(I diagnose|you have|you\'ve got|it\'s definitely)\b.*?\.', 
                         'I recommend consulting with a healthcare professional for an accurate assessment.', 
                         response, flags=re.IGNORECASE)
        
        # Ensure the response doesn't make guarantees
        response = re.sub(r'\b(don\'t worry|it\'s nothing|you\'ll be fine)\b', 
                         'I recommend monitoring your symptoms and seeking medical attention if they worsen', 
                         response, flags=re.IGNORECASE)
        
        # Add disclaimer if not present
        if "consult a healthcare professional" not in response.lower():
            response += " Please consult with a healthcare professional for proper medical advice."
        
        return response

    def _get_rule_based_response(self, symptoms: str, image_analysis: str = "") -> str:
        """Generate a rule-based medical response"""
        triage_level, confidence = self.determine_triage_level(symptoms)
        
        # Get base response
        response_template = self.triage_guidelines.get(triage_level, {}).get(
            "response_template", 
            "Based on your symptoms, I recommend consulting with a healthcare professional."
        )
        
        # Add specific guidance based on symptoms
        specific_guidance = self._get_specific_guidance(symptoms)
        
        # Add follow-up questions
        follow_up_questions = self._get_follow_up_questions(symptoms)
        
        # Combine all parts
        response = f"{response_template} {specific_guidance} {follow_up_questions}"
        
        return response

    def _get_specific_guidance(self, symptoms: str) -> str:
        """Get specific medical guidance based on symptoms"""
        symptoms_lower = symptoms.lower()
        
        if "chest pain" in symptoms_lower:
            return "Chest pain can be serious, especially if it radiates to your arm, neck, or jaw, or is accompanied by shortness of breath, nausea, or sweating."
        
        if "abdominal pain" in symptoms_lower:
            return "Abdominal pain can indicate various conditions. Severe, sudden pain or pain with fever requires immediate attention."
        
        if "headache" in symptoms_lower:
            return "Most headaches are not serious, but sudden severe headaches or headaches with confusion require immediate medical attention."
        
        if "difficulty breathing" in symptoms_lower:
            return "Difficulty breathing is a medical emergency. Please seek immediate care."
        
        return ""

    def _get_follow_up_questions(self, symptoms: str) -> str:
        """Get relevant follow-up questions"""
        symptoms_lower = symptoms.lower()
        
        if "pain" in symptoms_lower:
            return "Can you rate your pain on a scale of 1-10? When did the pain start? Is it constant or intermittent?"
        
        if "fever" in symptoms_lower:
            return "What is your temperature? How long have you had the fever? Are you experiencing any other symptoms?"
        
        if "nausea" in symptoms_lower:
            return "Are you vomiting? When did the nausea start? Are you able to keep fluids down?"
        
        return "Can you tell me more about your symptoms? How long have you been experiencing them?"

    def _get_fallback_response(self, symptoms: str) -> str:
        """Get a fallback response when AI generation fails"""
        return self._get_rule_based_response(symptoms)

    def assess_symptoms(self, symptoms: str, image_analysis: str = "", 
                       session_id: str = None) -> Dict:
        """
        Main method to assess symptoms and generate a response
        
        Args:
            symptoms: Patient's symptom description
            image_analysis: Analysis from vision model (if any)
            session_id: Conversation session ID for context
            
        Returns:
            Dictionary with assessment results
        """
        # Preprocess symptoms
        processed_symptoms = self.preprocess_symptoms(symptoms)
        
        # Get conversation history if session ID provided
        conversation_history = self.conversation_context.get(session_id, []) if session_id else []
        
        # Add current user message to history
        conversation_history.append({"role": "user", "content": processed_symptoms})
        
        # Generate AI response
        ai_response = self.generate_medical_response(
            processed_symptoms, image_analysis, conversation_history
        )
        
        # Add AI response to history
        conversation_history.append({"role": "assistant", "content": ai_response})
        
        # Update conversation context
        if session_id:
            self.conversation_context[session_id] = conversation_history[-10:]  # Keep last 10 messages
        
        # Determine triage level
        triage_level, confidence = self.determine_triage_level(processed_symptoms)
        
        # Prepare response
        response = {
            "triage_level": triage_level,
            "confidence": confidence,
            "message": ai_response,
            "follow_up_questions": self._extract_follow_up_questions(ai_response),
            "context": {
                "previous_symptoms": processed_symptoms,
                "conversation_turns": len(conversation_history),
                "ai_model_used": self.model is not None
            }
        }
        
        return response

    def _extract_follow_up_questions(self, response: str) -> List[str]:
        """Extract follow-up questions from the AI response"""
        questions = []
        # Look for question marks and preceding text
        sentences = response.split('.')
        for sentence in sentences:
            if '?' in sentence:
                questions.append(sentence.strip())
        
        return questions if questions else ["Can you tell me more about your symptoms?"]

    def get_medical_knowledge(self, symptom: str = None) -> Dict:
        """Get medical knowledge for a specific symptom or all symptoms"""
        if symptom:
            return self.medical_knowledge.get("symptoms", {}).get(symptom, {})
        return self.medical_knowledge

    def clear_conversation_context(self, session_id: str):
        """Clear conversation context for a session"""
        if session_id in self.conversation_context:
            del self.conversation_context[session_id]

# Create a singleton instance
enhanced_triage_service = EnhancedTriageService()

# Example usage
if __name__ == "__main__":
    # Test the enhanced service
    test_symptoms = "I have a sharp pain in my chest that radiates to my left arm, and I'm feeling nauseous."
    
    result = enhanced_triage_service.assess_symptoms(test_symptoms, session_id="test-123")
    
    print("Enhanced Triage Assessment:")
    print(f"Triage Level: {result['triage_level']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Message: {result['message']}")
    print(f"AI Model Used: {result['context']['ai_model_used']}")

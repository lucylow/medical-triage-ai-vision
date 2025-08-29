"""
AI Integration Module for TRIAGE A.I.
Connects enhanced AI services with the main triage system
"""

import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

def get_enhanced_triage_assessment(symptoms: str, session_id: str = None) -> Dict:
    """
    Get enhanced triage assessment using AI models if available
    
    Args:
        symptoms: Patient symptom description
        session_id: Conversation session ID
        
    Returns:
        Dictionary with enhanced assessment results
    """
    try:
        # Try to use enhanced AI service
        from enhanced_triage_service import enhanced_triage_service
        
        logger.info("Using enhanced AI triage service")
        result = enhanced_triage_service.assess_symptoms(symptoms, session_id=session_id)
        
        # Convert to standard format
        return {
            "level": result["triage_level"],
            "confidence": result["confidence"],
            "summary": result["message"],
            "recommendations": [result["message"]],
            "next_steps": result["follow_up_questions"],
            "ai_model_used": result["context"]["ai_model_used"],
            "conversation_context": result["context"]
        }
        
    except ImportError:
        logger.warning("Enhanced AI service not available, using fallback")
        return get_fallback_assessment(symptoms)
    except Exception as e:
        logger.error(f"Error in enhanced AI service: {e}")
        return get_fallback_assessment(symptoms)

def get_fallback_assessment(symptoms: str) -> Dict:
    """
    Fallback assessment when AI models are not available
    
    Args:
        symptoms: Patient symptom description
        
    Returns:
        Dictionary with fallback assessment results
    """
    symptoms_lower = symptoms.lower()
    
    # Simple rule-based assessment
    if any(word in symptoms_lower for word in ["chest pain", "heart attack", "stroke", "unconscious"]):
        return {
            "level": "emergency",
            "confidence": 0.9,
            "summary": "These symptoms suggest a medical emergency requiring immediate attention.",
            "recommendations": ["Call 911 immediately", "Go to nearest emergency room"],
            "next_steps": ["Follow emergency personnel instructions"],
            "ai_model_used": False,
            "conversation_context": {"fallback": True}
        }
    
    elif any(word in symptoms_lower for word in ["abdominal pain", "broken bone", "high fever"]):
        return {
            "level": "urgent",
            "confidence": 0.8,
            "summary": "Your symptoms require urgent medical evaluation within 24 hours.",
            "recommendations": ["Visit urgent care center today", "Avoid delaying care"],
            "next_steps": ["Contact urgent care or emergency department"],
            "ai_model_used": False,
            "conversation_context": {"fallback": True}
        }
    
    else:
        return {
            "level": "routine",
            "confidence": 0.7,
            "summary": "Based on your symptoms, schedule an appointment with your healthcare provider.",
            "recommendations": ["Schedule appointment with healthcare provider"],
            "next_steps": ["Monitor symptoms", "Follow up if symptoms worsen"],
            "ai_model_used": False,
            "conversation_context": {"fallback": True}
        }

def is_enhanced_ai_available() -> bool:
    """Check if enhanced AI service is available"""
    try:
        from enhanced_triage_service import enhanced_triage_service
        return True
    except ImportError:
        return False

def get_ai_service_status() -> Dict:
    """Get status of AI services"""
    return {
        "enhanced_ai_available": is_enhanced_ai_available(),
        "service_type": "enhanced" if is_enhanced_ai_available() else "fallback",
        "capabilities": {
            "conversation_memory": is_enhanced_ai_available(),
            "medical_knowledge_base": is_enhanced_ai_available(),
            "fine_tuned_models": is_enhanced_ai_available()
        }
    }

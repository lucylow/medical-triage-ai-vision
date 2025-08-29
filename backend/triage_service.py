"""
TRIAGE A.I. Backend Service
AI-powered medical triage system with vision analysis and resource matching
"""

import os
import json
import base64
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import asyncio
from dataclasses import dataclass, asdict

# AI/ML Libraries
try:
    import openai
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available, using mock responses")

try:
    import torch
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("Transformers not available, using mock responses")

# Enhanced AI Triage Service
try:
    from enhanced_triage_service import enhanced_triage_service
    ENHANCED_AI_AVAILABLE = True
    logger.info("Enhanced AI triage service available")
except ImportError:
    ENHANCED_AI_AVAILABLE = False
    logger.warning("Enhanced AI triage service not available, using standard service")

# Vision Processing
try:
    import cv2
    import numpy as np
    from PIL import Image
    import io
    VISION_AVAILABLE = True
except ImportError:
    VISION_AVAILABLE = False
    logging.warning("Vision libraries not available, using mock responses")

# Database and Geospatial
try:
    import sqlite3
    import pandas as pd
    from geopy.distance import geodesic
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False
    logging.warning("Database libraries not available, using mock responses")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TriageRequest:
    """Request structure for triage analysis"""
    user_id: str
    session_id: str
    text_input: str
    image_data: Optional[str] = None  # base64 encoded
    location: Optional[Dict[str, float]] = None
    timestamp: Optional[str] = None

@dataclass
class TriageResult:
    """Result structure for triage analysis"""
    level: str  # emergency, urgent, routine, self_care
    confidence: float
    summary: str
    recommendations: List[str]
    next_steps: List[str]
    image_analysis: Optional[str] = None
    risk_factors: List[str] = None
    processing_time: float = 0.0

@dataclass
class HealthcareResource:
    """Healthcare facility information"""
    id: str
    name: str
    type: str  # hospital, urgent_care, clinic, pharmacy
    address: str
    distance: float
    phone: str
    hours: str
    accepts_insurance: bool
    financial_aid: bool
    rating: float
    coordinates: Dict[str, float]
    specialties: List[str] = None
    wait_time: Optional[str] = None

class TriageAIService:
    """Main triage AI service class"""
    
    def __init__(self):
        self.openai_client = None
        self.triage_model = None
        self.tokenizer = None
        self.vision_pipeline = None
        self.db_connection = None
        
        self._initialize_services()
        self._load_healthcare_data()
    
    def _initialize_services(self):
        """Initialize AI services and models"""
        try:
            # Initialize OpenAI client if available
            if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
                self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                logger.info("OpenAI client initialized")
            
            # Initialize local models if available
            if TRANSFORMERS_AVAILABLE:
                self._load_local_models()
            
            # Initialize vision processing
            if VISION_AVAILABLE:
                self._initialize_vision_processing()
            
            # Initialize database
            if DB_AVAILABLE:
                self._initialize_database()
                
        except Exception as e:
            logger.error(f"Error initializing services: {e}")
    
    def _load_local_models(self):
        """Load local transformer models for triage classification"""
        try:
            # Load a smaller model for faster inference
            model_name = "microsoft/DialoGPT-medium"  # Placeholder - would use medical-specific model
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.triage_model = AutoModelForSequenceClassification.from_pretrained(model_name)
            
            # Add padding token if not present
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            logger.info("Local triage models loaded")
            
        except Exception as e:
            logger.error(f"Error loading local models: {e}")
    
    def _initialize_vision_processing(self):
        """Initialize computer vision processing capabilities"""
        try:
            # Initialize image preprocessing
            self.image_size = (224, 224)
            logger.info("Vision processing initialized")
            
        except Exception as e:
            logger.error(f"Error initializing vision processing: {e}")
    
    def _initialize_database(self):
        """Initialize healthcare resources database"""
        try:
            # Create SQLite database
            self.db_path = "healthcare_resources.db"
            self.db_connection = sqlite3.connect(self.db_path)
            
            # Create tables if they don't exist
            self._create_database_schema()
            
            # Load sample data if database is empty
            self._load_sample_data()
            
            logger.info("Healthcare database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            self.db_connection = None
    
    def _create_database_schema(self):
        """Create database schema for healthcare resources"""
        try:
            cursor = self.db_connection.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS healthcare_resources (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    address TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    phone TEXT,
                    hours TEXT,
                    accepts_insurance BOOLEAN,
                    financial_aid BOOLEAN,
                    rating REAL,
                    specialties TEXT,
                    wait_time TEXT
                )
            """)
            
            self.db_connection.commit()
        except Exception as e:
            logger.error(f"Error creating database schema: {e}")
            raise
    
    def _load_sample_data(self):
        """Load sample healthcare data for demonstration"""
        try:
            cursor = self.db_connection.cursor()
            
            # Check if data already exists
            cursor.execute("SELECT COUNT(*) FROM healthcare_resources")
            if cursor.fetchone()[0] > 0:
                return
            
            # Sample healthcare facilities for San Francisco
            sample_data = [
                {
                    'id': 'sf_general',
                    'name': 'San Francisco General Hospital',
                    'type': 'hospital',
                    'address': '1001 Potrero Ave, San Francisco, CA 94110',
                    'latitude': 37.7555,
                    'longitude': -122.4064,
                    'phone': '(415) 206-8000',
                    'hours': '24/7',
                    'accepts_insurance': True,
                    'financial_aid': True,
                    'rating': 4.7,
                    'specialties': 'emergency,trauma,cardiology',
                    'wait_time': '2-4 hours'
                },
                {
                    'id': 'ucsf_medical',
                    'name': 'UCSF Medical Center',
                    'type': 'hospital',
                    'address': '505 Parnassus Ave, San Francisco, CA 94143',
                    'latitude': 37.7629,
                    'longitude': -122.4574,
                    'phone': '(415) 476-1000',
                    'hours': '24/7',
                    'accepts_insurance': True,
                    'financial_aid': True,
                    'rating': 4.9,
                    'specialties': 'emergency,oncology,neurology',
                    'wait_time': '1-3 hours'
                },
                {
                    'id': 'urgent_care_sf',
                    'name': 'CityMD Urgent Care',
                    'type': 'urgent_care',
                    'address': '123 Castro St, San Francisco, CA 94114',
                    'latitude': 37.7648,
                    'longitude': -122.4350,
                    'phone': '(415) 555-0123',
                    'hours': '8AM-10PM',
                    'accepts_insurance': True,
                    'financial_aid': False,
                    'rating': 4.3,
                    'specialties': 'urgent_care,minor_injuries',
                    'wait_time': '30-60 minutes'
                }
            ]
            
            for facility in sample_data:
                cursor.execute("""
                    INSERT INTO healthcare_resources 
                    (id, name, type, address, latitude, longitude, phone, hours, 
                     accepts_insurance, financial_aid, rating, specialties, wait_time)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    facility['id'], facility['name'], facility['type'], facility['address'],
                    facility['latitude'], facility['longitude'], facility['phone'], facility['hours'],
                    facility['accepts_insurance'], facility['financial_aid'], facility['rating'],
                    facility['specialties'], facility['wait_time']
                ))
            
            self.db_connection.commit()
            logger.info("Sample healthcare data loaded")
        except Exception as e:
            logger.error(f"Error loading sample data: {e}")
            raise
    
    async def analyze_symptoms(self, request: TriageRequest) -> TriageResult:
        """Main method to analyze symptoms and provide triage assessment"""
        start_time = datetime.now()
        
        try:
            # Process image if provided
            image_analysis = None
            if request.image_data:
                image_analysis = await self._analyze_image(request.image_data)
            
            # Combine text and image analysis
            combined_input = request.text_input
            if image_analysis:
                combined_input += f"\n\nImage Analysis: {image_analysis}"
            
            # Get triage assessment
            triage_assessment = await self._get_triage_assessment(combined_input)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Create result
            result = TriageResult(
                level=triage_assessment['level'],
                confidence=triage_assessment['confidence'],
                summary=triage_assessment['summary'],
                recommendations=triage_assessment['recommendations'],
                next_steps=triage_assessment['next_steps'],
                image_analysis=image_analysis,
                risk_factors=triage_assessment.get('risk_factors', []),
                processing_time=processing_time
            )
            
            logger.info(f"Triage analysis completed in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error in symptom analysis: {e}")
            # Return safe default result
            return TriageResult(
                level='routine',
                confidence=0.5,
                summary="Unable to complete analysis. Please consult a healthcare provider.",
                recommendations=["Seek professional medical advice"],
                next_steps=["Contact your primary care physician"],
                processing_time=0.0
            )
    
    async def _analyze_image(self, image_data: str) -> str:
        """Analyze uploaded image for medical symptoms"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize for processing
            image = image.resize(self.image_size)
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # Basic image analysis (placeholder - would use medical CV model)
            # In production, this would use a fine-tuned medical image classification model
            
            # Mock analysis based on image characteristics
            analysis = self._mock_image_analysis(image_array)
            
            logger.info("Image analysis completed")
            return analysis
            
        except Exception as e:
            logger.error(f"Error in image analysis: {e}")
            return "Unable to analyze image. Please provide a clear photo of the affected area."
    
    def _mock_image_analysis(self, image_array: np.ndarray) -> str:
        """Mock image analysis for demonstration purposes"""
        try:
            # Simple analysis based on image characteristics
            # In production, this would use a trained medical CV model
            
            # Calculate basic image statistics
            brightness = np.mean(image_array)
            contrast = np.std(image_array)
            
            # Mock analysis based on image properties
            if brightness < 100:  # Dark image
                return "Image appears dark. Please ensure proper lighting for accurate assessment."
            elif contrast < 30:  # Low contrast
                return "Image has low contrast. Please take photo in better lighting conditions."
            else:
                return "Image quality appears suitable for analysis. Visible area shows clear focus on symptoms."
        except Exception as e:
            logger.error(f"Error in mock image analysis: {e}")
            return "Unable to analyze image. Please provide a clear photo of the affected area."
    
    async def _get_triage_assessment(self, symptoms_text: str) -> Dict:
        """Get triage assessment using AI models"""
        try:
            # Try OpenAI first if available
            if self.openai_client:
                return await self._get_openai_assessment(symptoms_text)
            
            # Fall back to local model
            elif self.triage_model:
                return self._get_local_assessment(symptoms_text)
            
            # Fall back to rule-based assessment
            else:
                return self._get_rule_based_assessment(symptoms_text)
                
        except Exception as e:
            logger.error(f"Error in triage assessment: {e}")
            return self._get_rule_based_assessment(symptoms_text)
    
    async def _get_openai_assessment(self, symptoms_text: str) -> Dict:
        """Get triage assessment using OpenAI"""
        try:
            system_prompt = """You are a medical triage assistant. Your role is to:
1. Assess the urgency level of medical symptoms
2. Provide clear, actionable recommendations
3. NEVER give definitive diagnoses
4. Always err on the side of caution
5. Direct users to appropriate care levels

Respond with a JSON object containing:
- level: one of "emergency", "urgent", "routine", "self_care"
- confidence: float between 0.0 and 1.0
- summary: brief assessment summary
- recommendations: list of immediate actions
- next_steps: list of follow-up actions
- risk_factors: list of concerning factors"""

            user_prompt = f"Analyze these symptoms for triage assessment: {symptoms_text}"

            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )

            # Parse response
            content = response.choices[0].message.content
            assessment = json.loads(content)
            
            return assessment
            
        except Exception as e:
            logger.error(f"OpenAI assessment failed: {e}")
            raise
    
    def _get_local_assessment(self, symptoms_text: str) -> Dict:
        """Get triage assessment using local transformer model"""
        try:
            # This would use a fine-tuned medical triage model
            # For now, return rule-based assessment
            return self._get_rule_based_assessment(symptoms_text)
            
        except Exception as e:
            logger.error(f"Local assessment failed: {e}")
            return self._get_rule_based_assessment(symptoms_text)
    
    def _get_rule_based_assessment(self, symptoms_text: str) -> Dict:
        """Rule-based triage assessment as fallback"""
        try:
            symptoms_lower = symptoms_text.lower()
            
            # Emergency indicators
            emergency_keywords = [
                'chest pain', 'heart attack', 'stroke', 'unconscious', 'bleeding heavily',
                'difficulty breathing', 'severe head injury', 'paralysis', 'seizure'
            ]
            
            # Urgent indicators
            urgent_keywords = [
                'abdominal pain', 'broken bone', 'high fever', 'severe pain',
                'vomiting blood', 'head injury', 'eye injury', 'severe burn'
            ]
            
            # Routine indicators
            routine_keywords = [
                'mild fever', 'cough', 'cold symptoms', 'minor injury',
                'skin rash', 'mild headache', 'sore throat'
            ]
            
            # Check for emergency conditions
            for keyword in emergency_keywords:
                if keyword in symptoms_lower:
                    return {
                        'level': 'emergency',
                        'confidence': 0.9,
                        'summary': f'Symptoms suggest emergency condition requiring immediate medical attention.',
                        'recommendations': ['Call 911 immediately', 'Go to nearest emergency room'],
                        'next_steps': ['Follow emergency personnel instructions', 'Bring medical history if possible'],
                        'risk_factors': ['Life-threatening symptoms detected']
                    }
            
            # Check for urgent conditions
            for keyword in urgent_keywords:
                if keyword in symptoms_lower:
                    return {
                        'level': 'urgent',
                        'confidence': 0.8,
                        'summary': f'Symptoms require urgent medical evaluation within 24 hours.',
                        'recommendations': ['Seek medical attention today', 'Avoid delaying care'],
                        'next_steps': ['Contact urgent care or emergency department', 'Monitor symptoms closely'],
                        'risk_factors': ['Moderate to severe symptoms']
                    }
            
            # Check for routine conditions
            for keyword in routine_keywords:
                if keyword in symptoms_lower:
                    return {
                        'level': 'routine',
                        'confidence': 0.7,
                        'summary': f'Symptoms suggest routine medical care needed.',
                        'recommendations': ['Schedule appointment with healthcare provider'],
                        'next_steps': ['Monitor symptoms', 'Follow up if symptoms worsen'],
                        'risk_factors': ['Mild symptoms']
                    }
            
            # Default to routine care
            return {
                'level': 'routine',
                'confidence': 0.6,
                'summary': 'Symptoms require professional medical evaluation.',
                'recommendations': ['Consult with healthcare provider'],
                'next_steps': ['Schedule appointment', 'Monitor symptoms'],
                'risk_factors': ['Symptoms unclear']
            }
        except Exception as e:
            logger.error(f"Error in rule-based assessment: {e}")
            # Return safe default
            return {
                'level': 'routine',
                'confidence': 0.5,
                'summary': 'Unable to complete assessment. Please consult a healthcare provider.',
                'recommendations': ['Seek professional medical advice'],
                'next_steps': ['Contact your primary care physician'],
                'risk_factors': ['Assessment error']
            }
    
    def find_healthcare_resources(
        self, 
        location: Dict[str, float], 
        triage_level: str,
        max_distance: float = 50.0
    ) -> List[HealthcareResource]:
        """Find nearby healthcare resources based on location and triage level"""
        try:
            if not self.db_connection:
                return self._get_mock_resources()
            
            cursor = self.db_connection.cursor()
            
            # Query resources within distance
            cursor.execute("""
                SELECT id, name, type, address, latitude, longitude, phone, hours,
                       accepts_insurance, financial_aid, rating, specialties, wait_time
                FROM healthcare_resources
            """)
            
            resources = []
            for row in cursor.fetchall():
                try:
                    resource_coords = {'lat': row[4], 'lng': row[5]}
                    distance = geodesic(
                        (location['lat'], location['lng']),
                        (resource_coords['lat'], resource_coords['lng'])
                    ).miles
                    
                    if distance <= max_distance:
                        resource = HealthcareResource(
                            id=row[0],
                            name=row[1],
                            type=row[2],
                            address=row[3],
                            distance=round(distance, 1),
                            phone=row[6],
                            hours=row[7],
                            accepts_insurance=bool(row[8]),
                            financial_aid=bool(row[9]),
                            rating=row[10] or 0.0,
                            coordinates=resource_coords,
                            specialties=row[11].split(',') if row[11] else [],
                            wait_time=row[12]
                        )
                        resources.append(resource)
                except Exception as row_error:
                    logger.warning(f"Error processing resource row: {row_error}")
                    continue
            
            # Sort by distance and filter by triage level appropriateness
            resources.sort(key=lambda x: x.distance)
            
            # Filter based on triage level
            filtered_resources = self._filter_resources_by_triage_level(resources, triage_level)
            
            return filtered_resources[:10]  # Return top 10 results
            
        except Exception as e:
            logger.error(f"Error finding healthcare resources: {e}")
            return self._get_mock_resources()
    
    def _filter_resources_by_triage_level(
        self, 
        resources: List[HealthcareResource], 
        triage_level: str
    ) -> List[HealthcareResource]:
        """Filter resources based on triage level appropriateness"""
        try:
            if triage_level == 'emergency':
                # Emergency: prioritize hospitals with emergency departments
                return [r for r in resources if r.type == 'hospital']
            elif triage_level == 'urgent':
                # Urgent: prioritize urgent care and hospitals
                return [r for r in resources if r.type in ['urgent_care', 'hospital']]
            else:
                # Routine/self-care: include all types
                return resources
        except Exception as e:
            logger.error(f"Error filtering resources by triage level: {e}")
            # Return all resources if filtering fails
            return resources
    
    def _get_mock_resources(self) -> List[HealthcareResource]:
        """Return mock healthcare resources for demonstration"""
        return [
            HealthcareResource(
                id='mock_1',
                name='City General Hospital',
                type='hospital',
                address='123 Medical Center Dr, San Francisco, CA',
                distance=2.1,
                phone='(555) 123-4567',
                hours='24/7',
                accepts_insurance=True,
                financial_aid=True,
                rating=4.8,
                coordinates={'lat': 37.7749, 'lng': -122.4194},
                specialties=['emergency', 'trauma'],
                wait_time='2-4 hours'
            ),
            HealthcareResource(
                id='mock_2',
                name='Urgent Care Express',
                type='urgent_care',
                address='456 Health Plaza, San Francisco, CA',
                distance=1.3,
                phone='(555) 987-6543',
                hours='8AM-10PM',
                accepts_insurance=True,
                financial_aid=False,
                rating=4.5,
                coordinates={'lat': 37.7849, 'lng': -122.4094},
                specialties=['urgent_care'],
                wait_time='30-60 minutes'
            )
        ]

# Service instance
triage_service = TriageAIService()

async def process_triage_request(request_data: Dict) -> Dict:
    """Process a triage request and return results"""
    try:
        # Create request object
        request = TriageRequest(
            user_id=request_data.get('user_id', 'anonymous'),
            session_id=request_data.get('session_id', 'session_1'),
            text_input=request_data.get('text_input', ''),
            image_data=request_data.get('image_data'),
            location=request_data.get('location'),
            timestamp=datetime.now().isoformat()
        )
        
        # Validate request
        if not request.text_input.strip():
            return {
                'error': 'Text input is required',
                'status': 'error'
            }
        
        # Process triage
        triage_result = await triage_service.analyze_symptoms(request)
        
        # Find healthcare resources if location provided
        resources = []
        if request.location:
            resources = triage_service.find_healthcare_resources(
                request.location, 
                triage_result.level
            )
        
        # Format response
        response = {
            'status': 'success',
            'triage_result': asdict(triage_result),
            'healthcare_resources': [asdict(r) for r in resources],
            'session_id': request.session_id,
            'timestamp': request.timestamp
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing triage request: {e}")
        return {
            'error': str(e),
            'status': 'error'
        }

# Example usage and testing
if __name__ == "__main__":
    # Test the service
    async def test_service():
        test_request = {
            'user_id': 'test_user',
            'session_id': 'test_session',
            'text_input': 'Sharp pain in lower right abdomen, feeling nauseous for 2 hours',
            'location': {'lat': 37.7749, 'lng': -122.4194}
        }
        
        result = await process_triage_request(test_request)
        print(json.dumps(result, indent=2))
    
    # Run test
    asyncio.run(test_service())

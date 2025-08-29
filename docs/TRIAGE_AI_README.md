# TRIAGE A.I. - Medical Triage & Healthcare Resource Finder

## 🚨 Overview

**TRIAGE A.I.** is an intelligent medical triage system that provides AI-powered symptom analysis and helps users find appropriate healthcare resources. Built with modern web technologies and integrated into the Global Accelerator 2025 project, it offers a comprehensive solution for medical triage assessment.

## ✨ Key Features

### 🔬 AI-Powered Medical Triage
- **Intelligent Symptom Analysis**: Advanced AI models analyze user symptoms and provide triage assessments
- **Multi-Modal Input**: Support for text, voice, and image input for comprehensive symptom evaluation
- **Real-time Processing**: Instant triage results with confidence scoring
- **Medical Safety**: Conservative approach that always errs on the side of caution

### 🏥 Healthcare Resource Management
- **Geolocation-Based Search**: Find nearby healthcare facilities based on user location
- **Resource Filtering**: Filter by triage level, facility type, and special requirements
- **Comprehensive Information**: Detailed facility data including hours, insurance acceptance, and financial aid
- **Real-time Updates**: Live wait times and availability information

### 🎯 User Experience
- **Progressive Workflow**: Step-by-step triage process with clear progress indicators
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: Voice input support and clear visual indicators
- **Professional Interface**: Healthcare-appropriate design with empathetic user experience

## 🏗️ Architecture

### Frontend Components
```
src/
├── components/
│   └── TriageAI.tsx          # Main triage interface
├── services/
│   └── triageService.ts      # API communication layer
└── types/                     # TypeScript interfaces
```

### Backend Services
```
backend/
├── triage_service.py         # Core AI triage logic
├── triage_api.py            # Flask REST API server
└── triage_requirements.txt   # Python dependencies
```

### System Flow
1. **User Input** → Text, voice, or image symptoms
2. **AI Processing** → Symptom analysis and triage assessment
3. **Resource Matching** → Healthcare facility recommendations
4. **Results Display** → Triage level, recommendations, and nearby resources

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key (optional, for enhanced AI capabilities)

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r triage_requirements.txt
```

### 2. Environment Setup

Create `.env.local` in the project root:
```bash
VITE_TRIAGE_API_URL=http://localhost:5000
```

Create `.env` in the backend directory:
```bash
FLASK_ENV=development
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key  # Optional
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
python triage_api.py

# Terminal 2: Frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173/triage-ai
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/

## 📱 Usage Guide

### 1. Symptom Input
- **Text Description**: Describe your symptoms in detail
- **Voice Input**: Use microphone for hands-free input
- **Image Upload**: Upload photos of visible symptoms (optional)

### 2. AI Analysis
- System processes symptoms using medical guidelines
- Provides triage level assessment (Emergency/Urgent/Routine/Self-Care)
- Generates personalized recommendations

### 3. Resource Discovery
- Automatically detects your location
- Finds nearby healthcare facilities
- Filters resources by triage level appropriateness
- Provides contact information and directions

### 4. Results and Next Steps
- Clear triage level with confidence score
- Immediate action recommendations
- Follow-up steps and monitoring guidelines
- Healthcare facility contact details

## 🔧 Configuration

### AI Model Configuration

#### OpenAI Integration (Recommended)
```python
# Set environment variable
export OPENAI_API_KEY="your-api-key"

# The service will automatically use GPT-4 for triage analysis
```

#### Local Model Fallback
```python
# Install local models
pip install transformers torch

# The service will fall back to local models if OpenAI is unavailable
```

### Healthcare Data Configuration

#### Custom Healthcare Resources
```python
# Add custom facilities to the database
resources = [
    {
        'name': 'Your Hospital',
        'type': 'hospital',
        'address': '123 Main St, City, State',
        'latitude': 37.7749,
        'longitude': -122.4194,
        'phone': '(555) 123-4567',
        'hours': '24/7',
        'accepts_insurance': True,
        'financial_aid': True
    }
]

# Update via API
POST /api/healthcare-data
{
    "resources": resources
}
```

#### Data Sources
- **Healthdata.gov**: Public healthcare facility data
- **OpenStreetMap**: Geographic and facility information
- **Custom APIs**: Integrate with existing healthcare systems

## 🧪 Testing

### Frontend Testing
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Testing
```bash
cd backend

# Run Python tests
python -m pytest

# Run with coverage
python -m pytest --cov=.

# Run specific test file
python -m pytest test_triage_service.py
```

### API Testing
```bash
# Test triage endpoint
curl -X POST http://localhost:5000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "textInput": "Sharp pain in lower right abdomen, feeling nauseous",
    "location": {"lat": 37.7749, "lng": -122.4194}
  }'

# Test resources endpoint
curl "http://localhost:5000/api/resources?lat=37.7749&lng=-122.4194&level=urgent"
```

## 📊 API Reference

### Triage Analysis
```http
POST /api/triage
Content-Type: application/json

{
  "textInput": "string",
  "imageData": "base64_string (optional)",
  "location": {
    "lat": number,
    "lng": number
  }
}
```

**Response:**
```json
{
  "status": "success",
  "triageResult": {
    "level": "urgent",
    "confidence": 0.85,
    "summary": "string",
    "recommendations": ["string"],
    "nextSteps": ["string"]
  },
  "healthcareResources": [...],
  "sessionId": "string"
}
```

### Healthcare Resources
```http
GET /api/resources?lat={latitude}&lng={longitude}&level={triage_level}
```

### Session Management
```http
GET /api/sessions/{session_id}
DELETE /api/sessions/{session_id}
```

### System Health
```http
GET /health
GET /metrics
```

## 🔒 Security Features

### Input Validation
- **Symptom Text**: Length limits and content filtering
- **Image Uploads**: File type and size validation
- **Location Data**: Coordinate range validation

### API Security
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **CORS Protection**: Controlled cross-origin access
- **Input Sanitization**: Prevents injection attacks

### Data Privacy
- **Session Management**: Temporary session storage
- **No PII Storage**: User data is not permanently stored
- **Secure Communication**: HTTPS encryption for all data

## 🚨 Medical Disclaimer

**IMPORTANT**: This AI system is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.

The system is designed to:
- Provide triage assessments based on symptoms
- Direct users to appropriate care levels
- Offer healthcare resource recommendations
- Support emergency situations with appropriate guidance

## 🛠️ Development

### Project Structure
```
demo-app-VISION-TRACK/
├── src/
│   ├── components/TriageAI.tsx
│   ├── services/triageService.ts
│   └── types/
├── backend/
│   ├── triage_service.py
│   ├── triage_api.py
│   └── triage_requirements.txt
└── docs/
    ├── TRIAGE_AI_README.md
    └── TRIAGE_AI_DEPLOYMENT.md
```

### Adding New Features

#### New Triage Levels
```typescript
// In TriageAI.tsx
const triageLevels = {
  emergency: { label: 'Emergency', color: 'bg-red-500', icon: AlertTriangle },
  urgent: { label: 'Urgent', color: 'bg-orange-500', icon: Clock },
  routine: { label: 'Routine', color: 'bg-blue-500', icon: Stethoscope },
  self_care: { label: 'Self-Care', color: 'bg-green-500', icon: Pill },
  // Add new level here
  observation: { label: 'Observation', color: 'bg-yellow-500', icon: Eye }
};
```

#### New Healthcare Resource Types
```python
# In triage_service.py
class HealthcareResource:
    type: str  # hospital, urgent_care, clinic, pharmacy, telemedicine, etc.
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📈 Performance Optimization

### Frontend Optimization
- **Lazy Loading**: Components load on demand
- **Image Optimization**: Compressed image uploads
- **Caching**: Local storage for session data

### Backend Optimization
- **Async Processing**: Non-blocking AI analysis
- **Database Indexing**: Optimized healthcare resource queries
- **Caching**: Redis-based result caching

### AI Model Optimization
- **Model Quantization**: Reduced model size for faster inference
- **Batch Processing**: Multiple requests processed together
- **Fallback Models**: Local models when cloud services are unavailable

## 🔍 Monitoring and Analytics

### System Metrics
- **Request Volume**: Total triage requests processed
- **Response Times**: API performance monitoring
- **Error Rates**: System reliability tracking
- **User Sessions**: Active user engagement

### Health Monitoring
- **Service Health**: Backend service status
- **AI Model Status**: Model availability and performance
- **Database Health**: Connection and query performance
- **External APIs**: Third-party service status

## 🚀 Deployment

### Production Deployment
See [TRIAGE_AI_DEPLOYMENT.md](./TRIAGE_AI_DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Production Setup
```bash
# Build frontend
npm run build

# Start production backend
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 triage_api:app

# Serve frontend with nginx
# (See deployment guide for nginx configuration)
```

## 🤝 Integration

### Existing Project Integration
The TRIAGE A.I. system is designed to integrate seamlessly with the Global Accelerator 2025 project:

- **Shared Design System**: Uses existing UI components and styling
- **Common Services**: Integrates with existing authentication and data services
- **Unified Navigation**: Accessible through the main application routing

### External System Integration
- **Healthcare APIs**: Integrate with existing healthcare systems
- **EHR Systems**: Connect with Electronic Health Record systems
- **Telemedicine Platforms**: Support for virtual care integration

## 📚 Additional Resources

### Documentation
- [Deployment Guide](./TRIAGE_AI_DEPLOYMENT.md)
- [API Reference](./API_REFERENCE.md)
- [Architecture Overview](./ARCHITECTURE.md)

### External Resources
- [Medical Triage Guidelines](https://www.acep.org/)
- [Healthcare Data Standards](https://www.hl7.org/)
- [AI in Healthcare Best Practices](https://www.fda.gov/ai-healthcare)

### Support
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check the docs folder for detailed guides

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic triage functionality
- ✅ Healthcare resource discovery
- ✅ Multi-modal input support
- ✅ Responsive web interface

### Phase 2 (Next)
- 🔄 Advanced AI model integration
- 🔄 Real-time collaboration features
- 🔄 Mobile application
- 🔄 Offline capability

### Phase 3 (Future)
- 📋 Integration with healthcare systems
- 📋 Advanced analytics and reporting
- 📋 Multi-language support
- 📋 Advanced security features

## 📄 License

This project is part of the Global Accelerator 2025 initiative. See the main project LICENSE file for details.

## 🙏 Acknowledgments

- **Medical Professionals**: For guidance on triage protocols
- **AI Research Community**: For open-source AI models and tools
- **Healthcare Data Providers**: For facility and resource information
- **Open Source Contributors**: For the tools and libraries that make this possible

---

**Built with ❤️ for the Global Accelerator 2025 Hackathon**

*Remember: This is a demonstration system. Always consult healthcare professionals for medical advice.*

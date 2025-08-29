# TRIAGE A.I. Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the TRIAGE A.I. system, from local development to production deployment. The system consists of:

- **Frontend**: React-based web application with TypeScript
- **Backend**: Flask API server with AI/ML capabilities
- **AI Services**: Medical triage analysis and computer vision
- **Database**: Healthcare resources and session management

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [AI Model Deployment](#ai-model-deployment)
6. [Production Deployment](#production-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Python**: 3.8+ (3.11+ recommended)
- **Node.js**: 18+ (20+ recommended)
- **Memory**: 8GB+ RAM (16GB+ for AI models)
- **Storage**: 50GB+ available space
- **GPU**: NVIDIA GPU with CUDA support (optional, for local AI models)

### Software Dependencies

- **Git**: For version control
- **Docker**: For containerized deployment
- **Docker Compose**: For multi-service orchestration
- **PostgreSQL**: For production database (optional)
- **Redis**: For caching and session management (optional)

### API Keys and Services

- **OpenAI API Key**: For GPT-4 triage analysis
- **Google Cloud Vision API**: For image analysis (optional)
- **Hugging Face**: For alternative AI models
- **Map Services**: Google Maps, OpenStreetMap, or similar

## Local Development Setup

### 1. Clone and Setup Repository

```bash
# Clone the repository
git clone <repository-url>
cd global-accelerator-2025/demo-app-VISION-TRACK

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
cd backend
pip install -r triage_requirements.txt
```

### 2. Environment Configuration

Create `.env` file in the backend directory:

```bash
# Backend Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
PORT=5000

# AI Services
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_TOKEN=your-huggingface-token

# Database
DATABASE_URL=sqlite:///healthcare_resources.db

# Optional Services
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS=path/to/credentials.json

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Frontend Setup

```bash
# Install Node.js dependencies
cd ../
npm install

# Set environment variables
echo "VITE_TRIAGE_API_URL=http://localhost:5000" > .env.local
```

### 4. Start Development Servers

```bash
# Terminal 1: Start Backend
cd backend
python triage_api.py

# Terminal 2: Start Frontend
cd ../
npm run dev
```

## Backend Deployment

### 1. Production Dependencies

Install production dependencies:

```bash
pip install gunicorn uvicorn supervisor
```

### 2. Gunicorn Configuration

Create `gunicorn.conf.py`:

```python
# Gunicorn configuration
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2
preload_app = True
```

### 3. Supervisor Configuration

Create `/etc/supervisor/conf.d/triage-ai.conf`:

```ini
[program:triage-ai]
command=/path/to/venv/bin/gunicorn -c gunicorn.conf.py triage_api:app
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/triage-ai/app.log
environment=FLASK_ENV="production"
```

### 4. Systemd Service (Alternative)

Create `/etc/systemd/system/triage-ai.service`:

```ini
[Unit]
Description=TRIAGE A.I. Backend Service
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/venv/bin
ExecStart=/path/to/venv/bin/gunicorn -c gunicorn.conf.py triage_api:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Frontend Deployment

### 1. Build Production Version

```bash
# Build the application
npm run build

# The build output will be in the `dist` directory
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/triage-ai`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Frontend
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 3. Enable Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/triage-ai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## AI Model Deployment

### 1. OpenAI Integration

```python
# In triage_service.py
import os
from openai import AsyncOpenAI

class TriageAIService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        )
```

### 2. Local Model Deployment

For offline deployment, use local transformer models:

```python
# Install local models
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Download and cache models
model_name = "microsoft/DialoGPT-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Save locally
tokenizer.save_pretrained("./models/triage-model")
model.save_pretrained("./models/triage-model")
```

### 3. Model Optimization

```python
# Quantization for faster inference
from transformers import AutoModelForSequenceClassification
import torch

model = AutoModelForSequenceClassification.from_pretrained("./models/triage-model")
model = torch.quantization.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
torch.save(model, "./models/triage-model-quantized.pt")
```

## Production Deployment

### 1. Docker Deployment

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  triage-backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/triage_ai
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
      - ./models:/app/models

  triage-frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - triage-backend
    volumes:
      - ./ssl:/etc/nginx/ssl

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=triage_ai
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2. Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: triage-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: triage-backend
  template:
    metadata:
      labels:
        app: triage-backend
    spec:
      containers:
      - name: triage-backend
        image: triage-ai:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: triage-backend-service
spec:
  selector:
    app: triage-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

### 3. Environment-Specific Configs

Create configuration files for different environments:

```python
# config/production.py
class ProductionConfig:
    DEBUG = False
    TESTING = False
    DATABASE_URL = os.getenv('DATABASE_URL')
    REDIS_URL = os.getenv('REDIS_URL')
    LOG_LEVEL = 'INFO'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',')
```

## Monitoring and Maintenance

### 1. Health Checks

```python
# Add health check endpoints
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'database': check_database_connection(),
            'ai_models': check_ai_models(),
            'external_apis': check_external_apis()
        }
    })
```

### 2. Logging Configuration

```python
# Configure structured logging
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

### 3. Metrics and Monitoring

```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, generate_latest

# Define metrics
TRIAGE_REQUESTS = Counter('triage_requests_total', 'Total triage requests')
TRIAGE_PROCESSING_TIME = Histogram('triage_processing_seconds', 'Triage processing time')

@app.route('/metrics')
def metrics():
    return generate_latest()

# Use metrics in triage processing
@TRIAGE_PROCESSING_TIME.time()
async def analyze_symptoms(self, request: TriageRequest) -> TriageResult:
    TRIAGE_REQUESTS.inc()
    # ... existing code
```

## Security Considerations

### 1. API Security

```python
# Rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/triage', methods=['POST'])
@limiter.limit("10 per minute")
def triage_endpoint():
    # ... existing code
```

### 2. Input Validation

```python
# Validate and sanitize inputs
from marshmallow import Schema, fields, validate

class TriageRequestSchema(Schema):
    text_input = fields.Str(required=True, validate=validate.Length(min=10, max=1000))
    image_data = fields.Str(validate=validate.Length(max=10485760))  # 10MB max
    location = fields.Dict(keys=fields.Str(), values=fields.Float())

# Use in endpoint
@app.route('/api/triage', methods=['POST'])
def triage_endpoint():
    schema = TriageRequestSchema()
    try:
        validated_data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400
```

### 3. Authentication and Authorization

```python
# JWT-based authentication
from flask_jwt_extended import JWTManager, jwt_required, create_access_token

jwt = JWTManager(app)

@app.route('/api/triage', methods=['POST'])
@jwt_required()
def triage_endpoint():
    # ... existing code
```

## Troubleshooting

### Common Issues

1. **AI Model Loading Failures**
   - Check GPU drivers and CUDA installation
   - Verify model file paths and permissions
   - Monitor memory usage during model loading

2. **Database Connection Issues**
   - Verify database credentials and network access
   - Check database service status
   - Review connection pool settings

3. **Performance Issues**
   - Monitor CPU and memory usage
   - Check API response times
   - Review database query performance

### Debug Mode

Enable debug mode for troubleshooting:

```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python triage_api.py
```

### Log Analysis

```bash
# View application logs
tail -f /var/log/triage-ai/app.log

# View nginx access logs
tail -f /var/log/nginx/access.log

# View system logs
journalctl -u triage-ai -f
```

## Performance Optimization

### 1. Caching Strategy

```python
# Redis caching for triage results
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiry=3600):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"triage:{hash(str(args) + str(kwargs))}"
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expiry, json.dumps(result))
            return result
        return wrapper
    return decorator
```

### 2. Database Optimization

```sql
-- Create indexes for healthcare resources
CREATE INDEX idx_resources_location ON healthcare_resources(latitude, longitude);
CREATE INDEX idx_resources_type ON healthcare_resources(type);
CREATE INDEX idx_resources_rating ON healthcare_resources(rating);

-- Partition large tables by date
CREATE TABLE triage_sessions_2025 PARTITION OF triage_sessions
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 3. Load Balancing

```nginx
# Nginx upstream configuration
upstream triage_backend {
    least_conn;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    location /api/ {
        proxy_pass http://triage_backend;
        # ... other proxy settings
    }
}
```

## Conclusion

This deployment guide covers the essential aspects of deploying the TRIAGE A.I. system. Remember to:

- Test thoroughly in staging environments before production
- Monitor system performance and health continuously
- Keep security patches and dependencies up to date
- Document any environment-specific configurations
- Have a rollback plan for critical deployments

For additional support or questions, refer to the project documentation or create an issue in the repository.

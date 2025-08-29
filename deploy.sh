#!/bin/bash

# TRIAGE A.I. Deployment Script
# This script deploys the TRIAGE A.I. system for production use

set -e  # Exit on any error

echo "🚀 Starting TRIAGE A.I. Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f2)
if [ "$PYTHON_VERSION" -lt 8 ]; then
    print_error "Python 3.8+ is required. Current version: $(python3 --version)"
    exit 1
fi

print_success "Python version: $(python3 --version)"

# Check pip
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3 first."
    exit 1
fi

print_success "pip3 is available"

print_status "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

print_status "Installing backend dependencies..."
cd backend
pip3 install -r triage_requirements.txt

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

print_status "Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

print_status "Setting up environment files..."

# Create production environment files
if [ ! -f ".env.production" ]; then
    cat > .env.production << EOF
# TRIAGE A.I. Production Environment
VITE_TRIAGE_API_URL=http://localhost:5000
VITE_APP_NAME=TRIAGE A.I.
VITE_APP_VERSION=1.0.0
EOF
    print_success "Production environment file created"
fi

if [ ! -f "backend/.env.production" ]; then
    cat > backend/.env.production << EOF
# TRIAGE A.I. Production Backend Environment
FLASK_ENV=production
SECRET_KEY=$(openssl rand -hex 32)
PORT=5000
DEBUG=False

# Database Configuration
DATABASE_URL=sqlite:///healthcare_resources.db

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173

# Logging
LOG_LEVEL=INFO
LOG_FILE=triage_ai.log
EOF
    print_success "Production backend environment file created"
fi

print_status "Creating production startup scripts..."

# Create production startup script
cat > start-production.sh << 'EOF'
#!/bin/bash

echo "🏥 Starting TRIAGE A.I. Production System..."

# Start backend
echo "Starting backend server..."
cd backend
export $(cat .env.production | xargs)
python3 triage_api.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend (if using a simple server)
echo "Starting frontend server..."
cd ..
npx serve -s dist -l 3000 &
FRONTEND_PID=$!

echo "✅ TRIAGE A.I. system is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-production.sh

# Create development startup script
cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🔬 Starting TRIAGE A.I. Development System..."

# Start backend
echo "Starting backend server..."
cd backend
export $(cat env | xargs)
python3 triage_api.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend development server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo "✅ TRIAGE A.I. development system is running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-dev.sh

print_status "Creating systemd service file..."

# Create systemd service file
sudo tee /etc/systemd/system/triage-ai.service > /dev/null << EOF
[Unit]
Description=TRIAGE A.I. Medical Triage System
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/backend/venv/bin
ExecStart=$(pwd)/start-production.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service file created"

print_status "Setting up database..."
cd backend
python3 -c "
from triage_service import TriageAIService
try:
    service = TriageAIService()
    print('Database initialized successfully')
except Exception as e:
    print(f'Database initialization failed: {e}')
"

cd ..

print_status "Testing the system..."

# Test backend health
if curl -s http://localhost:5000/ > /dev/null; then
    print_success "Backend is responding"
else
    print_warning "Backend is not responding (may not be running yet)"
fi

echo ""
print_success "🎉 TRIAGE A.I. deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start development: ./start-dev.sh"
echo "2. Start production: ./start-production.sh"
echo "3. Enable systemd service: sudo systemctl enable triage-ai"
echo "4. Start systemd service: sudo systemctl start triage-ai"
echo ""
echo "🌐 Access URLs:"
echo "   - Development: http://localhost:5173/triage-ai"
echo "   - Production: http://localhost:3000/triage-ai"
echo "   - Backend API: http://localhost:5000"
echo ""
echo "📚 Documentation: docs/TRIAGE_AI_DEPLOYMENT.md"
echo ""
print_success "Ready to save lives with AI-powered triage! 🚑"

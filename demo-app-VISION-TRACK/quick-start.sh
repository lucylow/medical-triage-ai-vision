#!/bin/bash

# TRIAGE A.I. Quick Start Script
# Fast deployment for hackathon and demo purposes

echo "🚑 TRIAGE A.I. Quick Start - Saving Lives with AI! 🚑"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

print_status "🚀 Starting TRIAGE A.I. Quick Deployment..."

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_status "🐳 Docker detected - Using containerized deployment"
    
    # Create .env file for Docker
    if [ ! -f ".env" ]; then
        cat > .env << EOF
SECRET_KEY=triage-ai-quick-start-2025
EOF
        print_success "Docker environment file created"
    fi
    
    # Start with Docker Compose
    print_status "Starting TRIAGE A.I. with Docker Compose..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "🎉 TRIAGE A.I. is now running with Docker!"
        echo ""
        echo "🌐 Access URLs:"
        echo "   - Frontend: http://localhost:3000/triage-ai"
        echo "   - Backend API: http://localhost:5000"
        echo "   - Health Check: http://localhost:5000/"
        echo ""
        echo "📋 Docker Commands:"
        echo "   - View logs: docker-compose logs -f"
        echo "   - Stop: docker-compose down"
        echo "   - Restart: docker-compose restart"
        echo ""
        print_success "Ready to save lives! 🚑"
    else
        print_warning "Docker deployment failed, falling back to local deployment..."
    fi
else
    print_status "🐳 Docker not available - Using local deployment"
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd backend
    pip3 install -r triage_requirements.txt
    cd ..
    
    print_success "Dependencies installed"
    
    # Start services
    print_status "Starting TRIAGE A.I. services..."
    
    # Start backend
    cd backend
    export $(cat env | xargs)
    python3 triage_api.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 3
    
    # Start frontend
    npm run dev &
    FRONTEND_PID=$!
    
    print_success "🎉 TRIAGE A.I. is now running locally!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   - Frontend: http://localhost:5173/triage-ai"
    echo "   - Backend API: http://localhost:5000"
    echo "   - Health Check: http://localhost:5000/"
    echo ""
    echo "📋 To stop services:"
    echo "   - Press Ctrl+C in this terminal"
    echo "   - Or run: kill $BACKEND_PID $FRONTEND_PID"
    echo ""
    print_success "Ready to save lives! 🚑"
    
    # Wait for interrupt
    trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi

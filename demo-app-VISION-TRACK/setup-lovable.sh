#!/bin/bash

# Medical Triage AI Vision - Lovable Setup Script
# This script helps set up the Lovable integration

set -e

echo "🔧 Setting up Lovable integration for Medical Triage AI Vision..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js v18 or higher."
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm $(npm -v) is installed"

# Install project dependencies
print_status "Installing project dependencies..."
npm install

# Check if Lovable CLI is installed
if ! command -v lovable &> /dev/null; then
    print_warning "Lovable CLI not found. Installing..."
    npm install -g @lovable/cli
    print_success "Lovable CLI installed"
else
    print_success "Lovable CLI is already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating environment configuration file..."
    cat > .env.local << EOF
# Lovable Configuration
LOVABLE_API_KEY=your_lovable_api_key_here
LOVABLE_PROJECT_ID=medical-triage-ai-vision

# App Configuration
VITE_APP_TITLE=Medical Triage AI Vision
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Build Configuration
NODE_ENV=development
VITE_BUILD_MODE=development
EOF
    print_success "Created .env.local file"
    print_warning "Please update LOVABLE_API_KEY in .env.local with your actual API key"
else
    print_success ".env.local file already exists"
fi

# Test the build
print_status "Testing the build process..."
npm run build:lovable

if [ -d "dist" ]; then
    print_success "Build test completed successfully"
else
    print_error "Build test failed"
    exit 1
fi

# Display next steps
echo ""
print_success "Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Get your Lovable API key from https://lovable.dev/dashboard"
echo "2. Update the LOVABLE_API_KEY in .env.local"
echo "3. Deploy to Lovable using one of these methods:"
echo "   - Run: ./deploy-lovable.sh (Linux/Mac)"
echo "   - Run: deploy-lovable.bat (Windows)"
echo "   - Run: npm run deploy:lovable"
echo ""
echo "📖 For more information, see: LOVABLE_DEPLOYMENT.md"
echo "🌐 Your app will be available at: https://medical-triage-ai-vision.lovable.dev"
echo ""
echo "🔧 To start development: npm run dev"
echo "🧪 To run tests: npm run test"
echo "🏗️  To build: npm run build:lovable"

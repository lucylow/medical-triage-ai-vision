#!/bin/bash

# Medical Triage AI Vision - Lovable Deployment Script
# This script deploys the application to Lovable platform

set -e

echo "🚀 Starting Lovable deployment for Medical Triage AI Vision..."

# Check if Lovable CLI is installed
if ! command -v lovable &> /dev/null; then
    echo "❌ Lovable CLI not found. Please install it first:"
    echo "   npm install -g @lovable/cli"
    echo "   or visit: https://lovable.dev/docs/getting-started"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application for production
echo "🔨 Building application for production..."
npm run build:lovable

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Lovable
echo "🚀 Deploying to Lovable..."
lovable deploy

echo "🎉 Deployment completed!"
echo "🌐 Your app should be available at: https://medical-triage-ai-vision.lovable.dev"
echo ""
echo "📊 To view analytics and manage your deployment:"
echo "   Visit: https://lovable.dev/dashboard"

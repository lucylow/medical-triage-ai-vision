@echo off
REM Medical Triage AI Vision - Lovable Deployment Script for Windows
REM This script deploys the application to Lovable platform

echo 🚀 Starting Lovable deployment for Medical Triage AI Vision...

REM Check if Lovable CLI is installed
where lovable >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Lovable CLI not found. Please install it first:
    echo    npm install -g @lovable/cli
    echo    or visit: https://lovable.dev/docs/getting-started
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "vite.config.ts" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the application for production
echo 🔨 Building application for production...
npm run build:lovable

REM Check if build was successful
if not exist "dist" (
    echo ❌ Build failed - dist directory not found
    pause
    exit /b 1
)

echo ✅ Build completed successfully

REM Deploy to Lovable
echo 🚀 Deploying to Lovable...
lovable deploy

echo 🎉 Deployment completed!
echo 🌐 Your app should be available at: https://medical-triage-ai-vision.lovable.dev
echo.
echo 📊 To view analytics and manage your deployment:
echo    Visit: https://lovable.dev/dashboard

pause

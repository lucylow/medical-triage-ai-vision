@echo off
REM Medical Triage AI Vision - Lovable Setup Script for Windows
REM This script helps set up the Lovable integration

echo 🔧 Setting up Lovable integration for Medical Triage AI Vision...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% is installed

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% is installed

REM Install project dependencies
echo 📦 Installing project dependencies...
npm install

REM Check if Lovable CLI is installed
where lovable >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Lovable CLI not found. Installing...
    npm install -g @lovable/cli
    echo ✅ Lovable CLI installed
) else (
    echo ✅ Lovable CLI is already installed
)

REM Create .env file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating environment configuration file...
    (
        echo # Lovable Configuration
        echo LOVABLE_API_KEY=your_lovable_api_key_here
        echo LOVABLE_PROJECT_ID=medical-triage-ai-vision
        echo.
        echo # App Configuration
        echo VITE_APP_TITLE=Medical Triage AI Vision
        echo VITE_APP_VERSION=1.0.0
        echo VITE_APP_ENVIRONMENT=development
        echo.
        echo # Build Configuration
        echo NODE_ENV=development
        echo VITE_BUILD_MODE=development
    ) > .env.local
    echo ✅ Created .env.local file
    echo ⚠️  Please update LOVABLE_API_KEY in .env.local with your actual API key
) else (
    echo ✅ .env.local file already exists
)

REM Test the build
echo 🔨 Testing the build process...
npm run build:lovable

if exist "dist" (
    echo ✅ Build test completed successfully
) else (
    echo ❌ Build test failed
    pause
    exit /b 1
)

REM Display next steps
echo.
echo 🎉 Setup completed successfully!
echo.
echo 🚀 Next steps:
echo 1. Get your Lovable API key from https://lovable.dev/dashboard
echo 2. Update the LOVABLE_API_KEY in .env.local
echo 3. Deploy to Lovable using one of these methods:
echo    - Run: deploy-lovable.bat
echo    - Run: npm run deploy:lovable
echo.
echo 📖 For more information, see: LOVABLE_DEPLOYMENT.md
echo 🌐 Your app will be available at: https://medical-triage-ai-vision.lovable.dev
echo.
echo 🔧 To start development: npm run dev
echo 🧪 To run tests: npm run test
echo 🏗️  To build: npm run build:lovable

pause

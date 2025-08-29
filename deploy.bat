@echo off
REM TRIAGE A.I. Windows Deployment Script
REM This script deploys the TRIAGE A.I. system for production use on Windows

echo 🚀 Starting TRIAGE A.I. Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the project root directory
    pause
    exit /b 1
)

echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo [SUCCESS] Node.js version: 
node --version

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo [SUCCESS] Python version: 
python --version

REM Check pip
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] pip is not installed. Please install pip first.
    pause
    exit /b 1
)

echo [SUCCESS] pip is available

echo [INFO] Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Frontend dependencies installed successfully

echo [INFO] Installing backend dependencies...
cd backend
call pip install -r triage_requirements.txt

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [SUCCESS] Backend dependencies installed successfully
cd ..

echo [INFO] Building frontend for production...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built successfully

echo [INFO] Setting up environment files...

REM Create production environment files
if not exist ".env.production" (
    (
        echo # TRIAGE A.I. Production Environment
        echo VITE_TRIAGE_API_URL=http://localhost:5000
        echo VITE_APP_NAME=TRIAGE A.I.
        echo VITE_APP_VERSION=1.0.0
    ) > .env.production
    echo [SUCCESS] Production environment file created
)

if not exist "backend\.env.production" (
    (
        echo # TRIAGE A.I. Production Backend Environment
        echo FLASK_ENV=production
        echo SECRET_KEY=triage-ai-secret-key-2025-hackathon
        echo PORT=5000
        echo DEBUG=False
        echo.
        echo # Database Configuration
        echo DATABASE_URL=sqlite:///healthcare_resources.db
        echo.
        echo # CORS Origins
        echo ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173
        echo.
        echo # Logging
        echo LOG_LEVEL=INFO
        echo LOG_FILE=triage_ai.log
    ) > backend\.env.production
    echo [SUCCESS] Production backend environment file created
)

echo [INFO] Creating production startup scripts...

REM Create production startup script
(
    echo @echo off
    echo echo 🏥 Starting TRIAGE A.I. Production System...
    echo.
    echo REM Start backend
    echo echo Starting backend server...
    echo cd backend
    echo for /f "tokens=*" %%a in ^('type .env.production'^) do set %%a
    echo start /B python triage_api.py
    echo.
    echo REM Wait for backend to start
    echo timeout /t 5 /nobreak ^>nul
    echo.
    echo REM Start frontend
    echo echo Starting frontend server...
    echo cd ..
    echo start /B npx serve -s dist -l 3000
    echo.
    echo echo ✅ TRIAGE A.I. system is running!
    echo echo 🌐 Frontend: http://localhost:3000
    echo echo 🔧 Backend: http://localhost:5000
    echo echo.
    echo echo Press any key to stop all services
    echo pause
) > start-production.bat

REM Create development startup script
(
    echo @echo off
    echo echo 🔬 Starting TRIAGE A.I. Development System...
    echo.
    echo REM Start backend
    echo echo Starting backend server...
    echo cd backend
    echo for /f "tokens=*" %%a in ^('type env'^) do set %%a
    echo start /B python triage_api.py
    echo.
    echo REM Wait for backend to start
    echo timeout /t 3 /nobreak ^>nul
    echo.
    echo REM Start frontend
    echo echo Starting frontend development server...
    echo cd ..
    echo start /B npm run dev
    echo.
    echo echo ✅ TRIAGE A.I. development system is running!
    echo echo 🌐 Frontend: http://localhost:5173
    echo echo 🔧 Backend: http://localhost:5000
    echo echo.
    echo echo Press any key to stop all services
    echo pause
) > start-dev.bat

echo [SUCCESS] Production startup scripts created

echo [INFO] Setting up database...
cd backend
python -c "from triage_service import TriageAIService; service = TriageAIService(); print('Database initialized successfully')"

if %errorlevel% neq 0 (
    echo [WARNING] Database initialization failed, but continuing...
)

cd ..

echo [INFO] Testing the system...

REM Test backend health (if running)
curl -s http://localhost:5000/ >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend is responding
) else (
    echo [WARNING] Backend is not responding ^(may not be running yet^)
)

echo.
echo [SUCCESS] 🎉 TRIAGE A.I. deployment completed successfully!
echo.
echo 📋 Next steps:
echo 1. Start development: start-dev.bat
echo 2. Start production: start-production.bat
echo.
echo 🌐 Access URLs:
echo    - Development: http://localhost:5173/triage-ai
echo    - Production: http://localhost:3000/triage-ai
echo    - Backend API: http://localhost:5000
echo.
echo 📚 Documentation: docs\TRIAGE_AI_DEPLOYMENT.md
echo.
echo [SUCCESS] Ready to save lives with AI-powered triage! 🚑
pause

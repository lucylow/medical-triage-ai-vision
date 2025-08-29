@echo off
REM TRIAGE A.I. Windows Quick Start Script
REM Fast deployment for hackathon and demo purposes

echo 🚑 TRIAGE A.I. Quick Start - Saving Lives with AI! 🚑
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo [INFO] 🚀 Starting TRIAGE A.I. Quick Deployment...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [INFO] 🐳 Docker detected - Using containerized deployment
        
        REM Create .env file for Docker
        if not exist ".env" (
            (
                echo SECRET_KEY=triage-ai-quick-start-2025
            ) > .env
            echo [SUCCESS] Docker environment file created
        )
        
        REM Start with Docker Compose
        echo [INFO] Starting TRIAGE A.I. with Docker Compose...
        docker-compose up -d
        
        if %errorlevel% equ 0 (
            echo [SUCCESS] 🎉 TRIAGE A.I. is now running with Docker!
            echo.
            echo 🌐 Access URLs:
            echo    - Frontend: http://localhost:3000/triage-ai
            echo    - Backend API: http://localhost:5000
            echo    - Health Check: http://localhost:5000/
            echo.
            echo 📋 Docker Commands:
            echo    - View logs: docker-compose logs -f
            echo    - Stop: docker-compose down
            echo    - Restart: docker-compose restart
            echo.
            echo [SUCCESS] Ready to save lives! 🚑
        ) else (
            echo [WARNING] Docker deployment failed, falling back to local deployment...
            goto local_deployment
        )
    ) else (
        echo [WARNING] Docker Compose not available, using local deployment...
        goto local_deployment
    )
) else (
    echo [INFO] 🐳 Docker not available - Using local deployment
    goto local_deployment
)

goto end

:local_deployment
echo [INFO] Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo [SUCCESS] Prerequisites check passed

REM Install dependencies
echo [INFO] Installing frontend dependencies...
call npm install

echo [INFO] Installing backend dependencies...
cd backend
call pip install -r triage_requirements.txt
cd ..

echo [SUCCESS] Dependencies installed

REM Start services
echo [INFO] Starting TRIAGE A.I. services...

REM Start backend
cd backend
for /f "tokens=*" %%a in ('type env') do set %%a
start /B python triage_api.py
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
start /B npm run dev

echo [SUCCESS] 🎉 TRIAGE A.I. is now running locally!
echo.
echo 🌐 Access URLs:
echo    - Frontend: http://localhost:5173/triage-ai
echo    - Backend API: http://localhost:5000
echo    - Health Check: http://localhost:5000/
echo.
echo 📋 To stop services:
echo    - Close the terminal windows
echo    - Or use Task Manager to end Node.js and Python processes
echo.
echo [SUCCESS] Ready to save lives! 🚑

:end
echo.
echo Press any key to exit...
pause >nul

@echo off
echo 🚀 Setting up Pouch - Read Later App
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating server environment file...
    copy env.example .env
    echo ⚠️  Please update the JWT_SECRET in server\.env for production use!
)

cd ..

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo 🎉 Installation complete!
echo.
echo To start the development servers:
echo   npm run dev
echo.
echo This will start:
echo   - Backend server on http://localhost:3001
echo   - Frontend app on http://localhost:5173
echo.
echo 📖 Check the README.md for more information!
echo.
pause 
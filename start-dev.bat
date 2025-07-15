@echo off
echo 🎯 Starting SaveSquad Development Environment
echo =============================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Please run this script from the savesquad root directory
    exit /b 1
)

REM Start frontend development server
echo 📱 Starting frontend development server...
cd frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

echo 🚀 Starting Vite development server on http://localhost:5173
npm run dev

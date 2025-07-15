#!/bin/bash

echo "🎯 Starting SaveSquad Development Environment"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the savesquad root directory"
    exit 1
fi

# Start frontend development server
echo "📱 Starting frontend development server..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting Vite development server on http://localhost:5173"
npm run dev

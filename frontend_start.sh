#!/bin/bash

# Frontend Startup Script - NEWS Web Series Management System
# Start React Frontend Development Server

echo "========================================="
echo "  Starting NEWS Frontend Server"
echo "========================================="

# Change to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    echo "Please install npm"
    exit 1
fi

# Display Node.js and npm versions
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed, installing..."
    echo "This may take a few minutes..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo "Dependencies installed successfully"
else
    echo "Dependencies already installed"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json file does not exist"
    exit 1
fi

# Start React development server
echo ""
echo "========================================="
echo "Starting React Development Server..."
echo "========================================="
echo "Frontend address: http://localhost:3000"
echo "Backend API: http://localhost:5000/api"
echo ""
echo "Browser will open automatically"
echo "Press Ctrl+C to stop server"
echo "========================================="
echo ""

# Set environment variables
export REACT_APP_API_URL=http://localhost:5000/api

# Run React development server
npm start

# Exit message
echo ""
echo "Frontend server stopped"

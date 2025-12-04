#!/bin/bash

# Backend Startup Script - NEWS Web Series Management System
# Start Flask Backend Server

echo "========================================="
echo "  Starting NEWS Backend Server"
echo "========================================="

# Change to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment does not exist"
    echo "Please run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file does not exist"
    echo "Copying from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env file, please modify configuration as needed"
    else
        echo "ERROR: .env.example file also does not exist"
        exit 1
    fi
fi

# Check if dependencies are installed
echo "Checking dependencies..."
pip list | grep Flask > /dev/null
if [ $? -ne 0 ]; then
    echo "WARNING: Dependencies not installed, installing..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check database connection
echo "Checking database connection..."
python3 -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.engine.connect()" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "WARNING: Unable to connect to database"
    echo "Please ensure MySQL service is running and database configuration is correct"
    echo "Database config: $DATABASE_URL"
    echo ""
    read -p "Continue starting server? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Flask server
echo ""
echo "========================================="
echo "Starting Flask Development Server..."
echo "========================================="
echo "Server address: http://${HOST}:${PORT}"
echo "Health check: http://${HOST}:${PORT}/api/health"
echo "Environment: ${FLASK_ENV}"
echo ""
echo "Press Ctrl+C to stop server"
echo "========================================="
echo ""

# Run Flask application
python3 run.py

# Exit message
echo ""
echo "Backend server stopped"
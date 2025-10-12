#!/bin/bash

# Advanced Intelligence Field Force Systems (AIFF) - Quick Start Script
# This script helps you quickly start the AIFF system

echo "🚀 Starting Advanced Intelligence Field Force Systems (AIFF)"
echo "=========================================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend_server.py" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3004 | xargs kill -9 2>/dev/null || true

# Start the backend server
echo "🔧 Starting backend server (Python Flask)..."
python3 backend_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend server
echo "🌐 Starting frontend server (Python HTTP)..."
python3 -m http.server 3004 --directory client &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 2

echo ""
echo "🎉 AIFF System is now running!"
echo "================================"
echo "📊 Main Dashboard: http://localhost:3004/public/"
echo "👥 Field Portal:   http://localhost:3004/public/field-portal.html"
echo "🔗 API Base:       http://localhost:5001/api/"
echo ""
echo "📱 Features Available:"
echo "   • Malaysian map view with real-time tracking"
echo "   • AI-powered field team management"
echo "   • Predictive planning and material forecasting"
echo "   • Network troubleshooting ticket system"
echo "   • Zone-based performance analytics"
echo "   • Responsive design for all devices"
echo ""
echo "🛑 To stop the system, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping AIFF System..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ System stopped successfully."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "⏳ System is running... Press Ctrl+C to stop."
wait

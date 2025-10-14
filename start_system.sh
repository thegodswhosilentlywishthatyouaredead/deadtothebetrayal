#!/bin/bash

# AIFF System Startup Script
# Starts all required services with clean ports

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🚀 Starting AIFF System Services 🚀               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing instances
echo "🧹 Cleaning up existing servers..."
pkill -f "python3.*backend_server" 2>/dev/null
pkill -f "python3.*http.server.*8080" 2>/dev/null
sleep 2

# Check if ports are free
echo "🔍 Checking port availability..."

if lsof -i:5002 >/dev/null 2>&1; then
    echo "⚠️  Port 5002 is in use, attempting to free it..."
    lsof -ti:5002 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -i:8080 >/dev/null 2>&1; then
    echo "⚠️  Port 8080 is in use, attempting to free it..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start Backend Server
echo ""
echo "🔧 Starting Backend API Server..."
cd /Users/thegods/intelligent-field-assignment
nohup python3 backend_server.py > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Check if backend started
if lsof -i:5002 >/dev/null 2>&1; then
    echo "✅ Backend Server running on port 5002"
    echo "   PID: $BACKEND_PID"
else
    echo "❌ Failed to start backend server"
    echo "   Check backend.log for errors"
    exit 1
fi

# Start Frontend Server
echo ""
echo "🌐 Starting Frontend Server..."
nohup python3 -m http.server 8080 --directory client > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 2

# Check if frontend started
if lsof -i:8080 >/dev/null 2>&1; then
    echo "✅ Frontend Server running on port 8080"
    echo "   PID: $FRONTEND_PID"
else
    echo "❌ Failed to start frontend server"
    echo "   Check frontend.log for errors"
    exit 1
fi

# Test backend health
echo ""
echo "🔍 Testing system health..."
sleep 1

HEALTH_CHECK=$(curl -s http://localhost:5002/health)
if [ $? -eq 0 ]; then
    echo "✅ Backend health check passed"
    echo "   Response: $HEALTH_CHECK" | head -c 100
    echo ""
else
    echo "❌ Backend health check failed"
fi

# Display summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              ✅ AIFF SYSTEM READY! ✅                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 RUNNING SERVICES:"
echo "   ✅ Backend API:  http://localhost:5002"
echo "   ✅ Frontend UI:  http://localhost:8080"
echo ""
echo "🌐 ACCESS POINTS:"
echo "   📱 Main Dashboard:  http://localhost:8080/public/index.html"
echo "   👷 Field Portal:    http://localhost:8080/public/field-portal.html"
echo ""
echo "📝 LOGS:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 TO STOP:"
echo "   pkill -f backend_server"
echo "   pkill -f \"http.server.*8080\""
echo ""
echo "🎯 OPEN YOUR BROWSER AND GO TO:"
echo "   http://localhost:8080/public/index.html"
echo ""
echo "═══════════════════════════════════════════════════════════════"


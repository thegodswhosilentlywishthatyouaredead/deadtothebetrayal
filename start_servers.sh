#!/bin/bash

echo "🚀 Starting FieldAssign Full Stack Application..."
echo ""

# Kill any existing servers
echo "🔄 Stopping any existing servers..."
pkill -f "python3 -m http.server" 2>/dev/null
pkill -f "backend_server.py" 2>/dev/null

# Start backend server
echo "🔧 Starting backend server on port 5001..."
cd /Users/thegods/intelligent-field-assignment
python3 backend_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 3000..."
python3 -m http.server 3000 --directory client &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 2

echo ""
echo "✅ Both servers are now running!"
echo ""
echo "📊 Backend API: http://localhost:5001"
echo "🌐 Frontend Dashboard: http://localhost:3000"
echo ""
echo "🎯 Open your browser and go to: http://localhost:3000"
echo ""
echo "🔧 To stop servers, press Ctrl+C or run: pkill -f 'python3'"
echo ""

# Keep script running
wait

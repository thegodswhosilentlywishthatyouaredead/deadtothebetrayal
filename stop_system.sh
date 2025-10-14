#!/bin/bash

# AIFF System Stop Script
# Cleanly stops all AIFF services

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🛑 Stopping AIFF System Services 🛑               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Stop Backend Server
echo "🔧 Stopping Backend Server (port 5002)..."
pkill -f "python3.*backend_server"
sleep 1

if lsof -i:5002 >/dev/null 2>&1; then
    echo "⚠️  Backend still running, force killing..."
    lsof -ti:5002 | xargs kill -9 2>/dev/null
else
    echo "✅ Backend Server stopped"
fi

# Stop Frontend Server
echo ""
echo "🌐 Stopping Frontend Server (port 8080)..."
pkill -f "python3.*http.server.*8080"
sleep 1

if lsof -i:8080 >/dev/null 2>&1; then
    echo "⚠️  Frontend still running, force killing..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
else
    echo "✅ Frontend Server stopped"
fi

# Verify all stopped
echo ""
echo "🔍 Verifying shutdown..."
sleep 1

BACKEND_RUNNING=$(lsof -i:5002 2>/dev/null)
FRONTEND_RUNNING=$(lsof -i:8080 2>/dev/null)

if [ -z "$BACKEND_RUNNING" ] && [ -z "$FRONTEND_RUNNING" ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           ✅ ALL SERVICES STOPPED SUCCESSFULLY! ✅          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "All ports are now free."
    echo ""
    echo "🔄 To restart the system:"
    echo "   ./start_system.sh"
    echo ""
else
    echo ""
    echo "⚠️  Some services may still be running:"
    [ -n "$BACKEND_RUNNING" ] && echo "   - Backend on port 5002"
    [ -n "$FRONTEND_RUNNING" ] && echo "   - Frontend on port 8080"
    echo ""
    echo "Try running this script again or manually kill processes."
fi


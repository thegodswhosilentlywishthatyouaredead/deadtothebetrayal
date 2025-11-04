#!/bin/bash
################################################################################
# Daily Intelligent Ticket Assignment - Cron Job Script
# AIFF - Advanced Intelligence Field Force
#
# This script triggers the intelligent assignment engine daily
# to assign tickets to field teams across all Malaysian states and zones
#
# Usage:
#   ./run_daily_assignment.sh
#
# Cron setup (run daily at 6:00 AM Malaysia time):
#   0 6 * * * /Users/thegods/Documents/GitHub/new2/run_daily_assignment.sh >> /var/log/aiff_assignment.log 2>&1
#
# Author: HN NASE
# Date: November 4, 2025
################################################################################

# Configuration
API_URL="http://localhost:5002/api/assignment/daily/run"
LOG_DIR="/Users/thegods/Documents/GitHub/new2/logs"
LOG_FILE="$LOG_DIR/daily_assignment_$(date +%Y-%m-%d).log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Start logging
echo "═══════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "  🤖 Daily Intelligent Ticket Assignment" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "Start Time: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if backend server is running
echo "🔍 Checking if backend server is running..." | tee -a "$LOG_FILE"
if ! curl -s "http://localhost:5002/api/teams" > /dev/null 2>&1; then
    echo "❌ Backend server is not running on port 5002" | tee -a "$LOG_FILE"
    echo "   Please start the server first: python3 backend_server.py" | tee -a "$LOG_FILE"
    exit 1
fi

echo "✅ Backend server is running" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Trigger daily assignment
echo "🚀 Triggering daily intelligent assignment..." | tee -a "$LOG_FILE"
RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"date\": \"$(date +%Y-%m-%d)\", \"force\": false}")

# Check if request was successful
if [ $? -eq 0 ]; then
    echo "✅ Assignment API called successfully" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    # Parse and display results
    echo "📊 Assignment Results:" | tee -a "$LOG_FILE"
    echo "$RESPONSE" | python3 -m json.tool | tee -a "$LOG_FILE"
    
    # Extract key statistics
    TOTAL=$(echo "$RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('statistics', {}).get('total_assignments', 0))" 2>/dev/null || echo "N/A")
    TEAMS=$(echo "$RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('statistics', {}).get('teams_utilized', 0))" 2>/dev/null || echo "N/A")
    SCORE=$(echo "$RESPONSE" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('statistics', {}).get('average_score', 0))" 2>/dev/null || echo "N/A")
    
    echo "" | tee -a "$LOG_FILE"
    echo "📈 Quick Summary:" | tee -a "$LOG_FILE"
    echo "   Total Assignments: $TOTAL" | tee -a "$LOG_FILE"
    echo "   Teams Utilized: $TEAMS" | tee -a "$LOG_FILE"
    echo "   Average Score: $SCORE" | tee -a "$LOG_FILE"
else
    echo "❌ Failed to call assignment API" | tee -a "$LOG_FILE"
    echo "   Error: $?" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"
echo "End Time: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "✅ Daily assignment completed successfully!" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

exit 0


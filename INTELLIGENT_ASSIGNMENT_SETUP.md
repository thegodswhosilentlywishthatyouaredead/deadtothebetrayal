# Intelligent Assignment System - Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Verify Files Exist (1 minute)

```bash
cd /Users/thegods/Documents/GitHub/new2

# Check if intelligent assignment engine exists
ls -lh intelligent_assignment_engine.py

# Check if cron script exists
ls -lh run_daily_assignment.sh
```

You should see:
```
-rw-r--r--  intelligent_assignment_engine.py  (~20KB)
-rwxr-xr-x  run_daily_assignment.sh          (~4KB)
```

### Step 2: Test the Engine (2 minutes)

```bash
# Start backend server
python3 backend_server.py
```

You should see:
```
✅ Enhanced data generator available
✅ Intelligent Assignment Engine available
✅ OpenAI integration available
...
📋 Intelligent Assignment System:
   Trigger manually: POST http://localhost:5002/api/assignment/daily/run
   Check status: GET http://localhost:5002/api/assignment/daily/status
   Analyze: POST http://localhost:5002/api/assignment/analyze
```

###  Step 3: Run First Assignment (1 minute)

**In a new terminal**:
```bash
curl -X POST http://localhost:5002/api/assignment/daily/run \
  -H "Content-Type: application/json" \
  -d '{}'
```

You'll see:
```
{
  "success": true,
  "assignments": [...],
  "statistics": {
    "total_assignments": 342,
    "teams_utilized": 98,
    "average_score": 0.723,
    ...
  }
}
```

### Step 4: Verify Assignments (1 minute)

```bash
# Check today's assignment status
curl http://localhost:5002/api/assignment/daily/status | python3 -m json.tool

# View in browser
open http://localhost:8080/public/index.html
# Login and check Field Teams tab - teams now have assignments!
```

### Step 5: Setup Daily Automation (Optional)

```bash
# Make script executable (already done)
chmod +x run_daily_assignment.sh

# Test script manually
./run_daily_assignment.sh

# Setup cron (run daily at 6 AM)
crontab -e
# Add this line:
# 0 6 * * * /Users/thegods/Documents/GitHub/new2/run_daily_assignment.sh >> /var/log/aiff_assignment.log 2>&1
```

## ✅ Done!

Your intelligent assignment system is now running!

## 🧪 Testing Checklist

- [ ] `intelligent_assignment_engine.py` exists
- [ ] `run_daily_assignment.sh` is executable
- [ ] Backend server starts without errors
- [ ] Console shows "✅ Intelligent Assignment Engine available"
- [ ] API POST /api/assignment/daily/run returns success
- [ ] Statistics show assignments were made
- [ ] Teams in dashboard show assigned tickets
- [ ] Cron script runs successfully
- [ ] Logs are created in logs/ directory
- [ ] Assignments persist across server restarts

## 🎯 What You Should See

### Console Output (Backend Server)
```
✅ Intelligent Assignment Engine available
🚀 Starting AIFF Backend Server...
📋 Intelligent Assignment System:
   Trigger manually: POST http://localhost:5002/api/assignment/daily/run
```

### API Response
```json
{
  "success": true,
  "date": "2025-11-04T...",
  "statistics": {
    "total_assignments": 300-400,
    "teams_utilized": 80-120,
    "average_score": 0.65-0.85,
    "by_zone": {
      "Northern": 60-90,
      "Southern": 60-90,
      ...
    }
  }
}
```

### Dashboard Changes
- Field teams now have tickets assigned
- Ticket list shows assignedTeam
- Zone performance shows distribution
- Team rankings updated with new assignments

## 🐛 Troubleshooting

### Error: "Intelligent Assignment Engine not available"

**Cause**: `intelligent_assignment_engine.py` not found or import error

**Fix**:
```bash
# Verify file exists
ls intelligent_assignment_engine.py

# Check for syntax errors
python3 -m py_compile intelligent_assignment_engine.py

# Restart backend
python3 backend_server.py
```

### Error: "No teams available"

**Cause**: All teams are offline or at capacity

**Fix**:
```bash
# Check team availability
curl http://localhost:5002/api/teams | python3 -m json.tool | grep availability

# Reset team capacity (restart server)
python3 backend_server.py
```

### Error: "Connection refused" when running cron

**Cause**: Backend server not running

**Fix**:
1. Start backend server
2. Keep it running in background
3. Or add server startup to cron script

### No assignments created

**Cause**: No tickets need assignment (all already assigned)

**Fix**:
```bash
# Force reassignment
curl -X POST http://localhost:5002/api/assignment/daily/run \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

## 📋 Maintenance

### Daily Checks

```bash
# Check if cron ran today
ls -lt logs/daily_assignment_*.log | head -1

# View latest log
cat logs/daily_assignment_$(date +%Y-%m-%d).log

# Check assignment counts
curl http://localhost:5002/api/assignment/daily/status | python3 -c "import json,sys; print(json.load(sys.stdin)['statistics']['total_assignments'])"
```

### Weekly Review

```bash
# Count assignments for past week
for i in {0..6}; do
  date=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "$i days ago" +%Y-%m-%d)
  count=$(curl -s http://localhost:5002/api/assignment/daily/status?date=$date | python3 -c "import json,sys; print(json.load(sys.stdin).get('statistics', {}).get('total_assignments', 0))" 2>/dev/null || echo "0")
  echo "$date: $count assignments"
done
```

### Monthly Cleanup

```bash
# Archive old logs (keep last 30 days)
find logs/ -name "daily_assignment_*.log" -mtime +30 -delete

# Backup assignment data
curl http://localhost:5002/api/assignment/daily/status | python3 -m json.tool > backups/assignments_$(date +%Y-%m).json
```

## 🎓 Best Practices

### 1. Run Analysis Before Assignment

Always check capacity first:
```bash
curl -X POST http://localhost:5002/api/assignment/analyze
```

### 2. Monitor Assignment Quality

Check average score (should be >0.65):
```bash
curl -s http://localhost:5002/api/assignment/daily/status | \
  python3 -c "import json,sys; print('Avg Score:', json.load(sys.stdin)['statistics']['team_distribution']['avg'])"
```

### 3. Balance Across Zones

Ensure no zone is overloaded:
```bash
curl -s http://localhost:5002/api/assignment/daily/status | \
  python3 -c "import json,sys; z=json.load(sys.stdin)['statistics']['by_zone']; print('\\n'.join([f'{k}: {v}' for k,v in sorted(z.items(), key=lambda x: x[1], reverse=True)]))"
```

### 4. Review Skipped Tickets

Check logs for tickets that couldn't be assigned

### 5. Tune Weights

Adjust scoring weights based on business priorities

## 🔐 Security

### API Security

For production, add authentication:
```python
@app.route('/api/assignment/daily/run', methods=['POST'])
@require_api_key  # Add decorator
def run_daily_assignment():
    ...
```

### Access Control

Restrict assignment endpoints to admin users only

### Audit Trail

Log all assignments for compliance and tracking

## 📊 Success Metrics

### Target KPIs

- **Assignment Rate**: >95% of tickets assigned
- **Confidence**: >70% high confidence assignments
- **Balance**: Max load variance <30%
- **Speed**: <60 seconds for full run
- **SLA Compliance**: >90% urgent tickets to capable teams

### Monitor These

1. Total assignments per day
2. Teams utilized percentage
3. Average assignment score
4. Zone distribution fairness
5. Skipped tickets count

## 🚀 Next Steps

1. ✅ Test the system (run manual assignment)
2. ✅ Review assignment statistics
3. ✅ Check team assignments in dashboard
4. ⏳ Setup cron job for daily automation
5. ⏳ Monitor for 1 week
6. ⏳ Tune weights based on results
7. ⏳ Add notifications (email/SMS)
8. ⏳ Integrate with mobile app

---

**Status**: ✅ Ready for Production  
**Last Updated**: November 4, 2025  
**Maintainer**: HN NASE


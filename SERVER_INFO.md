# AIFF System - Server Information

## ✅ All Systems Operational!

### Backend API Server
- **URL**: http://localhost:5002
- **Status**: ✅ Running
- **Data**: 25 Teams, 75 Tickets loaded
- **Endpoints Available**:
  - GET /health - Health check
  - GET /api/teams - Get all field teams
  - GET /api/tickets - Get all tickets
  - GET /api/assignments - Get assignments
  - GET /api/teams/analytics/zones - Zone analytics
  - GET /api/teams/analytics/productivity - Team productivity
  - GET /api/analytics/tickets/aging - Ticket aging
  - POST /api/ai/query - AI Assistant queries

### Frontend Servers
- **Main Dashboard**: http://localhost:3004 or http://localhost:3005
- **Field Portal**: http://localhost:3006

### API Configuration
The frontend is configured to connect to: **http://localhost:5002/api**

### Testing the System

1. **Test Backend Health**:
   ```bash
   curl http://localhost:5002/health
   ```

2. **Test Teams API**:
   ```bash
   curl http://localhost:5002/api/teams
   ```

3. **Test AI Assistant**:
   ```bash
   curl -X POST http://localhost:5002/api/ai/query \
     -H "Content-Type: application/json" \
     -d '{"query":"How many teams do we have?"}'
   ```

4. **Open Frontend**:
   - Main Dashboard: http://localhost:3004 (or 3005)
   - Field Portal: http://localhost:3006

### Features Working
✅ Backend API with 25 teams and 75 tickets
✅ AI Assistant responding to queries
✅ Zone analytics
✅ Team productivity tracking
✅ Ticket management
✅ Frontend connected to backend

### If you need to restart:

**Backend**:
```bash
cd /Users/thegods/intelligent-field-assignment
python3 backend_server.py &
```

**Frontend**:
```bash
cd /Users/thegods/intelligent-field-assignment
python3 -m http.server 3004 --directory client &
```

---
Generated: $(date)

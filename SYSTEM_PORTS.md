# AIFF System - Port Configuration

## ✅ Active Ports (Clean Setup)

The AIFF system uses **ONLY 2 PORTS**:

### 🔧 Backend API Server
- **Port**: `5002`
- **URL**: `http://localhost:5002`
- **Service**: Python Flask REST API
- **Purpose**: Data management, AI queries, analytics
- **Status**: ✅ Running

### 🌐 Frontend Web Server
- **Port**: `8080`
- **URL**: `http://localhost:8080`
- **Service**: Python HTTP Server
- **Purpose**: Serves both Main Dashboard and Field Portal
- **Status**: ✅ Running

---

## 🌐 Access Points

### Main Dashboard
```
http://localhost:8080/public/index.html
```
- Full system management interface
- Ticket management (75 tickets)
- Team management (25 field technicians)
- Zone analytics (6 Malaysian zones)
- AI Assistant
- Predictive planning
- Map visualization

### Field Portal
```
http://localhost:8080/public/field-portal.html
```
- Field team interface
- My assigned tickets
- Route optimization
- Performance tracking
- Expense management

### Backend API
```
http://localhost:5002/health
http://localhost:5002/api/tickets
http://localhost:5002/api/teams
http://localhost:5002/api/teams/analytics/zones
```

---

## 🔄 System Management

### Start All Services
```bash
./start_system.sh
```

### Stop All Services
```bash
./stop_system.sh
```

### Check Running Services
```bash
lsof -i:5002  # Backend
lsof -i:8080  # Frontend
```

### Manual Start (if needed)

**Backend:**
```bash
cd /Users/thegods/intelligent-field-assignment
python3 backend_server.py > backend.log 2>&1 &
```

**Frontend:**
```bash
cd /Users/thegods/intelligent-field-assignment
python3 -m http.server 8080 --directory client &
```

### Manual Stop (if needed)
```bash
pkill -f backend_server  # Stop backend
pkill -f "http.server.*8080"  # Stop frontend
```

---

## 📊 Port Summary

| Service | Port | Protocol | Status | URL |
|---------|------|----------|--------|-----|
| Backend API | 5002 | HTTP | ✅ Active | http://localhost:5002 |
| Frontend UI | 8080 | HTTP | ✅ Active | http://localhost:8080 |

**Total Ports Used: 2**

---

## 🛠️ Troubleshooting

### Port Already in Use
If you get "Address already in use" error:

```bash
# Find what's using the port
lsof -i:5002  # or 8080

# Kill the process
lsof -ti:5002 | xargs kill -9

# Then restart
./start_system.sh
```

### Services Not Starting
```bash
# Check logs
tail -f backend.log
tail -f frontend.log

# Verify Python is installed
python3 --version

# Check if Flask is installed
python3 -c "from flask import Flask; print('Flask OK')"
```

### Cannot Access Dashboard
- Make sure you use the full URL: `http://localhost:8080/public/index.html`
- Do a hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Clear browser cache
- Check browser console (F12) for errors

---

## 🔒 Security Notes

**Development Mode:**
- Both servers run in debug/development mode
- CORS is enabled for all origins
- Not suitable for production use

**For Production:**
- Use proper WSGI server (Gunicorn, uWSGI)
- Configure Nginx reverse proxy
- Enable HTTPS/SSL
- Restrict CORS to specific domains
- Use environment variables for configuration

---

## 📝 Logs

Logs are written to:
- **Backend**: `backend.log`
- **Frontend**: `frontend.log`

View logs in real-time:
```bash
tail -f backend.log
tail -f frontend.log
```

---

## 🎯 Clean Port Configuration

No port conflicts! The system uses:
- **ONE backend port**: 5002
- **ONE frontend port**: 8080

This provides:
- ✅ Clean separation of concerns
- ✅ Easy debugging
- ✅ No port conflicts
- ✅ Simple management
- ✅ Both portals accessible from single frontend server

---

**Last Updated**: October 14, 2025
**System Version**: 1.0.0
**Port Configuration**: Optimized for development


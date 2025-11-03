# Server Startup Guide

## ✅ FIXED - Servers are now configured correctly

### Server Configuration

**Frontend Server:**
- **Port:** 8080
- **Root Directory:** `/client` (NOT `/client/public`)
- **Purpose:** Serves HTML, CSS, JS files

**Backend Server:**
- **Port:** 5002
- **Root Directory:** `/` (project root)
- **Purpose:** API endpoints for ticketv2, teams, analytics

---

## 🚀 Start Servers

### Start Backend (Port 5002)
```bash
cd /Users/thegods/Documents/GitHub/new2
python3 backend_server.py > backend.log 2>&1 &
```

### Start Frontend (Port 8080)
```bash
cd /Users/thegods/Documents/GitHub/new2/client
python3 -m http.server 8080 > ../frontend.log 2>&1 &
```

---

## 🌐 Working URLs

### Frontend Pages
- **Login:** http://localhost:8080/public/login.html
- **Main Dashboard:** http://localhost:8080/public/index.html
- **Field Portal:** http://localhost:8080/public/field-portal.html

### Backend API
- **Teams:** http://localhost:5002/api/teams
- **Tickets v2:** http://localhost:5002/api/ticketv2
- **Analytics:** http://localhost:5002/api/ticketv2/analytics

---

## 🛑 Stop Servers

```bash
# Stop frontend
pkill -f "http.server 8080"

# Stop backend
pkill -f "backend_server.py"
```

---

## 🔍 Check Server Status

```bash
# Check if servers are running
lsof -i :8080  # Frontend
lsof -i :5002  # Backend

# View logs
tail -f backend.log
tail -f frontend.log
```

---

## ⚠️ Important Notes

1. **Frontend must run from `/client` directory** (not `/client/public`)
   - This allows URLs like `/public/login.html` to work correctly

2. **Backend must run from project root**
   - This allows proper import of data modules

3. **Always use `/public/` prefix for frontend URLs**
   - ✅ http://localhost:8080/public/index.html
   - ❌ http://localhost:8080/index.html

---

## 📊 Current Status (as of Nov 3, 2025)

✅ Frontend: Running on port 8080 from `/client` directory
✅ Backend: Running on port 5002 with 15,075 tickets and 239 teams
✅ All URLs working correctly
✅ No 404 errors


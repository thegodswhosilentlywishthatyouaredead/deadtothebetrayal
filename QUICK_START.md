# 🚀 AIFF System - Quick Start Guide

## ✅ System is Running!

### 🌐 **MAIN ACCESS URL:**

```
http://localhost:8080/public/index.html
```

**Alternative URL for Field Portal:**
```
http://localhost:8080/public/field-portal.html
```

---

## 📊 Current System Status

✅ **Backend Server** (Port 5002):
- **Status**: Running
- **Teams**: 25 Malaysian field technicians loaded
- **Tickets**: 75 network service tickets loaded
- **Assignments**: 22 smart assignments created
- **Zones**: 6 Malaysian zones (Central, Northern, Southern, Eastern, Sabah, Sarawak)
- **AI Assistant**: Active and responding

✅ **Frontend Server** (Port 8080):
- **Status**: Running
- **Dashboard**: Fully operational
- **JavaScript**: All files loading correctly
- **API Connection**: Connected to backend on port 5002

---

## 🎯 How to Access

### **Step 1**: Open your web browser

### **Step 2**: Navigate to:
```
http://localhost:8080/public/index.html
```

### **Step 3**: Explore the features!
- Click on different tabs (Overview, Tickets, Field Teams, etc.)
- Try the AI Assistant (chat widget on the right)
- View the map
- Check analytics

---

## 🔧 Testing the System

### Test Backend Health:
```bash
curl http://localhost:5002/health
```

Expected response:
```json
{
  "status": "OK",
  "teams": 25,
  "tickets": 75,
  "timestamp": "..."
}
```

### Test Teams API:
```bash
curl http://localhost:5002/api/teams | python3 -m json.tool
```

### Test AI Assistant:
```bash
curl -X POST http://localhost:5002/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query":"How many teams do we have?"}'
```

Expected response:
```json
{
  "response": "**AIFF System Overview:**...",
  "timestamp": "..."
}
```

---

## 🎨 Available Features

### 📊 Main Dashboard:
- **Overview Tab**: Key metrics and system statistics
- **Tickets Tab**: 75 network tickets with analytics
- **Field Teams Tab**: 25 team members across Malaysian zones
- **Predictive Planning**: Material forecasting and inventory management
- **Map View**: Geographic visualization of teams and tickets

### 🤖 AI Assistant:
- Located on the right side of the screen
- Ask questions about:
  - Team performance
  - Ticket status
  - System analytics
  - Material inventory
  - Zone efficiency

### 🗺️ Malaysian Zones Coverage:
- **Central**: Kuala Lumpur, Selangor, Negeri Sembilan
- **Northern**: Penang, Perak, Kedah, Perlis
- **Southern**: Johor, Melaka
- **Eastern**: Pahang, Terengganu, Kelantan
- **Sabah**: Sabah, Labuan
- **Sarawak**: Sarawak

---

## 🔄 Restart Instructions

If the servers stop running, use these commands:

### Start Backend Server:
```bash
cd /Users/thegods/intelligent-field-assignment
python3 backend_server.py > backend.log 2>&1 &
```

### Start Frontend Server:
```bash
cd /Users/thegods/intelligent-field-assignment
python3 -m http.server 8080 --directory client &
```

### Check if Servers are Running:
```bash
# Check backend (should show port 5002)
lsof -i:5002

# Check frontend (should show port 8080)
lsof -i:8080
```

### Stop Servers:
```bash
# Stop backend
pkill -f backend_server

# Stop frontend
pkill -f "http.server.*8080"
```

---

## 🛠️ Troubleshooting

### Issue: "Data not loading"
**Solution**: 
1. Check if backend is running: `lsof -i:5002`
2. Test backend API: `curl http://localhost:5002/health`
3. Check browser console (F12) for errors
4. Make sure you're using the correct URL: `http://localhost:8080/public/index.html`

### Issue: "AI not working"
**Solution**:
1. Test AI endpoint: 
   ```bash
   curl -X POST http://localhost:5002/api/ai/query \
     -H "Content-Type: application/json" \
     -d '{"query":"test"}'
   ```
2. Check backend logs: `tail -f backend.log`
3. Refresh the browser page

### Issue: "Access Denied"
**Solution**:
- Use the full path: `http://localhost:8080/public/index.html`
- Don't use just `http://localhost:8080`
- Clear browser cache and try again

### Issue: "Page loads but no data"
**Solution**:
1. Open browser console (F12 > Console tab)
2. Look for errors related to API calls
3. Verify backend is responding:
   ```bash
   curl http://localhost:5002/api/teams
   curl http://localhost:5002/api/tickets
   ```

---

## 📝 Important URLs

| Service | URL |
|---------|-----|
| **Main Dashboard** | http://localhost:8080/public/index.html |
| **Field Portal** | http://localhost:8080/public/field-portal.html |
| **Backend Health** | http://localhost:5002/health |
| **Teams API** | http://localhost:5002/api/teams |
| **Tickets API** | http://localhost:5002/api/tickets |
| **AI Query API** | http://localhost:5002/api/ai/query |

---

## 📚 Additional Documentation

- **SERVER_INFO.md** - Detailed server configuration
- **backend.log** - Backend server logs
- **PROJECT_SUMMARY.md** - Project overview

---

## 🎉 Quick Start Checklist

- [ ] Backend server is running (port 5002)
- [ ] Frontend server is running (port 8080)
- [ ] Opened http://localhost:8080/public/index.html in browser
- [ ] Dashboard loads with data
- [ ] Can click through different tabs
- [ ] AI Assistant responds to queries
- [ ] Map displays correctly

---

## 🚀 You're Ready!

The AIFF system is fully operational with:
- ✅ 25 Field Teams across Malaysia
- ✅ 75 Network Service Tickets
- ✅ 22 Smart Assignments
- ✅ 6 Malaysian Zones
- ✅ AI Assistant
- ✅ Full Analytics Dashboard

**Enjoy using AIFF!** 🎯

---

*Last Updated: October 14, 2025*
*Version: 1.0.0*
*Support: All systems operational*

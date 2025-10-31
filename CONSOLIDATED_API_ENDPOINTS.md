# CONSOLIDATED API ENDPOINTS - AIFF System

**Base URL:** `http://localhost:5002/api`

All frontend pages and components now use a single, standardized API endpoint at port **5002**.

## ✅ Configuration Status

All configuration files have been updated to use port 5002:
- ✅ `/client/public/src/config.js` - Port 5002
- ✅ `/client/public/src/app.js` - Port 5002 (fallback)
- ✅ `/client/public/index.html` - Port 5002 (override)
- ✅ `/client/public/field-portal.html` - Port 5002 (override)
- ✅ `/test_integration.html` - Port 5002

---

## 📋 Complete API Reference

### 🎫 Tickets API

#### GET /api/tickets
Get all tickets with optional limit
- Query params: `limit` (optional)
- Response: `{ tickets: [], total: number }`

#### GET /api/ticketv2
Get all tickets (v2 with enhanced limit support)
- Query params: `limit` (optional), `offset` (optional)
- Response: `{ tickets: [], total: number }`

#### GET /api/tickets/:id
Get a specific ticket by ID
- Response: `{ ticket: {} }`

#### POST /api/tickets
Create a new ticket
- Body: `{ title, description, category, priority, location, customerInfo, estimatedDuration }`
- Response: `{ ticket: {}, message: string }`

#### POST /api/tickets/:id/assign
Assign a ticket to a team
- Body: `{ teamId: string }`
- Response: `{ ticket: {}, assignment: {}, message: string }`

#### POST /api/tickets/:id/auto-assign
Auto-assign a ticket to the best available team
- Response: `{ ticket: {}, assignment: {}, team: {}, message: string }`

---

### 👥 Teams API

#### GET /api/teams
Get all field teams
- Query params: `limit` (optional)
- Response: `{ teams: [], total: number }`

#### POST /api/teams
Create a new field team
- Body: `{ name, email, phone, skills, currentLocation }`
- Response: `{ team: {}, message: string }`

---

### 📊 Assignments API

#### GET /api/assignments
Get all assignments
- Response: `{ assignments: [], total: number }`

#### PATCH /api/assignments/:id/status
Update assignment status
- Body: `{ status: string }`
- Response: `{ assignment: {}, message: string }`

---

### 📈 Analytics API

#### GET /api/analytics/tickets/aging
Get ticket aging analytics
- Response: Ticket aging data with counts by age groups

#### GET /api/tickets/analytics/overview
Get ticket analytics overview
- Response: Overall ticket statistics and metrics

#### GET /api/teams/analytics/productivity
Get team productivity analytics
- Response: Team productivity metrics

#### GET /api/teams/analytics/zones
Get zone-based team analytics
- Response: Zone performance data

#### GET /api/teams/analytics/performance
Get team performance analytics
- Response: Comprehensive team performance metrics

#### GET /api/assignments/analytics/performance
Get assignment performance analytics
- Response: Assignment completion and efficiency metrics

#### GET /api/ticketv2/analytics/performance
Get enhanced ticket performance analytics
- Response: Advanced ticket performance data

---

### 📅 Planning API

#### GET /api/planning/forecast
Get demand forecast data
- Response: AI-powered demand forecasts

#### GET /api/planning/zone-materials
Get zone material usage data
- Response: Material usage by zone

#### GET /api/planning/inventory
Get inventory planning data
- Response: Current inventory status and stock levels

#### GET /api/planning/reorder-alerts
Get reorder alerts for inventory
- Response: List of items needing reorder

---

### 🗺️ Live Tracking API

#### GET /api/live-tracking/teams
Get real-time team locations
- Response: `{ teams: [], total: number }`

#### GET /api/live-tracking/tickets
Get real-time ticket status
- Response: `{ tickets: [], total: number }`

#### GET /api/live-tracking/routes
Get optimized routes for teams
- Response: `{ routes: [], total: number }`

---

### 🤖 AI API

#### POST /api/ai/query
Handle AI assistant queries
- Body: `{ query: string, context: {} }`
- Response: AI-generated response with insights

#### POST /api/ai/chat
Handle AI chat messages
- Body: `{ message: string }`
- Response: `{ response: string, timestamp: string, context: {} }`

---

## 🔧 System Endpoints

#### GET /health
System health check
- Response: `{ status: "OK", teams: number, tickets: number, timestamp: string }`

---

## 🚀 Quick Start

### Start Both Servers

```bash
# Backend (Port 5002)
cd /Users/thegods/Documents/GitHub/new2
python3 backend_server.py > backend.log 2>&1 &

# Frontend (Port 8080)
python3 -m http.server 8080 --directory client > frontend.log 2>&1 &
```

### Access the Application

- **Main Dashboard:** http://localhost:8080/public/index.html
- **Field Portal:** http://localhost:8080/public/field-portal.html
- **API Health:** http://localhost:5002/health

### Test API Endpoints

```bash
# Test health
curl http://localhost:5002/health

# Test tickets
curl http://localhost:5002/api/tickets

# Test ticketv2 with limit
curl "http://localhost:5002/api/ticketv2?limit=10"

# Test teams
curl http://localhost:5002/api/teams

# Test planning inventory
curl http://localhost:5002/api/planning/inventory

# Test live tracking
curl http://localhost:5002/api/live-tracking/teams
```

---

## 📝 Notes

1. **All endpoints are consolidated** into the single backend server on port 5002
2. **No microservices required** - everything runs from one Python backend
3. **All analytics data** is generated from the sample data
4. **Browser cache:** If you still see errors, do a **hard refresh** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
5. **CORS enabled** for all origins in development mode

---

## 🎯 What Was Fixed

### Port Consolidation
- Changed from port 8085 → 5002 across all files
- Updated all config files to use single API base
- Removed hardcoded port references

### Missing Endpoints Added
- ✅ `/api/ticketv2` - Enhanced ticket API with limit support
- ✅ `/api/planning/inventory` - Inventory management
- ✅ `/api/planning/reorder-alerts` - Reorder notifications
- ✅ `/api/live-tracking/teams` - Real-time team tracking
- ✅ `/api/live-tracking/tickets` - Real-time ticket tracking
- ✅ `/api/live-tracking/routes` - Route optimization
- ✅ `/api/tickets/:id` - Get specific ticket
- ✅ `/api/tickets/:id/assign` - Manual assignment
- ✅ `/api/tickets/:id/auto-assign` - Auto assignment
- ✅ `/api/assignments/:id/status` - Update assignment
- ✅ `/api/tickets` (POST) - Create ticket
- ✅ `/api/teams` (POST) - Create team
- ✅ `/api/ai/chat` - AI chat interface

### Files Modified
1. `client/public/src/config.js` - API base URL
2. `client/public/src/app.js` - Fallback API URL
3. `client/public/index.html` - Override API URL
4. `client/public/field-portal.html` - Override API URL
5. `backend_server.py` - Added 13 new endpoints

---

## 🌟 Result

All API calls from all pages now go to a single, unified backend at **http://localhost:5002/api** with complete endpoint coverage for all frontend features!


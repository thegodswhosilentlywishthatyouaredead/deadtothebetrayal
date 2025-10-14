# Advanced Intelligence Field Force Systems (AIFF)

A comprehensive field service management platform designed for Malaysian telecommunications field teams. The system uses AI-powered algorithms, intelligent assignment matching, and real-time analytics to optimize field operations, manage network troubleshooting tickets, and track team performance across Malaysian zones.

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- pip3 (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/thegodswhosilentlywishthatyouaredead/deadtothebetrayal.git
   cd deadtothebetrayal
   ```

2. **Install Python dependencies**
   ```bash
   pip3 install flask flask-cors python-docx markdown2
   ```

3. **Start the system**
   ```bash
   ./start_system.sh
   ```
   
   Or manually:
   ```bash
   # Start backend (port 5002)
   python3 backend_server.py &
   
   # Start frontend (port 8080)
   python3 -m http.server 8080 --directory client &
   ```

4. **Access the application**
   - **Main Dashboard**: http://localhost:8080/public/index.html
   - **Field Portal**: http://localhost:8080/public/field-portal.html
   - **Backend API**: http://localhost:5002

### Stop the system
```bash
./stop_system.sh
```

---

## 📊 System Overview

### Current System Metrics
- **Field Teams**: 25 Malaysian field technicians
- **Active Tickets**: 75 network service tickets
- **Coverage Zones**: 6 Malaysian zones (Central, Northern, Southern, Eastern, Sabah, Sarawak)
- **States Covered**: All 15 Malaysian states and territories
- **Smart Assignments**: 20+ intelligent team-ticket matches

---

## 🎯 Key Features

### 1️⃣ Intelligent Assignment System
- **Smart Matching Algorithm**: Matches tickets to teams based on:
  - Skills and certifications
  - Geographic proximity (Malaysian locations)
  - Current workload
  - Team productivity scores
  - Zone coverage optimization
- **Assignment Scoring**: 0-100 score for optimal team-ticket fit
- **Real-time Updates**: Automatic assignment suggestions
- **Malaysian Context**: Zone-based optimization for Malaysian telecommunications

### 2️⃣ Team Management
- **25 Field Technicians** across Malaysian zones:
  - Central Zone (Kuala Lumpur, Selangor)
  - Northern Zone (Penang, Perak, Kedah, Perlis)
  - Southern Zone (Johor, Melaka, Negeri Sembilan)
  - Eastern Zone (Pahang, Terengganu, Kelantan)
  - Sabah Zone
  - Sarawak Zone
- **Productivity Tracking**: Customer ratings, efficiency scores, completion times
- **Skills Management**: Fiber optics, network troubleshooting, CPE installation, etc.
- **Hourly Rates**: In Malaysian Ringgit (RM)

### 3️⃣ Ticket Management (75 Tickets)
- **10 Ticket Categories**:
  - Network Breakdown - NTT Class 1 (Major)
  - Network Breakdown - NTT Class 2 (Intermediate)
  - Customer - Drop Fiber
  - Customer - CPE
  - Customer - FDP Breakdown
  - Network Breakdown - NTT (Minor)
  - Infrastructure - FDP Maintenance
  - Infrastructure - Fiber Splicing
  - Customer - ONU Issues
  - Network - Backhaul Problems
- **Priority Management**: High, Medium, Low priority levels
- **Status Tracking**: Open, In Progress, Resolved, Closed
- **Malaysian Locations**: Realistic addresses, postal codes, and landmarks

### 4️⃣ AI Assistant
- **ChatGPT-style Interface**: Always-visible chat widget
- **System Queries**: Ask about teams, tickets, performance, zones
- **Performance Insights**: Real-time analytics and recommendations
- **Natural Language**: Conversational interface for easy interaction
- **Context-Aware**: Provides Malaysian-specific guidance and information

### 5️⃣ Zone Analytics
- **6 Malaysian Zones** with performance metrics
- **Productivity Scoring**: Formula-based calculation
  - `(Closed Tickets - Open Tickets) / Total Tickets × 100`
- **Team Distribution**: Teams organized by zones and states
- **Open vs Closed Tickets**: Real-time tracking
- **Efficiency Rankings**: Zones ranked by productivity

### 6️⃣ Predictive Planning
- **Material Forecasting**: AI-powered demand prediction
- **Inventory Management**: Track fiber cables, CPE units, connectors, splitters
- **Reorder Alerts**: Critical and warning level notifications
- **Zone-based Usage**: Material consumption by Malaysian zones
- **Cost Tracking**: All costs in Malaysian Ringgit (RM)

### 7️⃣ Map Visualization
- **Interactive Map**: Leaflet-based mapping with Malaysian focus
- **Team Locations**: Real-time field team positions
- **Ticket Markers**: Visual ticket distribution
- **Zone Boundaries**: Malaysian state boundaries
- **Network Infrastructure**: FDP and network node markers
- **Fullscreen Support**: Enhanced viewing experience

### 8️⃣ Field Team Portal
- **Dedicated Interface**: For field technicians
- **My Tickets**: View assigned tasks
- **Route Optimization**: Plan efficient routes
- **Performance Dashboard**: Personal metrics and trends
- **Expense Tracking**: Record and submit expenses
- **AI Assistant**: Field-specific guidance and troubleshooting

### 9️⃣ Mobile-Responsive Design
- **PWA Features**: Progressive Web App capabilities
- **Touch-Friendly**: Optimized for mobile devices
- **Responsive Grid**: Adapts to all screen sizes
- **Collapsible Sidebar**: Mobile-first navigation
- **Swipeable Tabs**: Enhanced mobile UX

---

## 🏗️ Architecture

### System Components

```
AIFF System
├── Backend API (Port 5002)
│   ├── Flask REST API
│   ├── Modular Data System
│   ├── AI Query Engine
│   └── Analytics Engine
│
└── Frontend UI (Port 8080)
    ├── Main Dashboard (index.html)
    ├── Field Portal (field-portal.html)
    ├── JavaScript App Logic
    └── Responsive CSS Styling
```

### Technology Stack

**Backend:**
- **Python 3.9+**: Core runtime
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Modular Data System**: `data/sample_data.py` for realistic data generation

**Frontend:**
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with smooth edges, gradients, animations
- **JavaScript ES6+**: Async/await, fetch API, modern syntax
- **Bootstrap 5**: Responsive grid and components
- **Leaflet**: Interactive maps
- **Font Awesome**: Icon library

**Data Management:**
- **Sample Data Generator**: 25 teams, 75 tickets, 20+ assignments
- **Malaysian Context**: Realistic locations, names, addresses
- **Zone-based Organization**: 6 Malaysian zones coverage

---

## 📁 Project Structure

```
intelligent-field-assignment/
├── backend_server.py          # Flask backend API server
├── data/
│   └── sample_data.py        # Modular data generation system
├── client/
│   ├── public/
│   │   ├── index.html        # Main dashboard
│   │   └── field-portal.html # Field team portal
│   └── src/
│       ├── app.js            # Main dashboard JavaScript
│       └── field-portal.js   # Field portal JavaScript
├── models/                    # Data models (Node.js legacy)
├── routes/                    # API routes (Node.js legacy)
├── services/                  # Business logic (Node.js legacy)
├── docs/                      # Complete technical documentation
├── word_docs/                 # Microsoft Word documentation
├── start_system.sh           # Startup script
├── stop_system.sh            # Shutdown script
├── QUICK_START.md            # Quick start guide
├── SYSTEM_PORTS.md           # Port configuration
└── README.md                 # This file
```

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:5002/api
```

### Available Endpoints

**Health & Status:**
- `GET /health` - System health check

**Teams:**
- `GET /api/teams` - Get all field teams (25 teams)
- `GET /api/teams/analytics/zones` - Zone-based analytics
- `GET /api/teams/analytics/productivity` - Team productivity metrics

**Tickets:**
- `GET /api/tickets` - Get all tickets (75 tickets)
- `GET /api/analytics/tickets/aging` - Ticket aging analytics

**Assignments:**
- `GET /api/assignments` - Get all assignments

**AI Assistant:**
- `POST /api/ai/query` - Query AI assistant
  ```json
  {
    "query": "How many teams do we have?"
  }
  ```

---

## 💡 Usage Examples

### Testing the Backend

**Health Check:**
```bash
curl http://localhost:5002/health
```

**Get All Teams:**
```bash
curl http://localhost:5002/api/teams | python3 -m json.tool
```

**Get All Tickets:**
```bash
curl http://localhost:5002/api/tickets | python3 -m json.tool
```

**Query AI Assistant:**
```bash
curl -X POST http://localhost:5002/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query":"Show team performance"}'
```

### Using the Frontend

1. **Open Main Dashboard**: http://localhost:8080/public/index.html
2. **Navigate tabs**: Overview, Tickets, Field Teams, Predictive Planning, Map View
3. **Use AI Assistant**: Click the chat widget on the right side
4. **View Analytics**: Click on different tabs for domain-specific dashboards
5. **Check Zone Performance**: Scroll to Zone Performance section

---

## 📊 Sample Data

### Field Teams (25 Total)
Generated with realistic Malaysian data:
- Names: Ali, Muthu, Ah-Hock, Nurul, Ahmad, Siti, Hassan, Fatimah, etc.
- Locations: Across all 15 Malaysian states
- Skills: Fiber optics, network troubleshooting, CPE installation, FDP maintenance
- Productivity: 80-95% efficiency scores
- Ratings: 4.0-5.0 customer satisfaction

### Tickets (75 Total)
Network troubleshooting scenarios:
- Major network breakdowns (NTT Class 1)
- Intermediate issues (NTT Class 2)
- Customer premise issues (Drop Fiber, CPE)
- Infrastructure maintenance (FDP, Fiber Splicing)
- Realistic Malaysian addresses and postal codes
- Priority levels: High, Medium, Low
- Status: Open, In Progress, Resolved, Closed

### Malaysian Zones (6 Total)
- **Central**: Kuala Lumpur, Selangor, Negeri Sembilan, Melaka
- **Northern**: Penang, Perak, Kedah, Perlis
- **Southern**: Johor
- **Eastern**: Pahang, Terengganu, Kelantan
- **Sabah**: Sabah, Labuan
- **Sarawak**: Sarawak

---

## 🎨 User Interface

### Main Dashboard Features
- **Modern Design**: Smooth edges, gradients, professional styling
- **Metric Cards**: Key performance indicators
- **Tab Navigation**: Domain-specific dashboards
- **Zone Performance**: Productivity rankings by zone
- **Recent Tickets**: Latest service requests
- **Interactive Charts**: Performance trends and analytics
- **AI Chat Widget**: Always-visible ChatGPT-style interface
- **Responsive Design**: Works on desktop, tablet, and mobile

### Field Portal Features
- **Personal Dashboard**: Technician-specific interface
- **My Tickets**: Assigned tasks and schedule
- **Route Planning**: Optimized journey planning
- **Performance Metrics**: Personal productivity tracking
- **Expense Management**: Record and submit expenses
- **Work Trends**: Historical performance data
- **AI Assistant**: Field-specific troubleshooting help

---

## 🔧 Configuration

### Port Configuration
- **Backend API**: Port 5002
- **Frontend UI**: Port 8080

### API Base URLs (in JavaScript)
Already configured in:
- `client/src/app.js`: `const API_BASE = 'http://localhost:5002/api';`
- `client/src/field-portal.js`: `const API_BASE = 'http://localhost:5002/api';`

### Data Generation
Modify `data/sample_data.py` to customize:
- Number of teams (default: 25)
- Number of tickets (default: 75)
- Malaysian zones and states
- Skill categories
- Ticket types

---

## 📚 Documentation

### Complete Documentation Suite

**Markdown Documentation** (in `docs/` directory):
- `ARCHITECTURE.md` - System architecture and design
- `FRONTEND_ARCHITECTURE.md` - Frontend components and optimization
- `BACKEND_ARCHITECTURE.md` - API services and business logic
- `API_DOCUMENTATION.md` - Complete REST API reference
- `DATABASE_SCHEMA.md` - Database design and relationships
- `DEPLOYMENT_GUIDE.md` - Production deployment procedures
- `SECURITY_GUIDE.md` - Security and authentication systems
- `MONITORING_MAINTENANCE.md` - Monitoring and maintenance
- `README.md` - Documentation hub

**Microsoft Word Documentation** (in `word_docs/` directory):
- All markdown docs converted to `.docx` format
- `AIFF_Complete_Documentation.docx` - Master document with TOC
- Professional formatting for corporate use

**Quick Reference Guides**:
- `QUICK_START.md` - Getting started guide
- `SYSTEM_PORTS.md` - Port configuration and management
- `SERVER_INFO.md` - Server setup information

---

## 🛠️ Development

### Adding More Data

Edit `data/sample_data.py`:

```python
# Generate more teams
teams = generator.generate_field_teams(50)  # Default: 25

# Generate more tickets
tickets = generator.generate_tickets(150)   # Default: 75
```

### Customizing Malaysian Zones

Edit the `zones` dictionary in `data/sample_data.py`:
```python
self.zones = {
    "Central": ["Kuala Lumpur", "Selangor", ...],
    "Northern": ["Penang", "Perak", ...],
    # Add custom zones
}
```

### Adding New Ticket Categories

Edit the `ticket_categories` list in `data/sample_data.py`:
```python
self.ticket_categories = [
    "Your Custom Category",
    # ...
]
```

---

## 🔍 Troubleshooting

### Data Not Loading

1. **Check Backend Status**:
   ```bash
   curl http://localhost:5002/health
   ```
   Should return: `{"status":"OK","teams":25,"tickets":75,...}`

2. **Check Browser Console** (F12 → Console):
   - Look for error messages
   - Check if API calls are failing
   - Verify API_BASE URL

3. **Hard Refresh Browser**:
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

### AI Assistant Not Working

1. **Test AI Endpoint**:
   ```bash
   curl -X POST http://localhost:5002/api/ai/query \
     -H "Content-Type: application/json" \
     -d '{"query":"test"}'
   ```

2. **Check Backend Logs**:
   ```bash
   tail -f backend.log
   ```

### Port Already in Use

```bash
# Find what's using the port
lsof -i:5002  # Backend
lsof -i:8080  # Frontend

# Kill the process
lsof -ti:5002 | xargs kill -9

# Restart system
./start_system.sh
```

### Field Portal Shows No Data

1. Verify backend is running: `curl http://localhost:5002/api/tickets`
2. Check browser console for errors
3. Make sure you're accessing: `http://localhost:8080/public/field-portal.html`
4. Hard refresh the page

---

## 🌟 Features Highlight

### Modular Data System
- **SampleDataGenerator Class**: Generates realistic Malaysian telecommunications data
- **Customizable**: Easy to modify team counts, ticket types, zones
- **Realistic**: Malaysian names, addresses, postal codes, landmarks
- **Comprehensive**: Skills, certifications, equipment, preferences

### Advanced Analytics
- **Ticket Aging**: Efficiency scoring based on resolution times
- **Team Productivity**: Weighted scoring algorithm
- **Zone Performance**: Productivity rankings by Malaysian zones
- **Material Forecasting**: AI-powered demand prediction

### Malaysian Context
- **15 States Covered**: All Malaysian states and territories
- **6 Operational Zones**: Strategic zone organization
- **Local Currency**: All costs in Ringgit Malaysia (RM)
- **Realistic Addresses**: Proper Malaysian address format with postal codes
- **Local Names**: Authentic Malaysian names for teams and customers

---

## 📈 System Metrics

### Performance Indicators
- **Team Productivity Score**: 85-95% average
- **Customer Satisfaction**: 4.0-5.0 star ratings
- **Ticket Resolution**: 92% efficiency score
- **Response Time**: 15-30 minutes average
- **First-Time Fix Rate**: 85-95%

### Zone Coverage
- **Total Teams**: 25 field technicians
- **Total Tickets**: 75 network service requests
- **Active Assignments**: 20+ optimized matches
- **Coverage Area**: Entire Malaysia (all states)
- **Service Availability**: 24/7 operations

---

## 🔒 Security Notes

**Current Setup (Development Mode):**
- CORS enabled for all origins
- Debug mode enabled
- No authentication required
- Suitable for development/testing only

**For Production Deployment:**
- Implement JWT authentication
- Configure proper CORS restrictions
- Use HTTPS/SSL
- Deploy with production WSGI server (Gunicorn)
- Set up proper logging and monitoring
- Use environment variables for secrets
- Refer to `docs/DEPLOYMENT_GUIDE.md` and `docs/SECURITY_GUIDE.md`

---

## 🎯 Use Cases

1. **Telecommunications Field Service Management**
   - Network troubleshooting and maintenance
   - Fiber optic installations and repairs
   - Customer premise equipment (CPE) support
   - FDP (Field Distribution Point) maintenance

2. **Team Performance Optimization**
   - Track productivity by zone
   - Monitor customer satisfaction
   - Optimize resource allocation
   - Improve response times

3. **Predictive Planning**
   - Forecast material demand
   - Plan workforce allocation
   - Prevent inventory stockouts
   - Optimize costs

4. **Analytics & Reporting**
   - Zone performance comparison
   - Team efficiency rankings
   - Ticket resolution trends
   - Cost analysis

---

## 📞 Support & Documentation

### Quick Links
- **GitHub Repository**: https://github.com/thegodswhosilentlywishthatyouaredead/deadtothebetrayal
- **Quick Start Guide**: [QUICK_START.md](QUICK_START.md)
- **Port Configuration**: [SYSTEM_PORTS.md](SYSTEM_PORTS.md)
- **Full Documentation**: [docs/README.md](docs/README.md)

### Getting Help
1. Check the documentation in `docs/` directory
2. Review `QUICK_START.md` for common issues
3. Check `backend.log` for backend errors
4. Use browser console (F12) for frontend debugging

---

## 🚀 Quick Commands

```bash
# Start system
./start_system.sh

# Stop system
./stop_system.sh

# Check status
lsof -i:5002  # Backend
lsof -i:8080  # Frontend

# View logs
tail -f backend.log   # Backend logs
tail -f frontend.log  # Frontend logs

# Test backend
curl http://localhost:5002/health

# Test AI
curl -X POST http://localhost:5002/api/ai/query \
  -H "Content-Type: application/json" \
  -d '{"query":"How many teams?"}'
```

---

## 📝 License

This project is part of a field service management demonstration system for Malaysian telecommunications operations.

---

## 🙏 Acknowledgments

- Bootstrap 5 for responsive UI framework
- Leaflet for interactive mapping
- Font Awesome for icons
- Flask for Python web framework

---

## 📊 System Statistics

- **Lines of Code**: ~12,000+
- **Components**: 2 portals, 8 API endpoints, modular data system
- **Documentation**: 9 markdown files + 10 Word documents
- **Sample Data**: 25 teams, 75 tickets, 6 zones
- **Coverage**: 15 Malaysian states
- **Features**: 9 major feature sets

---

**Version**: 1.0.0  
**Last Updated**: October 14, 2025  
**Status**: ✅ Production-Ready for Development/Demo  
**Maintained by**: AIFF Development Team

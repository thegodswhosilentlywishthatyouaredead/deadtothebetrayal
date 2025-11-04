# Changelog

All notable changes to the AIFF (Advanced Intelligence Field Force) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2025-11-04

### Added - OpenAI Integration & Bilingual Support

#### nBOTS AI Chatbot
- **OpenAI GPT-3.5-turbo integration** with intelligent fallback system
- **Bilingual support**: Full English ⇄ Bahasa Malaysia translation
- **Personalized insights**: Real-time performance data for each field team member
- **Context-aware responses**: AI knows user's tickets, efficiency, and ratings
- **Language switching**: Instant EN/BM toggle with complete re-translation
- **Typing indicator**: Animated dots while AI processes
- **Suggestion chips**: Quick action buttons for common queries
- **Complete CSS design**: 282 lines of professional chatbot styling
- **Inline JavaScript**: 228 lines of functions to bypass caching issues

#### Backend API Enhancements
- **Enhanced /api/ai/chat endpoint**: 
  - Accepts message, language ('en'/'ms'), and user context
  - Returns intelligent responses with user-specific metrics
  - Supports OpenAI GPT-3.5-turbo (optional)
  - Falls back to rule-based AI (works without API key)
- **User context calculation**:
  - Filters tickets for specific team
  - Calculates completion rate, efficiency, today's tickets
  - Provides team name, rating, and performance metrics
- **Bilingual response generation**:
  - English responses with performance-based insights
  - Bahasa Malaysia translations (authentic Malay phrasing)
  - Keyword detection in both languages

#### Frontend Improvements
- **Complete chatbot CSS** (lines 501-821 in field-portal.html):
  - Message bubbles with gradients (purple AI, green user)
  - Circular avatars with shadows
  - Smooth animations (slideUp, messageSlideIn)
  - Typing indicator with dot animation
  - Suggestion chips with hover effects
  - Input field with focus effects
  - Send button with gradients
  - Language toggle buttons
  - Responsive design for mobile
- **Inline function implementation**:
  - toggleFieldAIChatbot() - Open/close chat
  - loadEnhancedFieldGreeting() - Data-driven greeting
  - switchFieldAILanguage() - Real language switching
  - sendFieldAIChatbotMessage() - API-connected chat
  - generateEnglishGreeting() - EN greeting template
  - generateMalayGreeting() - BM greeting template
  - All functions exposed to window object

#### Documentation
- **OPENAI_INTEGRATION.md**: 567-line comprehensive guide
- **QUICK_START_OPENAI.md**: Quick testing guide
- **DEBUG_NBOTS_CHATBOT.md**: 20+ diagnostic commands
- **TESTING_NBOTS_CHATBOT.md**: 60+ item QA checklist
- **NBOTS_COMPLETE_FIX.md**: Complete fix summary
- **FIELD_PORTAL_CHATBOT_REVAMP.md**: Design documentation

### Changed

#### Enhanced Data & APIs
- **Increased ticket dataset**: 1,000 → 15,000 tickets
- **API limit updates**: All fetch calls now use `limit=20000`
- **Data structure**: Enhanced with SLA, aging, efficiency scores
- **Team capacity**: Enforced 5 tickets/day maximum per team
- **Status system**: Changed to 4-state (open, in_progress, closed, cancelled)

#### UI/UX Refinements
- **Number formatting**: Added commas every 1k (15,000 not 15000)
- **Comparison data**: Standardized trend display format
- **Pagination**: Proper offset-based pagination (15 per page)
- **Rankings**: Sort by productivity % (highest to lowest)
- **Recent tickets**: Show top 10, sorted by newest first
- **Team names**: Resolved from IDs (not raw team_123 display)

#### Performance Optimizations
- **DataCache system**: Configurable TTL (short/medium/long/veryLong)
- **Request debouncing**: 300ms for filter operations
- **Lazy loading**: Charts load on-demand
- **Mobile optimization**: Reduced limits for mobile devices
- **Chart destruction**: Safe cleanup to prevent canvas conflicts

### Fixed

#### Critical Bugs
- **Canvas reuse errors**: Renamed chart functions to avoid ID conflicts
- **Pagination not working**: Added offset/limit support to backend and frontend
- **Filter not working**: Updated to use ticketv2 API structure
- **Team availability errors**: Fixed `.toUpperCase()` on object issue
- **Top performer showing 0**: Added enrichTeamsWithTicketCounts()
- **Field portal KPI errors**: Fixed filtering logic for user-specific data
- **Login system**: Smart team selection (prioritizes teams with today's tickets)
- **Favicon 404**: Created SVG-based favicon
- **Chatbot toggle not working**: Inline functions exposed to window
- **Greeting stuck on "Loading..."**: Added auto-loading with real data
- **Language switch not working**: Implemented real translation system

#### Performance Issues
- **High-level metrics not loading**: Resolved function name collisions
- **Live tracking not standardized**: Updated to use ticketv2 API
- **Field portal not reflecting today**: Fixed date filtering with timezone-safe comparisons
- **Data not accurate**: Increased today's ticket percentage from 3% to 10%
- **Browser caching**: Inline scripts bypass all caching issues

### Technical Improvements
- **Code organization**: Separated chatbot functions into dedicated section
- **Error handling**: Comprehensive try-catch with graceful fallbacks
- **Debug logging**: Added extensive console logging for troubleshooting
- **Type safety**: Improved null checks and type validation
- **API standardization**: Consolidated all endpoints to port 5002

## [2.0.0] - 2025-10-31

### Added - Enhanced Ticket System

#### Enhanced Data Generator
- **15,000 tickets** with intelligent distribution
- **150 field teams** with Malaysian names
- **Smart assignment engine**: Location, capacity, skill-based
- **Enhanced fields**:
  - States and zones (all 15 Malaysian states)
  - Ticket aging (days since creation)
  - SLA tracking (target time, breach status)
  - Efficiency scores (time-based performance)
  - Customer information (name, contact)
  - Location details (state, district, zone, coordinates)

#### ticketv2 API
- **New endpoint**: `/api/ticketv2`
- **Pagination support**: `offset` and `limit` parameters
- **Enhanced response**: Includes total count
- **Richer data**: All new fields included
- **Performance optimized**: Fast queries for 15,000+ tickets

#### Analytics Enhancements
- **Performance analytics**: Efficiency calculations
- **Trend analysis**: Week-over-week comparisons
- **Zone breakdowns**: State and district-level metrics
- **Team productivity**: Completion rates and rankings

### Changed

#### API Consolidation
- **Port standardization**: All APIs on port 5002 (was mixed 8085/5002)
- **Endpoint updates**: Updated all frontend calls
- **Config centralization**: Single API_BASE configuration

#### UI Layout
- **Field Teams page**: Reverted to toggle button layout
- **Zone Performance**: Enhanced state and district breakdowns
- **Top Performers**: Now shows productivity % prominently
- **Recent Tickets**: Fixed to show latest 10 tickets

### Fixed
- **Port mismatch**: Standardized 8085 → 5002
- **Missing endpoint**: Added /api/ticketv2
- **Data structure**: Fixed ticketv2Data.tickets access
- **Analytics assignments**: Derived from tickets
- **Zone materials**: Added array validation

## [1.5.0] - 2025-10-30

### Added - Field Portal Features

#### Field Team Portal
- **Dedicated portal**: field-portal.html for field teams
- **Personal dashboard**: User-specific KPIs and metrics
- **Route planning**: Interactive map with assigned tickets
- **Performance charts**: Weekly trends and category breakdown
- **Expense tracking**: Log and track field expenses

#### Live Tracking
- **Real-time map**: Team locations and ticket markers
- **Route visualization**: Optimized paths and turn-by-turn
- **Distance calculation**: Haversine formula for accurate routing
- **Traffic light status**: Visual status indicators (red/yellow/green)

### Changed
- **Login system**: Separate admin and field team authentication
- **Ticket filtering**: User-specific filtering for field portal
- **Status workflow**: 4-state system (open, in_progress, closed, cancelled)

### Fixed
- **Duplicate variable declarations**: Renamed conflicting variables
- **Null value handling**: Added checks for undefined/null data
- **Zone performance**: Fixed team availability extraction

## [1.0.0] - 2025-10-15

### Added - Initial Release

#### Core Features
- **Main dashboard**: Overview, tickets, teams, analytics
- **Basic ticket management**: CRUD operations
- **Team management**: Basic team profiles
- **Simple analytics**: KPI cards and basic charts
- **Sample data generator**: 1,000 tickets, 50 teams

#### Basic Infrastructure
- **Flask backend**: RESTful API on port 8085
- **Static frontend**: HTML/CSS/JavaScript
- **Chart.js integration**: Basic visualization
- **Bootstrap UI**: Responsive design

---

## Migration Notes

### Upgrading from 2.0.0 to 2.5.0

**Backend Changes**:
```bash
# Install OpenAI (optional)
pip install openai

# Set API key (optional)
export OPENAI_API_KEY="sk-your-key-here"

# Restart server
python3 backend_server.py
```

**Frontend Changes**:
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache if chatbot doesn't work
- Update bookmarks to correct ports (8080 for frontend, 5002 for backend)

**Data Migration**:
- No migration needed (data regenerates on startup)
- Enhanced data generator creates 15,000 tickets automatically

**API Changes**:
- New endpoint: `POST /api/ai/chat` for chatbot
- Enhanced: `GET /api/ticketv2` with pagination
- All APIs now on port 5002 (was 8085)

### Breaking Changes in 2.5.0

- **Port change**: Frontend APIs changed from 8085 → 5002
- **API structure**: ticketv2 returns flat `tickets` array (not nested)
- **Function names**: Some chart functions renamed to avoid collisions
- **Inline JavaScript**: Chatbot functions defined inline (not in external .js)

### Deprecated Features

- **Port 8085**: No longer used (all on 5002)
- **Old /api/tickets**: Use /api/ticketv2 instead
- **Microservices**: Simplified to single Flask backend
- **Docker Compose**: Not required for development

---

## Version Comparison

| Feature | v1.0.0 | v2.0.0 | v2.5.0 |
|---------|--------|--------|--------|
| Tickets | 1,000 | 15,000 | 15,000 |
| Teams | 50 | 150 | 187 |
| APIs | Basic | Enhanced | + OpenAI |
| Languages | EN only | EN only | EN + BM |
| AI Chatbot | Simple | Basic | OpenAI-powered |
| Field Portal | Basic | Enhanced | + AI Assistant |
| Performance | Good | Better | Optimized |
| Documentation | 2 files | 8 files | 15+ files |

---

**For detailed technical changes, see individual documentation files in the repository.**

**Last Updated**: November 4, 2025  
**Current Version**: 2.5.0  
**Next Release**: 3.0.0 (PostgreSQL migration)


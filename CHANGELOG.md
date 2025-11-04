# Changelog

All notable changes to AIFF (Advanced Intelligence Field Force) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2025-11-04

### 🎉 Added

#### OpenAI Integration
- **OpenAI GPT-3.5-turbo integration** in backend (`backend_server.py`)
  - New `/api/ai/chat` endpoint with language and context support
  - `call_openai_chat()` function for GPT-3.5-turbo API calls
  - `generate_intelligent_response()` fallback with full bilingual support
  - User-specific context (teamId, tickets, metrics) passed to AI
  - Works with OR without API key (graceful degradation)

#### Bahasa Malaysia Translation
- **Full bilingual support** (English ⇄ Bahasa Malaysia)
  - Real-time language switching in chatbot
  - All AI responses fully translated (not just UI labels)
  - Natural Malay phrasing for better user experience
  - Keyword detection in both languages
  - Bilingual greetings, metrics, and recommendations

#### Field Portal nBOTS Chatbot
- **Complete chatbot implementation** in field portal
  - 520px × 680px floating chat window with smooth animations
  - 282 lines of CSS styling (message bubbles, avatars, animations)
  - Inline JavaScript functions (bypasses browser caching)
  - Purple gradient theme matching admin dashboard
  - Typing indicator with animated dots
  - 4 quick action suggestion chips
  - Enter key support for sending messages
  - Auto-scroll to latest message

#### Enhanced Features
- **Personalized performance greeting** with real data
  - Fetches user-specific tickets from ticketv2 API
  - Calculates completion rate, efficiency, rating
  - Shows today's tickets vs overall performance
  - Updates when language switches
  - Displays in styled performance cards

- **Interactive chat functionality**
  - Send messages and get AI responses
  - Typing indicator while AI processes
  - Context-aware responses based on user data
  - Quick action buttons for common queries
  - Clear chat button to reload greeting

#### Documentation
- `OPENAI_INTEGRATION.md` (567 lines) - Complete AI architecture
- `QUICK_START_OPENAI.md` (197 lines) - Testing guide
- `TESTING_NBOTS_CHATBOT.md` (250 lines) - 60+ item QA checklist
- `DEBUG_NBOTS_CHATBOT.md` (289 lines) - Troubleshooting guide
- `NBOTS_COMPLETE_FIX.md` (279 lines) - Technical fix summary
- Updated `FIELD_PORTAL_CHATBOT_REVAMP.md` (256 lines)
- Updated `README.md` with showcase and latest features

### 🔧 Fixed

#### Chatbot Issues
- Fixed chatbot toggle not opening (ReferenceError)
- Fixed functions not globally accessible for onclick handlers
- Resolved duplicate DOMContentLoaded listeners
- Fixed greeting stuck on "Loading performance insights..."
- Added inline onclick handler to toggle button
- Exposed all chatbot functions to window object immediately

#### CSS & Styling
- Added missing CSS for `.ai-message`, `.ai-avatar`, `.ai-content`
- Added message bubble styling with gradients
- Added avatar circles with purple/green gradients
- Added typing indicator styles and animations
- Added suggestion chip hover effects
- Added input field focus effects
- Added all animations (slideUp, messageSlideIn, typingDot, pulseBadge)

#### Browser Caching
- Implemented inline script approach to bypass .js file caching
- Defined functions directly in HTML for immediate availability
- Added script version bumping (v=24 → v=25 → v=26 → v=27)
- Added verification console logs
- Ensured functions available before onclick handlers fire

### 🚀 Improved

#### Backend
- Enhanced `/api/ai/chat` to accept language parameter
- Added user context extraction (teamId, tickets, metrics)
- Improved error handling and logging
- Added provider identification (openai vs fallback)
- Optimized response generation for both languages

#### Frontend
- Improved greeting loading timing (1-second delay)
- Enhanced language toggle with full state management
- Better error messages in both languages
- Improved typing indicator UX
- Added comprehensive debug logging
- Better scroll behavior for new messages

#### Performance
- Reduced initial chatbot load time
- Optimized API data fetching (parallel requests)
- Cached user metrics calculation
- Improved animation performance
- Better mobile responsiveness

### 📊 Changed

- Updated script version from v=22 to v=27 (field-portal.js)
- Modified chatbot initialization to use inline scripts
- Changed language toggle from alert to actual translation
- Moved greeting loading from immediate to delayed (1000ms)
- Updated clear chat to reload enhanced greeting
- Modified all chatbot functions to window. assignments

### 🔒 Security

- Added input sanitization for AI chat messages
- Implemented API key security (environment variable only)
- Added error handling to prevent information leakage
- Validated user context before processing requests

## [2.4.0] - 2025-10-31

### Added
- Enhanced ticketv2 API with 15,000 tickets
- Smart assignment engine with capacity limits
- Zone-based performance analytics
- Field portal revert to stable version (commit 75b0be0)

### Fixed
- Field portal KPI filtering (user-specific only)
- Team availability display (object/string handling)
- Canvas ID conflicts in Chart.js
- Pagination for ticket list view

## [2.3.0] - 2025-10-30

### Added
- Live tracking page with Leaflet.js
- Mobile performance optimization
- Data caching system with TTL
- Request debouncing and throttling

### Fixed
- High-level performance metrics in Tickets Performance Analysis
- Ticket filter based on ticketv2 API
- Team assignment logic

## [2.2.0] - 2025-10-29

### Added
- Recent tickets list (top 10, sorted by date)
- Team name resolution for ticket display
- Ticket detail modal with comprehensive info
- Number formatting with commas (every 1k)

### Fixed
- Main dashboard overview recent ticket list
- Top performer completed data showing 0
- Rankings not sorted by productivity %

## [2.1.0] - 2025-10-28

### Added
- Zone performance view with enhanced breakdown
- Field teams management with enriched ticket counts
- Performance analysis charts
- Comparison data with trend indicators

### Fixed
- Field teams management and Zones View data source
- null/zero values in zone displays
- Availability status extraction

## [2.0.0] - 2025-10-27

### Added
- Complete ticketv2 API with 15,000 enhanced tickets
- Enhanced data generator with intelligent assignment
- 4-state ticket system (open, in_progress, closed, cancelled)
- SLA tracking and aging calculations
- Efficiency scoring system
- Malaysian states, zones, and districts
- 150+ field teams with realistic names

### Changed
- Migrated all pages from /api/tickets to /api/ticketv2
- Standardized API endpoints to port 5002
- Updated all frontend limit parameters to 20000

### Fixed
- Port mismatch (8085 vs 5002)
- Missing API endpoints
- Data structure inconsistencies

## [1.0.0] - 2025-10-26

### Added
- Initial release
- Basic ticket management
- Field team portal
- Admin dashboard
- Sample data generator

---

## Version Format

- **Major.Minor.Patch** (Semantic Versioning)
- **Major**: Breaking changes, major features
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes, small improvements

## Upgrade Guide

### From 2.4.x to 2.5.0

1. **Pull latest code**:
   ```bash
   git pull origin main
   ```

2. **Install OpenAI (optional)**:
   ```bash
   pip install openai
   ```

3. **Set API key (optional)**:
   ```bash
   export OPENAI_API_KEY="sk-your-key"
   ```

4. **Restart servers**:
   ```bash
   # Stop old servers (Ctrl+C)
   python3 backend_server.py &
   cd client && python3 -m http.server 8080
   ```

5. **Test chatbot**:
   - Open field portal
   - Hard refresh (Ctrl+Shift+R)
   - Click robot button
   - Test EN/BM switching

### Breaking Changes in 2.5.0

- None! Fully backwards compatible.
- OpenAI is optional (works without API key)
- All existing features still work

---

**AIFF - Advanced Intelligence Field Force**  
*Empowering Malaysian field teams with AI-driven insights and optimization* 🇲🇾 🤖

**Latest Version**: 2.5.0 | **Released**: November 4, 2025 | **Status**: ✅ Production Ready

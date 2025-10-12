# Intelligent Field Assignment System

A comprehensive web application for intelligent job assignment and trouble ticket management for field teams. The system uses AI-powered algorithms to automatically assign tickets to field team members based on productivity, availability, cost, distance, and skills matching.

## Features

### 🎯 Intelligent Assignment Algorithm
- **Multi-factor scoring system** considering:
  - Field team productivity and performance history
  - Current availability and working hours
  - Cost efficiency (hourly rate + travel costs)
  - Geographic distance and travel time
  - Skills matching with ticket requirements
- **Real-time optimization** with automatic assignment suggestions
- **Manual override capabilities** for special cases

### 🗺️ Geolocation & Route Optimization
- **Distance calculation** using Haversine formula and Google Maps API
- **Travel time estimation** with traffic considerations
- **Route optimization** for multiple assignments (TSP approximation)
- **Real-time location tracking** for field team members
- **Interactive map visualization** with live updates

### 🤖 LLM Integration
- **AI-powered assistance** for field team queries
- **Performance insights** and recommendations
- **Troubleshooting suggestions** based on ticket details
- **Natural language processing** for ticket analysis
- **Context-aware responses** using team and ticket data

### 📊 Analytics & Monitoring
- **Real-time dashboard** with key performance metrics
- **Team performance tracking** with productivity scores
- **Ticket analytics** with completion rates and response times
- **Cost analysis** and efficiency metrics
- **Historical data** and trend analysis

### 🔄 Real-time Updates
- **WebSocket integration** for live updates
- **Status notifications** for assignments and completions
- **Location tracking** with automatic updates
- **Live map** showing team positions and ticket locations

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **OpenAI API** for LLM integration
- **Google Maps API** for geolocation services
- **JWT** for authentication
- **Helmet** for security

### Frontend
- **HTML5/CSS3/JavaScript** (ES6+)
- **Bootstrap 5** for responsive UI
- **Leaflet.js** for interactive maps
- **Font Awesome** for icons
- **Socket.IO Client** for real-time updates

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Google Maps API key (optional, for enhanced geolocation)
- OpenAI API key (for LLM features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd intelligent-field-assignment
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/intelligent-field-assignment

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5000 (served from client/public/index.html)

## API Endpoints

### Tickets
- `GET /api/tickets` - Get all tickets with filtering
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/assign` - Manually assign ticket
- `POST /api/tickets/:id/auto-assign` - Auto-assign ticket
- `PATCH /api/tickets/:id/status` - Update ticket status
- `GET /api/tickets/analytics/overview` - Get ticket analytics

### Field Teams
- `GET /api/field-teams` - Get all field team members
- `POST /api/field-teams` - Create new team member
- `GET /api/field-teams/:id` - Get team member by ID
- `PUT /api/field-teams/:id` - Update team member
- `PATCH /api/field-teams/:id/location` - Update location
- `PATCH /api/field-teams/:id/availability` - Update availability
- `GET /api/field-teams/:id/performance` - Get performance data
- `GET /api/field-teams/nearby/:lat/:lng` - Get nearby teams

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `PATCH /api/assignments/:id/status` - Update assignment status
- `POST /api/assignments/:id/reject` - Reject assignment
- `GET /api/assignments/analytics/overview` - Get assignment analytics

## Usage Guide

### 1. Setting Up Field Teams
1. Navigate to the "Field Teams" section
2. Click "Add Team Member"
3. Fill in team member details including:
   - Personal information (name, email, phone)
   - Skills and specializations
   - Current location coordinates
   - Hourly rate and availability

### 2. Creating Tickets
1. Go to the "Tickets" section
2. Click "New Ticket"
3. Provide ticket details:
   - Title and description
   - Priority level and category
   - Customer information
   - Location with coordinates
   - Estimated duration

### 3. Intelligent Assignment
- **Automatic**: Tickets are automatically assigned using the intelligent algorithm
- **Manual**: Override automatic assignments when needed
- **Real-time**: View assignment scores and reasoning

### 4. Monitoring & Analytics
- **Dashboard**: Overview of key metrics and recent activity
- **Live Map**: Real-time view of team locations and ticket assignments
- **Analytics**: Performance metrics and trend analysis

## Algorithm Details

The intelligent assignment algorithm uses a weighted scoring system:

### Scoring Factors
1. **Productivity (30%)**: Based on past performance, customer ratings, and completion efficiency
2. **Availability (20%)**: Current availability status and working hours
3. **Cost (20%)**: Hourly rate and travel cost efficiency
4. **Distance (20%)**: Geographic proximity and estimated travel time
5. **Skills (10%)**: Match between required skills and team member capabilities

### Score Calculation
```
Total Score = (Productivity × 0.3) + (Availability × 0.2) + (Cost × 0.2) + (Distance × 0.2) + (Skills × 0.1)
```

### Real-time Optimization
- Continuous monitoring of team availability
- Dynamic re-assignment for urgent tickets
- Route optimization for multiple assignments
- Cost-benefit analysis for each assignment

## LLM Integration

The system integrates with OpenAI's GPT models to provide:

### Field Team Assistance
- **Performance insights**: AI-generated analysis of team performance
- **Troubleshooting guidance**: Step-by-step solutions for common issues
- **Query processing**: Natural language queries about tickets and assignments
- **Recommendations**: Personalized suggestions for improvement

### Query Types
- Performance analysis and trends
- Ticket details and troubleshooting
- Route optimization suggestions
- Schedule and availability queries
- Customer communication assistance

## Security Features

- **Rate limiting** to prevent API abuse
- **Input validation** and sanitization
- **CORS configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **JWT authentication** for protected routes
- **Environment variable** protection for sensitive data

## Performance Optimization

- **Database indexing** for efficient queries
- **Geospatial indexing** for location-based searches
- **Caching strategies** for frequently accessed data
- **Connection pooling** for database efficiency
- **Real-time updates** with WebSocket optimization

## Deployment

### Production Considerations
1. **Environment variables**: Set production values for all configuration
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **API keys**: Ensure all external API keys are properly configured
4. **SSL/TLS**: Enable HTTPS for production deployment
5. **Monitoring**: Set up logging and monitoring systems

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## Roadmap

### Future Enhancements
- [ ] Mobile application for field teams
- [ ] Advanced reporting and BI integration
- [ ] Machine learning for predictive assignment
- [ ] Integration with external ticketing systems
- [ ] Advanced route optimization algorithms
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] Performance benchmarking tools

---

**Built with ❤️ for efficient field service management**

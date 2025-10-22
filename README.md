# AIFF - Intelligent Field Assignment System

## 🚀 Overview

AIFF (AI Field Force) is a comprehensive intelligent field assignment system that leverages AI and machine learning to optimize field team operations, ticket management, and resource allocation. The system provides real-time analytics, predictive insights, and automated assignment capabilities for field service teams.

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Main Dashboard  │  Field Portal  │  Performance Analytics     │
│  (React/HTML)    │  (React/HTML)  │  (Charts & Reports)        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Authentication  │  Rate Limiting  │  Routing  │
│  (Port 8085)    │  (JWT Tokens)   │  (Redis)       │  (FastAPI)│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Auth Service   │  Tickets Service │  Analytics Service │ AI Service │
│  (Port 8000)    │  (Port 8001)    │  (Port 8002)      │ (Port 8003)│
│  PostgreSQL     │  PostgreSQL     │  PostgreSQL        │ OpenAI API │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL     │  Redis Cache    │  File Storage    │  Monitoring │
│  (Port 5432)    │  (Port 6379)   │  (Local/Cloud)  │ (Grafana)  │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### 🤖 AI-Powered Intelligence
- **Smart Assignment**: AI-driven ticket assignment based on team availability, skills, and location
- **Predictive Analytics**: Forecast ticket volumes, resource needs, and performance trends
- **Real-time Insights**: Live dashboard with KPIs, team performance, and zone analytics
- **NRO-Bots Assistant**: AI chatbot for system guidance and optimization tips

### 📊 Advanced Analytics
- **Performance Metrics**: Team productivity, efficiency, and customer satisfaction tracking
- **Zone Analysis**: Geographic performance analysis with heat maps and trends
- **Cost Optimization**: Resource allocation optimization and cost analysis
- **Predictive Planning**: Future capacity planning and demand forecasting

### 🎫 Intelligent Ticket Management
- **Smart Routing**: Automatic ticket assignment based on team capabilities and workload
- **Priority Management**: Dynamic priority adjustment based on SLA and impact
- **Status Tracking**: Real-time ticket status updates and progress monitoring
- **Material Forecasting**: Predictive material requirements and inventory management

### 👥 Team Management
- **Performance Tracking**: Individual and team performance metrics
- **Skill Mapping**: Team capability assessment and skill matching
- **Availability Management**: Real-time team availability and scheduling
- **Zone Optimization**: Geographic team distribution and coverage analysis

## 🛠️ Technology Stack

### Frontend Technologies
- **HTML5/CSS3**: Modern responsive design with Bootstrap 5
- **JavaScript (ES6+)**: Advanced client-side logic and API integration
- **Chart.js**: Interactive data visualization and analytics
- **Progressive Web App**: Offline capabilities and mobile optimization

### Backend Technologies
- **Python 3.9+**: Core backend development
- **FastAPI**: High-performance async API framework
- **SQLAlchemy**: Advanced ORM for database operations
- **PostgreSQL**: Robust relational database
- **Redis**: High-performance caching and session management

### AI/ML Technologies
- **OpenAI GPT**: Natural language processing and AI assistance
- **Scikit-learn**: Machine learning algorithms for predictions
- **Pandas**: Data analysis and manipulation
- **NumPy**: Numerical computing and statistical analysis

### Infrastructure
- **Docker**: Containerized microservices deployment
- **Docker Compose**: Multi-service orchestration
- **Nginx**: Reverse proxy and load balancing
- **Grafana**: System monitoring and observability
- **Prometheus**: Metrics collection and alerting

## 📁 Project Structure

```
intelligent-field-assignment/
├── client/                          # Frontend Application
│   ├── public/                      # Static assets
│   │   ├── index.html              # Main dashboard
│   │   └── field-portal.html       # Field team portal
│   └── src/                        # JavaScript source
│       ├── app.js                  # Main dashboard logic
│       ├── field-portal.js         # Field portal logic
│       └── config.js               # Configuration
├── services/                        # Microservices
│   ├── auth/                       # Authentication Service
│   │   ├── main.py                 # FastAPI application
│   │   ├── models.py               # Database models
│   │   └── schemas.py              # Pydantic schemas
│   ├── tickets/                    # Tickets Service
│   ├── analytics/                  # Analytics Service
│   ├── ai/                         # AI Service
│   └── gateway/                    # API Gateway
├── scripts/                        # Utility scripts
│   ├── populate_team_performance.py # Data population
│   └── migrate_data.py            # Data migration
├── monitoring/                      # Monitoring setup
│   ├── grafana/                    # Grafana dashboards
│   └── prometheus.yml              # Prometheus config
├── docker-compose.yml              # Service orchestration
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.9+
- Node.js 16+ (for development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/intelligent-field-assignment.git
   cd intelligent-field-assignment
   ```

2. **Start the system**
   ```bash
   ./start_system.sh
   ```

3. **Access the application**
   - Main Dashboard: http://localhost:8080
   - Field Portal: http://localhost:8080/field-portal.html
   - API Gateway: http://localhost:8085

### Development Setup

1. **Install dependencies**
   ```bash
   # Backend services
   cd services/auth && pip install -r requirements.txt
   cd services/tickets && pip install -r requirements.txt
   cd services/analytics && pip install -r requirements.txt
   cd services/ai && pip install -r requirements.txt
   ```

2. **Start individual services**
   ```bash
   # Start database
   docker-compose up -d postgres redis
   
   # Start services individually
   cd services/auth && python main.py
   cd services/tickets && python main.py
   cd services/analytics && python main.py
   cd services/ai && python main.py
   ```

## 📊 System Components

### Frontend Applications

#### Main Dashboard (`/client/public/index.html`)
- **Overview Tab**: System KPIs, team status, and performance metrics
- **Tickets Tab**: Ticket management, assignment, and tracking
- **Field Teams Tab**: Team management, performance analytics, and zone analysis
- **Predictive Planning Tab**: AI-powered forecasting and capacity planning
- **Map View Tab**: Geographic visualization and zone management
- **NRO-Bots Tab**: AI assistant for system guidance

#### Field Portal (`/client/public/field-portal.html`)
- **Team Dashboard**: Field team performance and status
- **Ticket Management**: Assigned tickets and progress tracking
- **Performance Analytics**: Individual and team metrics
- **AI Assistant**: Field-specific guidance and optimization

### Backend Microservices

#### Authentication Service (`/services/auth/`)
- **Port**: 8000
- **Database**: PostgreSQL
- **Features**:
  - User authentication and authorization
  - Team management and profiles
  - Role-based access control
  - JWT token management

#### Tickets Service (`/services/tickets/`)
- **Port**: 8001
- **Database**: PostgreSQL
- **Features**:
  - Ticket CRUD operations
  - Assignment algorithms
  - Status tracking
  - Priority management

#### Analytics Service (`/services/analytics/`)
- **Port**: 8002
- **Database**: PostgreSQL
- **Features**:
  - Performance metrics calculation
  - Trend analysis
  - Predictive analytics
  - Report generation

#### AI Service (`/services/ai/`)
- **Port**: 8003
- **External APIs**: OpenAI GPT
- **Features**:
  - Natural language processing
  - AI-powered insights
  - Chatbot functionality
  - Predictive recommendations

#### API Gateway (`/services/gateway/`)
- **Port**: 8085
- **Features**:
  - Request routing
  - Load balancing
  - Rate limiting
  - Authentication middleware

## 🔧 Configuration

### Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aiff_db
REDIS_URL=redis://localhost:6379

# API Configuration
API_BASE=http://localhost:8085/api
OPENAI_API_KEY=your_openai_api_key

# Service Ports
AUTH_SERVICE_PORT=8000
TICKETS_SERVICE_PORT=8001
ANALYTICS_SERVICE_PORT=8002
AI_SERVICE_PORT=8003
GATEWAY_PORT=8085
```

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: System users and authentication
- **Teams**: Field teams and their capabilities
- **Tickets**: Service requests and assignments
- **Assignments**: Team-ticket relationships
- **Analytics**: Performance metrics and trends

## 📈 Monitoring and Observability

### Grafana Dashboards
- **System Overview**: Service health and performance
- **Business Metrics**: KPIs and operational metrics
- **Infrastructure**: Resource utilization and alerts

### Prometheus Metrics
- **Service Health**: Uptime and response times
- **Business Metrics**: Ticket volumes, team performance
- **Infrastructure**: CPU, memory, and network usage

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure API authentication
- **Role-based Access**: Granular permission system
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data sanitization

### Data Protection
- **Encryption**: Data encryption at rest and in transit
- **Audit Logging**: Comprehensive activity tracking
- **Privacy Controls**: GDPR-compliant data handling

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale auth=3 --scale tickets=3
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /auth/teams` - Team management

### Tickets Endpoints
- `GET /tickets` - List tickets
- `POST /tickets` - Create ticket
- `PUT /tickets/{id}` - Update ticket
- `DELETE /tickets/{id}` - Delete ticket

### Analytics Endpoints
- `GET /analytics/overview` - System overview
- `GET /analytics/performance` - Performance metrics
- `GET /analytics/trends` - Trend analysis

### AI Endpoints
- `POST /ai/chat` - Chat with AI assistant
- `POST /ai/analyze` - AI-powered analysis
- `GET /ai/insights` - AI-generated insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added AI-powered features and analytics
- **v1.2.0**: Enhanced microservices architecture
- **v1.3.0**: Improved UI/UX and performance optimization

---

<<<<<<< HEAD
**AIFF - Intelligent Field Assignment System**  
*Empowering field teams with AI-driven insights and optimization*
=======
**Last Updated**: October 2024  
**Version**: 2.0.0 (Microservices)  
**Developed by**: ✅ HN NASE
>>>>>>> 6513e3e7c7c2da35d22e51e98f5dbff1c5ffac60

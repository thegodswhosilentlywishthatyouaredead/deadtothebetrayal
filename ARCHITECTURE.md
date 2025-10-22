# AIFF System Architecture Documentation

## 🏗️ System Architecture Overview

The AIFF (AI Field Force) system is built on a modern microservices architecture with a focus on scalability, maintainability, and real-time performance. The system consists of multiple layers working together to provide intelligent field assignment capabilities.

## 📐 Architecture Layers

### 1. Presentation Layer (Frontend)
```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Applications                       │
├─────────────────────────────────────────────────────────────────┤
│  Main Dashboard        │  Field Portal        │  Mobile App      │
│  (HTML/CSS/JS)         │  (HTML/CSS/JS)       │  (React Native)  │
│  - Real-time UI        │  - Field Operations   │  - Offline Sync  │
│  - Interactive Charts  │  - Team Management   │  - Push Notif.  │
│  - AI Chatbot          │  - Performance Data  │  - GPS Tracking │
└─────────────────────────────────────────────────────────────────┘
```

### 2. API Gateway Layer
```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Port 8085)                   │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Authentication  │  Rate Limiting  │  Routing  │
│  - Nginx        │  - JWT Tokens    │  - Redis        │  - FastAPI│
│  - SSL/TLS      │  - OAuth2        │  - Throttling   │  - Swagger│
└─────────────────────────────────────────────────────────────────┘
```

### 3. Microservices Layer
```
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Architecture                  │
├─────────────────────────────────────────────────────────────────┤
│  Auth Service   │  Tickets Service │  Analytics Service │ AI Service │
│  (Port 8000)    │  (Port 8001)    │  (Port 8002)      │ (Port 8003)│
│  - User Mgmt    │  - Ticket CRUD   │  - Performance    │ - OpenAI   │
│  - Teams        │  - Assignment    │  - Analytics      │ - Chatbot  │
│  - Permissions  │  - Status        │  - Reports        │ - Insights │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Data Layer
```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL     │  Redis Cache    │  File Storage    │  Monitoring │
│  (Port 5432)    │  (Port 6379)    │  (Local/Cloud)   │ (Grafana)   │
│  - Primary DB   │  - Sessions     │  - Attachments   │ - Metrics   │
│  - ACID         │  - Cache        │  - Logs          │ - Alerts    │
│  - Replication  │  - Pub/Sub      │  - Backups       │ - Dashboards│
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Detailed Component Architecture

### Frontend Architecture

#### Main Dashboard (`/client/public/index.html`)
```javascript
// Core Components
├── Dashboard Overview
│   ├── KPI Cards (Tickets, Teams, Performance)
│   ├── Real-time Charts (Chart.js)
│   ├── Zone Performance Analysis
│   └── Top Performers Ranking
├── Ticket Management
│   ├── Ticket List with Filtering
│   ├── Assignment Controls (Auto/Manual)
│   ├── Status Tracking
│   └── Priority Management
├── Field Teams Management
│   ├── Team Performance Analytics
│   ├── Zone Distribution
│   ├── Productivity Metrics
│   └── Performance Analysis
├── Predictive Planning
│   ├── AI-powered Forecasting
│   ├── Capacity Planning
│   ├── Resource Optimization
│   └── Demand Prediction
├── Map View
│   ├── Geographic Visualization
│   ├── Zone Heat Maps
│   ├── Team Locations
│   └── Coverage Analysis
└── NRO-Bots AI Assistant
    ├── Chat Interface
    ├── Real-time Analytics
    ├── Performance Insights
    └── Optimization Tips
```

#### Field Portal (`/client/public/field-portal.html`)
```javascript
// Field-Specific Components
├── Team Dashboard
│   ├── Personal Performance
│   ├── Assigned Tickets
│   ├── Team Status
│   └── Zone Information
├── Ticket Management
│   ├── Active Tickets
│   ├── Progress Tracking
│   ├── Status Updates
│   └── Completion Reports
├── Performance Analytics
│   ├── Individual Metrics
│   ├── Team Comparison
│   ├── Zone Performance
│   └── Historical Data
└── AI Assistant
    ├── Field Guidance
    ├── Troubleshooting
    ├── Best Practices
    └── Optimization Tips
```

### Backend Microservices Architecture

#### Authentication Service (`/services/auth/`)
```python
# FastAPI Application Structure
├── main.py
│   ├── FastAPI App Configuration
│   ├── CORS Middleware
│   ├── Database Connection
│   └── Route Registration
├── models.py
│   ├── User Model (SQLAlchemy)
│   ├── Team Model
│   ├── Role Model
│   └── Permission Model
├── schemas.py
│   ├── User Schemas (Pydantic)
│   ├── Team Schemas
│   ├── Auth Schemas
│   └── Response Schemas
└── requirements.txt
    ├── FastAPI
    ├── SQLAlchemy
    ├── PostgreSQL Driver
    └── JWT Library

# API Endpoints
├── POST /auth/login
├── POST /auth/register
├── GET /auth/teams
├── POST /auth/teams
├── PUT /auth/teams/{id}
├── DELETE /auth/teams/{id}
├── GET /auth/teams/analytics/zones
└── GET /auth/teams/analytics/performance
```

#### Tickets Service (`/services/tickets/`)
```python
# FastAPI Application Structure
├── main.py
│   ├── FastAPI App Configuration
│   ├── Database Models
│   ├── Business Logic
│   └── API Endpoints
├── models.py
│   ├── Ticket Model
│   ├── Assignment Model
│   ├── Status Model
│   └── Priority Model
├── schemas.py
│   ├── Ticket Schemas
│   ├── Assignment Schemas
│   ├── Filter Schemas
│   └── Response Schemas
└── requirements.txt
    ├── FastAPI
    ├── SQLAlchemy
    ├── PostgreSQL Driver
    └── Pydantic

# API Endpoints
├── GET /tickets
├── POST /tickets
├── GET /tickets/{id}
├── PUT /tickets/{id}
├── DELETE /tickets/{id}
├── POST /tickets/assign
├── GET /tickets/analytics/overview
└── GET /tickets/analytics/performance
```

#### Analytics Service (`/services/analytics/`)
```python
# FastAPI Application Structure
├── main.py
│   ├── FastAPI App Configuration
│   ├── Analytics Engine
│   ├── Data Processing
│   └── Report Generation
├── models.py
│   ├── Analytics Models
│   ├── Metric Models
│   ├── Report Models
│   └── Trend Models
├── schemas.py
│   ├── Analytics Schemas
│   ├── Metric Schemas
│   ├── Report Schemas
│   └── Response Schemas
└── requirements.txt
    ├── FastAPI
    ├── Pandas
    ├── NumPy
    ├── Scikit-learn
    └── Matplotlib

# API Endpoints
├── GET /analytics/overview
├── GET /analytics/performance
├── GET /analytics/trends
├── GET /analytics/reports
├── POST /analytics/calculate
└── GET /analytics/export
```

#### AI Service (`/services/ai/`)
```python
# FastAPI Application Structure
├── main.py
│   ├── FastAPI App Configuration
│   ├── OpenAI Integration
│   ├── NLP Processing
│   └── AI Endpoints
├── models.py
│   ├── AI Models
│   ├── Chat Models
│   ├── Insight Models
│   └── Prediction Models
├── schemas.py
│   ├── Chat Schemas
│   ├── AI Schemas
│   ├── Insight Schemas
│   └── Response Schemas
└── requirements.txt
    ├── FastAPI
    ├── OpenAI
    ├── Transformers
    ├── NLTK
    └── SpaCy

# API Endpoints
├── POST /ai/chat
├── POST /ai/analyze
├── GET /ai/insights
├── POST /ai/predict
└── GET /ai/status
```

#### API Gateway (`/services/gateway/`)
```python
# FastAPI Application Structure
├── main.py
│   ├── FastAPI App Configuration
│   ├── Load Balancing
│   ├── Request Routing
│   ├── Authentication Middleware
│   ├── Rate Limiting
│   └── Error Handling
├── middleware/
│   ├── auth_middleware.py
│   ├── rate_limit_middleware.py
│   ├── logging_middleware.py
│   └── error_middleware.py
└── requirements.txt
    ├── FastAPI
    ├── Redis
    ├── JWT
    └── HTTPX

# Gateway Features
├── Request Routing
├── Load Balancing
├── Authentication
├── Rate Limiting
├── Caching
├── Logging
└── Error Handling
```

## 🗄️ Database Architecture

### PostgreSQL Database Schema

#### Core Tables
```sql
-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams and Field Operations
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    tickets_completed INTEGER DEFAULT 0,
    customer_rating DECIMAL(3,2) DEFAULT 0.00,
    response_time INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    efficiency DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets and Service Requests
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    assigned_team INTEGER REFERENCES teams(id),
    assigned_to VARCHAR(100),
    zone VARCHAR(100),
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    completed_at TIMESTAMP
);

-- Assignments and Relationships
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    team_id INTEGER REFERENCES teams(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'assigned',
    notes TEXT
);

-- Analytics and Performance Data
CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    zone VARCHAR(100),
    date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

#### Indexes and Performance
```sql
-- Performance Indexes
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_zone ON tickets(zone);
CREATE INDEX idx_tickets_assigned_team ON tickets(assigned_team);
CREATE INDEX idx_teams_zone ON teams(zone);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_analytics_metric ON analytics(metric_name);
CREATE INDEX idx_analytics_date ON analytics(date_recorded);

-- Composite Indexes
CREATE INDEX idx_tickets_zone_status ON tickets(zone, status);
CREATE INDEX idx_teams_zone_status ON teams(zone, status);
CREATE INDEX idx_analytics_team_date ON analytics(team_id, date_recorded);
```

### Redis Cache Architecture

#### Cache Structure
```redis
# Session Management
session:{user_id} -> {
    "user_id": "123",
    "username": "john_doe",
    "role": "admin",
    "expires": "2024-01-01T00:00:00Z"
}

# Team Performance Cache
team:performance:{team_id} -> {
    "tickets_completed": 45,
    "customer_rating": 4.8,
    "response_time": 25,
    "completion_rate": 92.5,
    "efficiency": 88.3
}

# Zone Analytics Cache
zone:analytics:{zone_name} -> {
    "total_teams": 5,
    "active_teams": 4,
    "open_tickets": 12,
    "closed_tickets": 38,
    "productivity": 4.6,
    "efficiency": 85.2
}

# API Rate Limiting
rate_limit:{user_id}:{endpoint} -> {
    "count": 45,
    "window_start": "2024-01-01T00:00:00Z",
    "limit": 100
}
```

## 🔄 Data Flow Architecture

### 1. User Request Flow
```
User Request → Frontend → API Gateway → Microservice → Database
     ↓              ↓           ↓            ↓           ↓
  Browser      JavaScript    Load Balancer  FastAPI    PostgreSQL
     ↓              ↓           ↓            ↓           ↓
  Response ← Frontend ← API Gateway ← Microservice ← Database
```

### 2. Real-time Data Flow
```
Database Changes → WebSocket → Frontend Updates
       ↓              ↓            ↓
  PostgreSQL    Real-time    Live Dashboard
       ↓         Updates         ↓
  Triggers → WebSocket → Chart Updates
```

### 3. AI Processing Flow
```
User Query → AI Service → OpenAI API → Response Processing → Frontend
     ↓           ↓           ↓              ↓              ↓
  Chat Input  FastAPI    GPT-4 Model    NLP Processing   Chat Display
     ↓           ↓           ↓              ↓              ↓
  Context → Analysis → AI Response → Formatting → User Interface
```

## 🔧 Configuration Management

### Environment Configuration
```bash
# Database Configuration
DATABASE_URL=postgresql://aiff:aiffpass@localhost:5432/aiff_db
REDIS_URL=redis://localhost:6379

# Service Configuration
AUTH_SERVICE_URL=http://localhost:8000
TICKETS_SERVICE_URL=http://localhost:8001
ANALYTICS_SERVICE_URL=http://localhost:8002
AI_SERVICE_URL=http://localhost:8003
GATEWAY_URL=http://localhost:8085

# API Configuration
API_BASE=http://localhost:8085/api
OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# Monitoring Configuration
GRAFANA_URL=http://localhost:3000
PROMETHEUS_URL=http://localhost:9090
```

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: aiff_db
      POSTGRES_USER: aiff
      POSTGRES_PASSWORD: aiffpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  auth-service:
    build: ./services/auth
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://aiff:aiffpass@postgres:5432/aiff_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  tickets-service:
    build: ./services/tickets
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://aiff:aiffpass@postgres:5432/aiff_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  analytics-service:
    build: ./services/analytics
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=postgresql://aiff:aiffpass@postgres:5432/aiff_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./services/ai
    ports:
      - "8003:8003"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://aiff:aiffpass@postgres:5432/aiff_db
    depends_on:
      - postgres

  gateway:
    build: ./services/gateway
    ports:
      - "8085:8085"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:8000
      - TICKETS_SERVICE_URL=http://tickets-service:8001
      - ANALYTICS_SERVICE_URL=http://analytics-service:8002
      - AI_SERVICE_URL=http://ai-service:8003
    depends_on:
      - auth-service
      - tickets-service
      - analytics-service
      - ai-service

volumes:
  postgres_data:
  redis_data:
```

## 📊 Monitoring and Observability

### Grafana Dashboards
```yaml
# monitoring/grafana/dashboards/dashboard.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    access: proxy
    isDefault: true

dashboards:
  - name: AIFF System Overview
    panels:
      - title: Service Health
        type: stat
        targets:
          - expr: up{job="aiff-services"}
      - title: Request Rate
        type: graph
        targets:
          - expr: rate(http_requests_total[5m])
      - title: Response Time
        type: graph
        targets:
          - expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'aiff-services'
    static_configs:
      - targets: ['auth-service:8000', 'tickets-service:8001', 'analytics-service:8002', 'ai-service:8003']
    metrics_path: /metrics
    scrape_interval: 5s
```

## 🔒 Security Architecture

### Authentication Flow
```
User Login → JWT Token → API Gateway → Service Validation
     ↓           ↓           ↓              ↓
  Credentials  Token      Middleware    Service Access
     ↓           ↓           ↓              ↓
  Database → Token → Authorization → Resource Access
```

### Security Measures
- **JWT Tokens**: Secure authentication
- **HTTPS/TLS**: Encrypted communication
- **Rate Limiting**: API protection
- **Input Validation**: Data sanitization
- **CORS**: Cross-origin protection
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content sanitization

## 🚀 Deployment Architecture

### Production Deployment
```
Load Balancer (Nginx) → API Gateway → Microservices → Database
       ↓                    ↓              ↓           ↓
   SSL/TLS            Authentication   Business    PostgreSQL
   Termination        & Routing        Logic      + Redis
       ↓                    ↓              ↓           ↓
   CDN/Static         Service Mesh    Container    Replication
   Assets            (Istio)         Orchestration  & Backup
```

### Scaling Strategy
- **Horizontal Scaling**: Multiple service instances
- **Load Balancing**: Request distribution
- **Database Scaling**: Read replicas
- **Caching**: Redis cluster
- **CDN**: Static asset delivery

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading
- **Caching**: Browser cache
- **Compression**: Gzip/Brotli
- **CDN**: Static assets
- **PWA**: Offline capabilities

### Backend Optimization
- **Database Indexing**: Query optimization
- **Connection Pooling**: Database connections
- **Caching**: Redis cache
- **Async Processing**: Background tasks
- **API Optimization**: Response compression

### Infrastructure Optimization
- **Container Orchestration**: Kubernetes
- **Auto-scaling**: HPA/VPA
- **Resource Limits**: CPU/Memory
- **Monitoring**: Real-time metrics
- **Alerting**: Automated notifications

---

This architecture documentation provides a comprehensive overview of the AIFF system's design, implementation, and deployment strategies. The system is built to be scalable, maintainable, and performant while providing intelligent field assignment capabilities.

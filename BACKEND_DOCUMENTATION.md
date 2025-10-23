# AIFF Backend Documentation 🇲🇾

## 🏗️ Backend Architecture Overview

The AIFF backend is built on a modern microservices architecture using Python, FastAPI, and PostgreSQL. The system consists of four main microservices working together to provide intelligent field assignment capabilities across Malaysia, supporting 150 teams and 1000+ tickets.

## 🇲🇾 Malaysian Data Support

### Geographic Coverage
- **15 Malaysian States**: Full support for all Malaysian states as zones
- **150 Teams**: Malaysian personalities with realistic team assignments
- **1000+ Tickets**: Malaysian locations with proper coordinates
- **Multi-Zone Analytics**: Performance tracking across Malaysian states

## 📁 Backend Structure

```
services/
├── auth/                           # Authentication Service
│   ├── main.py                    # FastAPI application
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Container configuration
├── tickets/                       # Tickets Service
│   ├── main.py                    # FastAPI application
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Container configuration
├── analytics/                     # Analytics Service
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Container configuration
├── ai/                           # AI Service
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Container configuration
└── gateway/                       # API Gateway
    ├── main.py                    # FastAPI application
    ├── requirements.txt           # Python dependencies
    └── Dockerfile                 # Container configuration
```

## 🔐 Authentication Service (`/services/auth/`)

### Service Overview
The Authentication Service handles user authentication, team management, and authorization for the entire system.

### Port: 8000
### Database: PostgreSQL
### Dependencies: FastAPI, SQLAlchemy, PostgreSQL, Redis

### Core Models (`models.py`)
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    zone = Column(String(100), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    tickets_completed = Column(Integer, default=0)
    customer_rating = Column(DECIMAL(3, 2), default=0.00)
    response_time = Column(Integer, default=0)
    completion_rate = Column(DECIMAL(5, 2), default=0.00)
    efficiency = Column(DECIMAL(5, 2), default=0.00)
    status = Column(String(20), default="available")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### API Endpoints (`main.py`)
```python
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .models import User, Team
from .schemas import UserCreate, UserResponse, TeamCreate, TeamResponse

app = FastAPI(title="Authentication Service", version="1.0.0")

# User Management Endpoints
@app.post("/auth/login", response_model=UserResponse)
async def login_user(credentials: UserCredentials, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    pass

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    pass

# Team Management Endpoints
@app.get("/auth/teams", response_model=List[TeamResponse])
async def get_teams(db: Session = Depends(get_db)):
    """Get all active teams with performance data"""
    pass

@app.post("/auth/teams", response_model=TeamResponse)
async def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create new team"""
    pass

@app.put("/auth/teams/{team_id}", response_model=TeamResponse)
async def update_team(team_id: int, team: TeamUpdate, db: Session = Depends(get_db)):
    """Update team information"""
    pass

@app.delete("/auth/teams/{team_id}")
async def delete_team(team_id: int, db: Session = Depends(get_db)):
    """Delete team"""
    pass

# Analytics Endpoints
@app.get("/auth/teams/analytics/zones")
async def get_teams_zones(db: Session = Depends(get_db)):
    """Get teams zone analytics with performance data"""
    pass

@app.get("/auth/teams/analytics/performance")
async def get_teams_performance(db: Session = Depends(get_db)):
    """Get teams performance analytics"""
    pass
```

### Pydantic Schemas (`schemas.py`)
```python
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    name: str
    zone: str
    description: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: int
    is_active: bool
    tickets_completed: int
    customer_rating: float
    response_time: int
    completion_rate: float
    efficiency: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ProductivityData(BaseModel):
    ticketsCompleted: int
    customerRating: float
    responseTime: int
    completionRate: float
    efficiency: float

class EnhancedTeamResponse(TeamResponse):
    productivity: ProductivityData
```

## 🎫 Tickets Service (`/services/tickets/`)

### Service Overview
The Tickets Service manages the complete ticket lifecycle, from creation to resolution, including assignment algorithms and status tracking.

### Port: 8001
### Database: PostgreSQL
### Dependencies: FastAPI, SQLAlchemy, PostgreSQL, Redis

### Core Models (`models.py`)
```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    priority = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="open")
    assigned_team = Column(Integer, ForeignKey("teams.id"))
    assigned_to = Column(String(100))
    zone = Column(String(100))
    location = Column(String(200))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), default="assigned")
    notes = Column(Text)
```

### API Endpoints (`main.py`)
```python
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .models import Ticket, Assignment
from .schemas import TicketCreate, TicketUpdate, TicketResponse, AssignmentCreate

app = FastAPI(title="Tickets Service", version="1.0.0")

# Ticket Management Endpoints
@app.get("/tickets", response_model=List[TicketResponse])
async def get_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    zone: Optional[str] = Query(None),
    assigned_team: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get tickets with filtering and pagination"""
    pass

@app.post("/tickets", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create new ticket"""
    pass

@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Get ticket by ID"""
    pass

@app.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: int, ticket: TicketUpdate, db: Session = Depends(get_db)):
    """Update ticket"""
    pass

@app.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete ticket"""
    pass

# Assignment Endpoints
@app.post("/tickets/assign")
async def assign_ticket(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    """Assign ticket to team"""
    pass

@app.post("/tickets/auto-assign")
async def auto_assign_tickets(
    ticket_ids: List[int],
    criteria: AssignmentCriteria,
    db: Session = Depends(get_db)
):
    """Auto-assign tickets using AI algorithm"""
    pass

# Analytics Endpoints
@app.get("/tickets/analytics/overview")
async def get_ticket_overview(db: Session = Depends(get_db)):
    """Get ticket analytics overview"""
    pass

@app.get("/tickets/analytics/performance")
async def get_ticket_performance(db: Session = Depends(get_db)):
    """Get ticket performance metrics"""
    pass
```

### Assignment Algorithm
```python
class AssignmentAlgorithm:
    def __init__(self, db: Session):
        self.db = db
    
    def auto_assign_ticket(self, ticket: Ticket) -> Optional[int]:
        """AI-powered ticket assignment algorithm"""
        # Get available teams in the same zone
        available_teams = self.get_available_teams(ticket.zone)
        
        if not available_teams:
            return None
        
        # Calculate assignment score for each team
        team_scores = []
        for team in available_teams:
            score = self.calculate_assignment_score(ticket, team)
            team_scores.append((team.id, score))
        
        # Sort by score and return best match
        team_scores.sort(key=lambda x: x[1], reverse=True)
        return team_scores[0][0] if team_scores else None
    
    def calculate_assignment_score(self, ticket: Ticket, team: Team) -> float:
        """Calculate assignment score based on multiple factors"""
        score = 0.0
        
        # Zone match (40% weight)
        if ticket.zone == team.zone:
            score += 0.4
        
        # Team availability (30% weight)
        if team.status == "available":
            score += 0.3
        
        # Workload balance (20% weight)
        workload_score = 1.0 - (team.tickets_completed / 100.0)
        score += workload_score * 0.2
        
        # Performance rating (10% weight)
        performance_score = team.customer_rating / 5.0
        score += performance_score * 0.1
        
        return score
```

## 📊 Analytics Service (`/services/analytics/`)

### Service Overview
The Analytics Service provides comprehensive analytics, reporting, and data processing capabilities for the system.

### Port: 8002
### Database: PostgreSQL
### Dependencies: FastAPI, Pandas, NumPy, Scikit-learn, Matplotlib

### Core Functionality (`main.py`)
```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import io
import base64

app = FastAPI(title="Analytics Service", version="1.0.0")

class AnalyticsEngine:
    def __init__(self, db: Session):
        self.db = db
        self.scaler = StandardScaler()
    
    def calculate_performance_metrics(self, team_id: int) -> dict:
        """Calculate comprehensive performance metrics for a team"""
        # Get team data
        team_data = self.get_team_data(team_id)
        
        # Calculate metrics
        metrics = {
            "productivity": self.calculate_productivity(team_data),
            "efficiency": self.calculate_efficiency(team_data),
            "customer_satisfaction": self.calculate_satisfaction(team_data),
            "response_time": self.calculate_response_time(team_data),
            "completion_rate": self.calculate_completion_rate(team_data)
        }
        
        return metrics
    
    def generate_trend_analysis(self, data: pd.DataFrame) -> dict:
        """Generate trend analysis using machine learning"""
        # Prepare data
        X = data[['tickets_completed', 'response_time', 'customer_rating']]
        y = data['efficiency']
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate predictions
        predictions = model.predict(X)
        
        return {
            "trend": "increasing" if predictions[-1] > predictions[0] else "decreasing",
            "change": float((predictions[-1] - predictions[0]) / predictions[0] * 100),
            "forecast": predictions.tolist()
        }
    
    def create_performance_report(self, team_ids: List[int], period: str) -> dict:
        """Generate comprehensive performance report"""
        report_data = {
            "summary": self.generate_summary(team_ids, period),
            "metrics": self.calculate_team_metrics(team_ids, period),
            "trends": self.analyze_trends(team_ids, period),
            "recommendations": self.generate_recommendations(team_ids, period),
            "charts": self.generate_charts(team_ids, period)
        }
        
        return report_data

# API Endpoints
@app.get("/analytics/overview")
async def get_system_overview(db: Session = Depends(get_db)):
    """Get system-wide analytics overview"""
    engine = AnalyticsEngine(db)
    return engine.get_system_overview()

@app.get("/analytics/performance")
async def get_performance_analytics(
    period: str = "week",
    team_id: Optional[int] = None,
    zone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get performance analytics with filtering"""
    engine = AnalyticsEngine(db)
    return engine.get_performance_analytics(period, team_id, zone)

@app.get("/analytics/trends")
async def get_trend_analysis(db: Session = Depends(get_db)):
    """Get trend analysis and predictions"""
    engine = AnalyticsEngine(db)
    return engine.get_trend_analysis()

@app.post("/analytics/reports")
async def generate_report(
    report_request: ReportRequest,
    db: Session = Depends(get_db)
):
    """Generate custom analytics report"""
    engine = AnalyticsEngine(db)
    return engine.create_performance_report(
        report_request.team_ids,
        report_request.period
    )
```

## 🤖 AI Service (`/services/ai/`)

### Service Overview
The AI Service provides artificial intelligence capabilities including natural language processing, predictive analytics, and intelligent recommendations.

### Port: 8003
### External APIs: OpenAI GPT
### Dependencies: FastAPI, OpenAI, Transformers, NLTK, SpaCy

### Core Functionality (`main.py`)
```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import openai
from transformers import pipeline
import nltk
import spacy

app = FastAPI(title="AI Service", version="1.0.0")

class AIService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.nlp = spacy.load("en_core_web_sm")
    
    async def process_chat_message(self, message: str, context: dict) -> dict:
        """Process chat message and generate AI response"""
        # Analyze message intent
        intent = self.analyze_intent(message)
        
        # Get relevant data based on intent
        data = await self.get_relevant_data(intent, context)
        
        # Generate response using OpenAI
        response = await self.generate_response(message, data, context)
        
        return {
            "response": response,
            "suggestions": self.generate_suggestions(intent, data),
            "context": {
                "conversation_id": context.get("conversation_id"),
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    async def analyze_performance_data(self, data: dict) -> dict:
        """Analyze performance data and provide insights"""
        # Process data with AI
        analysis = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI analyst specializing in field team performance."},
                {"role": "user", "content": f"Analyze this performance data: {data}"}
            ]
        )
        
        return {
            "summary": analysis.choices[0].message.content,
            "insights": self.extract_insights(analysis.choices[0].message.content),
            "recommendations": self.generate_recommendations(data),
            "confidence": 0.92
        }
    
    async def generate_predictions(self, prediction_type: str, data: dict) -> dict:
        """Generate predictions using AI models"""
        if prediction_type == "ticket_volume":
            return await self.predict_ticket_volume(data)
        elif prediction_type == "team_performance":
            return await self.predict_team_performance(data)
        elif prediction_type == "customer_satisfaction":
            return await self.predict_customer_satisfaction(data)
        else:
            raise HTTPException(status_code=400, detail="Invalid prediction type")

# API Endpoints
@app.post("/ai/chat")
async def chat_with_ai(
    message: ChatMessage,
    db: Session = Depends(get_db)
):
    """Chat with AI assistant"""
    ai_service = AIService()
    return await ai_service.process_chat_message(message.message, message.context)

@app.post("/ai/analyze")
async def analyze_data(
    analysis_request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """Analyze data using AI"""
    ai_service = AIService()
    return await ai_service.analyze_performance_data(analysis_request.data)

@app.get("/ai/insights")
async def get_ai_insights(
    type: str = "performance",
    scope: str = "system",
    period: str = "week",
    db: Session = Depends(get_db)
):
    """Get AI-generated insights"""
    ai_service = AIService()
    return await ai_service.get_insights(type, scope, period)

@app.post("/ai/predict")
async def generate_predictions(
    prediction_request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """Generate AI predictions"""
    ai_service = AIService()
    return await ai_service.generate_predictions(
        prediction_request.prediction_type,
        prediction_request.data
    )
```

## 🌐 API Gateway (`/services/gateway/`)

### Service Overview
The API Gateway provides a unified entry point for all client requests, handling routing, load balancing, authentication, and rate limiting.

### Port: 8085
### Dependencies: FastAPI, HTTPX, Redis, JWT

### Core Functionality (`main.py`)
```python
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import httpx
import redis
import jwt
from datetime import datetime, timedelta

app = FastAPI(title="API Gateway", version="1.0.0")

# Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class APIGateway:
    def __init__(self):
        self.redis_client = redis.Redis(host="redis", port=6379, db=0)
        self.service_urls = {
            "auth": "http://auth-service:8000",
            "tickets": "http://tickets-service:8001",
            "analytics": "http://analytics-service:8002",
            "ai": "http://ai-service:8003"
        }
        self.http_client = httpx.AsyncClient()
    
    async def route_request(self, service: str, path: str, method: str, 
                          headers: dict, body: dict = None) -> dict:
        """Route request to appropriate microservice"""
        service_url = self.service_urls.get(service)
        if not service_url:
            raise HTTPException(status_code=404, detail="Service not found")
        
        url = f"{service_url}{path}"
        
        try:
            response = await self.http_client.request(
                method=method,
                url=url,
                headers=headers,
                json=body
            )
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail="Service unavailable")
    
    async def authenticate_request(self, token: str) -> dict:
        """Authenticate JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    async def rate_limit_check(self, user_id: str, endpoint: str) -> bool:
        """Check rate limiting for user and endpoint"""
        key = f"rate_limit:{user_id}:{endpoint}"
        current_count = self.redis_client.get(key)
        
        if current_count is None:
            self.redis_client.setex(key, 3600, 1)  # 1 hour window
            return True
        
        if int(current_count) >= 1000:  # Rate limit
            return False
        
        self.redis_client.incr(key)
        return True

# Gateway Endpoints
@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def gateway_route(service: str, path: str, request: Request):
    """Route requests to microservices"""
    gateway = APIGateway()
    
    # Authentication
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user_data = await gateway.authenticate_request(token)
        
        # Rate limiting
        if not await gateway.rate_limit_check(user_data["user_id"], f"{service}/{path}"):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Route request
    return await gateway.route_request(
        service=service,
        path=f"/{path}",
        method=request.method,
        headers=dict(request.headers),
        body=await request.json() if request.method in ["POST", "PUT"] else None
    )
```

## 🗄️ Database Design

### PostgreSQL Schema
```sql
-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tickets and Service Requests
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    assigned_team INTEGER REFERENCES teams(id),
    assigned_to VARCHAR(100),
    zone VARCHAR(100),
    location VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Assignments and Relationships
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    team_id INTEGER REFERENCES teams(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for Performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_zone ON tickets(zone);
CREATE INDEX idx_tickets_assigned_team ON tickets(assigned_team);
CREATE INDEX idx_teams_zone ON teams(zone);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_analytics_metric ON analytics(metric_name);
CREATE INDEX idx_analytics_date ON analytics(date_recorded);
```

## 🔧 Configuration Management

### Environment Variables
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

# Security Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here

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

## 🚀 Deployment and Scaling

### Production Deployment
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale auth=3 --scale tickets=3

# Health checks
docker-compose ps
docker-compose logs -f
```

### Kubernetes Deployment
```yaml
# k8s/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: aiff/auth-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: aiff-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📊 Monitoring and Observability

### Health Checks
```python
# Health check endpoints for each service
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
```

### Metrics Collection
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active database connections')
```

---

This backend documentation provides comprehensive information about the AIFF backend architecture, microservices design, database schema, and deployment strategies.

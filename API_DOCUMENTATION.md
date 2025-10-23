# AIFF API Documentation 🇲🇾

## 🌐 API Overview

The AIFF (AI Field Force) system provides a comprehensive REST API for managing field teams, tickets, analytics, and AI-powered insights across Malaysia. The system supports 150 teams across 15 Malaysian states with 1000+ active tickets. All APIs are accessible through the API Gateway at `http://localhost:8085/api`.

## 🇲🇾 Malaysian Context

### Geographic Coverage
- **15 Malaysian States**: Johor, Kedah, Kelantan, Melaka, Negeri Sembilan, Pahang, Penang, Perak, Perlis, Sabah, Sarawak, Selangor, Terengganu, Kuala Lumpur, Putrajaya
- **150 Field Teams**: Named after prominent Malaysian personalities
- **1000+ Active Tickets**: Distributed across Malaysian locations with realistic coordinates
- **Multi-Zone Analytics**: Performance tracking across all Malaysian states

## 🔐 Authentication

### Authentication Flow
```http
POST /auth/login
Content-Type: application/json

{
    "username": "john_doe",
    "password": "secure_password"
}
```

### Response
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "admin"
    }
}
```

### Using Authentication
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🏢 Authentication Service API

### Base URL: `http://localhost:8000/auth`

#### User Management

##### Login User
```http
POST /auth/login
Content-Type: application/json

{
    "username": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "access_token": "string",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
        "id": 1,
        "username": "string",
        "email": "string",
        "role": "string"
    }
}
```

##### Register User
```http
POST /auth/register
Content-Type: application/json

{
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string"
}
```

**Response:**
```json
{
    "message": "User created successfully",
    "user": {
        "id": 1,
        "username": "string",
        "email": "string",
        "role": "string"
    }
}
```

#### Team Management

##### Get All Teams
```http
GET /auth/teams
Authorization: Bearer {token}
```

**Response:**
```json
{
    "teams": [
        {
            "id": 1,
            "name": "Team Alpha",
            "zone": "Kuala Lumpur",
            "is_active": true,
            "description": "High-performing team",
            "productivity": {
                "ticketsCompleted": 45,
                "customerRating": 4.8,
                "responseTime": 25,
                "completionRate": 92.5,
                "efficiency": 88.3
            },
            "status": "available",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
}
```

##### Create Team
```http
POST /auth/teams
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Team Beta",
    "zone": "Penang",
    "description": "New team for Penang operations"
}
```

**Response:**
```json
{
    "message": "Team created successfully",
    "team": {
        "id": 2,
        "name": "Team Beta",
        "zone": "Penang",
        "is_active": true,
        "description": "New team for Penang operations",
        "created_at": "2024-01-01T00:00:00Z"
    }
}
```

##### Update Team
```http
PUT /auth/teams/{team_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Team Beta Updated",
    "zone": "Penang",
    "description": "Updated team description"
}
```

##### Delete Team
```http
DELETE /auth/teams/{team_id}
Authorization: Bearer {token}
```

#### Team Analytics

##### Get Zone Analytics
```http
GET /auth/teams/analytics/zones
Authorization: Bearer {token}
```

**Response:**
```json
{
    "zones": [
        {
            "zoneName": "Kuala Lumpur",
            "zone": "Kuala Lumpur",
            "totalTeams": 5,
            "activeTeams": 4,
            "openTickets": 12,
            "closedTickets": 38,
            "productivity": 4.6,
            "efficiency": 85.2,
            "teams": [
                {
                    "id": 1,
                    "name": "Team Alpha",
                    "zone": "Kuala Lumpur",
                    "ticketsCompleted": 45,
                    "openTickets": 3,
                    "closedTickets": 45,
                    "productivity": 4.8,
                    "customerRating": 4.8,
                    "responseTime": 25,
                    "completionRate": 92.5,
                    "status": "available"
                }
            ]
        }
    ]
}
```

## 🎫 Tickets Service API

### Base URL: `http://localhost:8001/tickets`

#### Ticket Management

##### Get All Tickets
```http
GET /tickets
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: Filter by status (open, in_progress, completed, closed)
- `priority`: Filter by priority (low, medium, high, urgent)
- `zone`: Filter by zone
- `assigned_team`: Filter by assigned team
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
    "tickets": [
        {
            "id": 1,
            "ticket_number": "TKT-2024-001",
            "title": "Network Outage - KL Central",
            "description": "Complete network outage in KL Central area",
            "priority": "high",
            "status": "open",
            "assigned_team": 1,
            "assigned_to": "Team Alpha",
            "zone": "Kuala Lumpur",
            "location": "KL Central",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "due_date": "2024-01-02T00:00:00Z",
            "completed_at": null
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "pages": 5
    }
}
```

##### Create Ticket
```http
POST /tickets
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "New Network Issue",
    "description": "Network connectivity problems in downtown area",
    "priority": "medium",
    "zone": "Kuala Lumpur",
    "location": "Downtown KL"
}
```

**Response:**
```json
{
    "message": "Ticket created successfully",
    "ticket": {
        "id": 2,
        "ticket_number": "TKT-2024-002",
        "title": "New Network Issue",
        "description": "Network connectivity problems in downtown area",
        "priority": "medium",
        "status": "open",
        "assigned_team": null,
        "assigned_to": null,
        "zone": "Kuala Lumpur",
        "location": "Downtown KL",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "due_date": null,
        "completed_at": null
    }
}
```

##### Get Ticket by ID
```http
GET /tickets/{ticket_id}
Authorization: Bearer {token}
```

##### Update Ticket
```http
PUT /tickets/{ticket_id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Updated Network Issue",
    "description": "Updated description",
    "priority": "high",
    "status": "in_progress",
    "assigned_team": 1
}
```

##### Delete Ticket
```http
DELETE /tickets/{ticket_id}
Authorization: Bearer {token}
```

#### Ticket Assignment

##### Assign Ticket
```http
POST /tickets/assign
Authorization: Bearer {token}
Content-Type: application/json

{
    "ticket_id": 1,
    "team_id": 1,
    "assignment_type": "manual"
}
```

**Response:**
```json
{
    "message": "Ticket assigned successfully",
    "assignment": {
        "id": 1,
        "ticket_id": 1,
        "team_id": 1,
        "assigned_at": "2024-01-01T00:00:00Z",
        "status": "assigned",
        "notes": "Manual assignment"
    }
}
```

##### Auto-Assign Tickets
```http
POST /tickets/auto-assign
Authorization: Bearer {token}
Content-Type: application/json

{
    "ticket_ids": [1, 2, 3],
    "criteria": {
        "zone_match": true,
        "skill_match": true,
        "workload_balance": true
    }
}
```

#### Ticket Analytics

##### Get Ticket Overview
```http
GET /tickets/analytics/overview
Authorization: Bearer {token}
```

**Response:**
```json
{
    "total_tickets": 150,
    "open_tickets": 25,
    "in_progress_tickets": 30,
    "completed_tickets": 85,
    "closed_tickets": 10,
    "average_resolution_time": 4.5,
    "sla_compliance": 92.5,
    "priority_distribution": {
        "low": 20,
        "medium": 60,
        "high": 25,
        "urgent": 5
    },
    "zone_distribution": {
        "Kuala Lumpur": 45,
        "Penang": 30,
        "Sabah": 25,
        "Sarawak": 20,
        "Johor": 30
    }
}
```

##### Get Performance Metrics
```http
GET /tickets/analytics/performance
Authorization: Bearer {token}
```

**Response:**
```json
{
    "team_performance": [
        {
            "team_id": 1,
            "team_name": "Team Alpha",
            "tickets_completed": 45,
            "average_resolution_time": 3.2,
            "customer_satisfaction": 4.8,
            "efficiency": 88.3
        }
    ],
    "zone_performance": [
        {
            "zone": "Kuala Lumpur",
            "total_tickets": 45,
            "resolved_tickets": 40,
            "average_resolution_time": 4.1,
            "sla_compliance": 95.2
        }
    ]
}
```

## 📊 Analytics Service API

### Base URL: `http://localhost:8002/analytics`

#### System Overview

##### Get System Overview
```http
GET /analytics/overview
Authorization: Bearer {token}
```

**Response:**
```json
{
    "system_health": {
        "status": "healthy",
        "uptime": "99.9%",
        "response_time": 150
    },
    "business_metrics": {
        "total_tickets": 150,
        "active_teams": 12,
        "zones_covered": 5,
        "customer_satisfaction": 4.6
    },
    "performance_metrics": {
        "average_resolution_time": 4.2,
        "sla_compliance": 92.5,
        "team_efficiency": 85.3,
        "zone_coverage": 98.7
    }
}
```

##### Get Performance Analytics
```http
GET /analytics/performance
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: Time period (day, week, month, quarter, year)
- `team_id`: Filter by team
- `zone`: Filter by zone
- `metric`: Specific metric (productivity, efficiency, satisfaction)

**Response:**
```json
{
    "period": "week",
    "metrics": {
        "productivity": {
            "current": 4.6,
            "previous": 4.3,
            "change": 7.0
        },
        "efficiency": {
            "current": 85.3,
            "previous": 82.1,
            "change": 3.9
        },
        "satisfaction": {
            "current": 4.6,
            "previous": 4.4,
            "change": 4.5
        }
    },
    "trends": [
        {
            "date": "2024-01-01",
            "productivity": 4.5,
            "efficiency": 84.2,
            "satisfaction": 4.6
        }
    ]
}
```

##### Get Trend Analysis
```http
GET /analytics/trends
Authorization: Bearer {token}
```

**Response:**
```json
{
    "trends": {
        "ticket_volume": {
            "trend": "increasing",
            "change": 12.5,
            "forecast": [45, 48, 52, 55]
        },
        "team_performance": {
            "trend": "stable",
            "change": 2.3,
            "forecast": [4.6, 4.7, 4.8, 4.9]
        },
        "customer_satisfaction": {
            "trend": "improving",
            "change": 8.7,
            "forecast": [4.6, 4.7, 4.8, 4.9]
        }
    },
    "predictions": {
        "next_week": {
            "ticket_volume": 55,
            "team_performance": 4.7,
            "customer_satisfaction": 4.8
        },
        "next_month": {
            "ticket_volume": 220,
            "team_performance": 4.9,
            "customer_satisfaction": 4.9
        }
    }
}
```

#### Report Generation

##### Generate Performance Report
```http
POST /analytics/reports
Authorization: Bearer {token}
Content-Type: application/json

{
    "report_type": "performance",
    "period": "month",
    "format": "pdf",
    "include_charts": true,
    "teams": [1, 2, 3],
    "zones": ["Kuala Lumpur", "Penang"]
}
```

**Response:**
```json
{
    "report_id": "RPT-2024-001",
    "status": "generating",
    "download_url": "http://localhost:8002/analytics/reports/RPT-2024-001/download",
    "expires_at": "2024-01-08T00:00:00Z"
}
```

##### Get Report Status
```http
GET /analytics/reports/{report_id}
Authorization: Bearer {token}
```

##### Download Report
```http
GET /analytics/reports/{report_id}/download
Authorization: Bearer {token}
```

## 🤖 AI Service API

### Base URL: `http://localhost:8003/ai`

#### Chat Interface

##### Send Chat Message
```http
POST /ai/chat
Authorization: Bearer {token}
Content-Type: application/json

{
    "message": "What's the current team performance?",
    "context": {
        "user_id": 1,
        "role": "admin",
        "current_view": "dashboard"
    }
}
```

**Response:**
```json
{
    "response": "Based on the current data, your team performance is excellent with a 4.6 productivity score and 85.3% efficiency. Here are the key insights:\n\n• Team Alpha is leading with 45 completed tickets\n• Zone coverage is at 98.7%\n• Customer satisfaction is 4.6/5\n\nWould you like me to analyze any specific metrics?",
    "suggestions": [
        "Show detailed team breakdown",
        "Analyze zone performance",
        "Generate optimization recommendations"
    ],
    "context": {
        "conversation_id": "conv_123",
        "timestamp": "2024-01-01T00:00:00Z"
    }
}
```

##### Get Chat History
```http
GET /ai/chat/history
Authorization: Bearer {token}
```

**Query Parameters:**
- `conversation_id`: Specific conversation
- `limit`: Number of messages (default: 50)
- `offset`: Offset for pagination

**Response:**
```json
{
    "conversation_id": "conv_123",
    "messages": [
        {
            "id": 1,
            "role": "user",
            "message": "What's the current team performance?",
            "timestamp": "2024-01-01T00:00:00Z"
        },
        {
            "id": 2,
            "role": "assistant",
            "message": "Based on the current data...",
            "timestamp": "2024-01-01T00:00:01Z"
        }
    ],
    "pagination": {
        "total": 10,
        "limit": 50,
        "offset": 0
    }
}
```

#### AI Analysis

##### Analyze Performance Data
```http
POST /ai/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
    "analysis_type": "performance",
    "data": {
        "teams": [1, 2, 3],
        "period": "week",
        "metrics": ["productivity", "efficiency", "satisfaction"]
    }
}
```

**Response:**
```json
{
    "analysis": {
        "summary": "Performance analysis shows strong overall metrics with some areas for improvement.",
        "insights": [
            "Team Alpha shows exceptional performance with 4.8 productivity score",
            "Zone coverage is excellent at 98.7%",
            "Customer satisfaction is trending upward"
        ],
        "recommendations": [
            "Consider expanding Team Alpha's responsibilities",
            "Focus on improving response times in Zone B",
            "Implement customer feedback loop for continuous improvement"
        ],
        "risk_factors": [
            "High workload on Team Alpha may lead to burnout",
            "Zone B shows declining efficiency trends"
        ]
    },
    "confidence": 0.92,
    "timestamp": "2024-01-01T00:00:00Z"
}
```

##### Get AI Insights
```http
GET /ai/insights
Authorization: Bearer {token}
```

**Query Parameters:**
- `type`: Insight type (performance, optimization, prediction)
- `scope`: Scope (team, zone, system)
- `period`: Time period

**Response:**
```json
{
    "insights": [
        {
            "id": 1,
            "type": "performance",
            "title": "Team Alpha Performance Surge",
            "description": "Team Alpha has shown a 15% improvement in productivity over the last week.",
            "impact": "high",
            "confidence": 0.95,
            "recommendations": [
                "Share best practices with other teams",
                "Consider Team Alpha for high-priority tickets"
            ]
        },
        {
            "id": 2,
            "type": "optimization",
            "title": "Zone Coverage Optimization",
            "description": "Zone B could benefit from additional team coverage during peak hours.",
            "impact": "medium",
            "confidence": 0.87,
            "recommendations": [
                "Schedule additional team members for Zone B",
                "Implement dynamic assignment based on demand"
            ]
        }
    ],
    "summary": {
        "total_insights": 5,
        "high_impact": 2,
        "medium_impact": 2,
        "low_impact": 1
    }
}
```

#### Predictive Analytics

##### Get Predictions
```http
POST /ai/predict
Authorization: Bearer {token}
Content-Type: application/json

{
    "prediction_type": "ticket_volume",
    "period": "next_week",
    "factors": {
        "historical_data": true,
        "seasonal_patterns": true,
        "team_capacity": true
    }
}
```

**Response:**
```json
{
    "prediction": {
        "type": "ticket_volume",
        "period": "next_week",
        "forecast": {
            "monday": 12,
            "tuesday": 15,
            "wednesday": 18,
            "thursday": 16,
            "friday": 14,
            "saturday": 8,
            "sunday": 6
        },
        "confidence": 0.89,
        "factors": [
            "Historical trend analysis",
            "Seasonal patterns",
            "Team capacity constraints"
        ],
        "recommendations": [
            "Prepare for 18 tickets on Wednesday",
            "Consider additional team coverage for mid-week",
            "Weekend coverage appears adequate"
        ]
    },
    "accuracy_metrics": {
        "mape": 8.5,
        "rmse": 2.3,
        "r_squared": 0.92
    }
}
```

## 🔧 API Gateway

### Base URL: `http://localhost:8085/api`

The API Gateway provides a unified interface to all microservices with the following features:

#### Features
- **Load Balancing**: Distributes requests across service instances
- **Authentication**: JWT token validation
- **Rate Limiting**: Prevents API abuse
- **Request Routing**: Routes requests to appropriate services
- **Response Aggregation**: Combines responses from multiple services
- **Error Handling**: Centralized error management
- **Logging**: Request/response logging
- **Caching**: Response caching for improved performance

#### Rate Limiting
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

#### Error Responses
```json
{
    "error": {
        "code": "AUTHENTICATION_FAILED",
        "message": "Invalid or expired token",
        "details": "Token has expired. Please login again.",
        "timestamp": "2024-01-01T00:00:00Z"
    }
}
```

## 📝 Error Codes

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation error
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Custom Error Codes
- `AUTHENTICATION_FAILED`: Invalid credentials
- `TOKEN_EXPIRED`: JWT token expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `VALIDATION_ERROR`: Request data validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure authentication with expiration
- **Role-based Access**: Granular permission system
- **Token Refresh**: Automatic token renewal
- **Session Management**: Secure session handling

### Authorization
- **RBAC**: Role-based access control
- **Resource Permissions**: Fine-grained permissions
- **API Scoping**: Service-specific access control
- **Audit Logging**: Comprehensive access logging

### Data Protection
- **HTTPS/TLS**: Encrypted communication
- **Input Validation**: Comprehensive data sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CORS**: Cross-origin resource sharing

## 📊 Monitoring

### Health Checks
```http
GET /health
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "services": {
        "auth": "healthy",
        "tickets": "healthy",
        "analytics": "healthy",
        "ai": "healthy"
    },
    "database": "connected",
    "redis": "connected"
}
```

### Metrics
```http
GET /metrics
```

**Response:**
```json
{
    "requests_total": 15420,
    "requests_per_second": 12.5,
    "average_response_time": 150,
    "error_rate": 0.02,
    "active_connections": 45
}
```

---

This API documentation provides comprehensive information about all available endpoints, request/response formats, authentication, and error handling for the AIFF system.

# AIFF Microservices Backend

This document describes the new microservices architecture for the AIFF (AI Field Force) system.

## Architecture Overview

The system is built using a microservices architecture with the following components:

### Services

1. **API Gateway** (Port 8085)
   - Routes requests to appropriate microservices
   - Handles CORS, authentication, and rate limiting
   - Single entry point for frontend

2. **Auth Service** (Port 8000)
   - User authentication and authorization
   - JWT token management
   - Team management
   - User registration and login

3. **Tickets Service** (Port 8001)
   - Ticket CRUD operations
   - Assignment management
   - Comments and status tracking
   - SLA monitoring

4. **Analytics Service** (Port 8002)
   - Performance analytics
   - Trend analysis
   - Forecasting
   - Zone-specific metrics

5. **AI Service** (Port 8003)
   - AI-powered recommendations
   - NRO-Bots chat functionality
   - Insights generation
   - Optimization suggestions

### Infrastructure

- **PostgreSQL** (Port 5432) - Primary database
- **pgAdmin** (Port 8083) - Database administration
- **Docker Compose** - Container orchestration

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)

### Starting the Services

1. **Start all services:**
   ```bash
   ./scripts/start_services.sh
   ```

2. **Or manually:**
   ```bash
   docker-compose up --build -d
   ```

3. **Seed the database:**
   ```bash
   python scripts/seed_data.py
   ```

### Service URLs

- **Frontend**: http://localhost:8080
- **API Gateway**: http://localhost:8085
- **pgAdmin**: http://localhost:8083 (admin@local.test / admin123)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/auth/teams` - Get teams

### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket
- `DELETE /api/tickets/{id}` - Delete ticket
- `GET /api/tickets/stats/summary` - Ticket statistics

### Analytics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/trends` - Trend analysis
- `GET /api/analytics/forecast` - Resource forecasting
- `GET /api/analytics/zones` - Zone analytics

### AI
- `POST /api/ai/recommendations` - Get AI recommendations
- `GET /api/ai/insights` - Get AI insights
- `POST /api/ai/chat` - NRO-Bots chat

## Development

### Local Development

1. **Start individual services:**
   ```bash
   cd services/auth
   python main.py
   ```

2. **Database migrations:**
   ```bash
   # Tables are auto-created on first run
   # Use pgAdmin for manual database management
   ```

3. **Testing:**
   ```bash
   # Test individual services
   curl http://localhost:8000/health  # Auth service
   curl http://localhost:8001/health  # Tickets service
   curl http://localhost:8002/health  # Analytics service
   curl http://localhost:8003/health  # AI service
   curl http://localhost:8085/health  # Gateway
   ```

### Database Schema

The system uses SQLAlchemy ORM with the following main entities:

- **Users** - System users and authentication
- **Teams** - Field teams and zones
- **Tickets** - Work orders and tasks
- **Assignments** - Ticket-team assignments
- **Comments** - Ticket comments and updates

### Environment Variables

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql+psycopg://aiff:aiffpass@postgres:5432/aiff_db

# JWT
JWT_SECRET=supersecretlocal

# Service Ports
GATEWAY_PORT=8085
AUTH_SERVICE_PORT=8000
TICKETS_SERVICE_PORT=8001
ANALYTICS_SERVICE_PORT=8002
AI_SERVICE_PORT=8003

# CORS
CORS_ORIGINS=http://localhost:8080
```

## Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth
docker-compose logs -f tickets
docker-compose logs -f analytics
docker-compose logs -f ai
docker-compose logs -f gateway
```

### Health Checks
All services expose health check endpoints at `/health`

### Database Access
- **pgAdmin**: http://localhost:8083
- **Direct connection**: localhost:5432
- **Credentials**: aiff/aiffpass

## Deployment

### Production Considerations

1. **Security**:
   - Change default passwords
   - Use proper JWT secrets
   - Enable HTTPS
   - Configure proper CORS origins

2. **Scaling**:
   - Use load balancers
   - Implement service discovery
   - Add monitoring and alerting
   - Use managed databases

3. **CI/CD**:
   - GitHub Actions for automated builds
   - Docker image registry
   - Automated testing
   - Blue-green deployments

## Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

2. **Database connection issues**:
   ```bash
   docker-compose restart postgres
   ```

3. **Port conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :8085
   lsof -i :5432
   ```

4. **Frontend not connecting**:
   - Verify API_BASE in config.js points to gateway (8085)
   - Check CORS configuration
   - Verify gateway is routing correctly

### Reset Everything
```bash
docker-compose down -v
docker system prune -f
./scripts/start_services.sh
python scripts/seed_data.py
```

## Migration from Monolith

The frontend has been updated to use the new microservices API Gateway:

- **Old**: Direct connection to Flask backend (port 8080)
- **New**: Connection through API Gateway (port 8085)

The API Gateway provides the same endpoints as the old backend, ensuring compatibility.

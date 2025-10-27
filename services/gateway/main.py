from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AIFF API Gateway", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8080").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8000")
TICKETS_URL = os.getenv("TICKETS_URL", "http://localhost:8001")
ANALYTICS_URL = os.getenv("ANALYTICS_URL", "http://localhost:8002")
AI_URL = os.getenv("AI_URL", "http://localhost:8003")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "gateway"}

# Teams endpoints
@app.get("/api/teams")
async def get_teams():
    logger.info("Teams endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams")
            logger.info(f"Auth service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Teams service error: {e}")
            raise HTTPException(status_code=503, detail="Teams service unavailable")

@app.get("/api/teams/analytics/productivity")
async def get_teams_productivity():
    logger.info("Teams productivity endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams/analytics/productivity")
            logger.info(f"Auth service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Teams service error: {e}")
            raise HTTPException(status_code=503, detail="Teams service unavailable")

@app.get("/api/teams/analytics/zones")
async def get_teams_zones():
    logger.info("Teams zones endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams/analytics/zones")
            logger.info(f"Auth service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Teams service error: {e}")
            raise HTTPException(status_code=503, detail="Teams service unavailable")

# Tickets endpoints
@app.get("/api/tickets")
async def get_tickets(request: Request):
    logger.info("Tickets endpoint called")
    # Forward query parameters to tickets service
    query_params = str(request.url.query)
    tickets_url = f"{TICKETS_URL}/tickets"
    if query_params:
        tickets_url += f"?{query_params}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(tickets_url)
            logger.info(f"Tickets service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Tickets service error: {e}")
            raise HTTPException(status_code=503, detail="Tickets service unavailable")

@app.get("/api/tickets/analytics/overview")
async def get_tickets_overview():
    logger.info("Tickets overview endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TICKETS_URL}/tickets/analytics/overview")
            logger.info(f"Tickets service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Tickets service error: {e}")
            raise HTTPException(status_code=503, detail="Tickets service unavailable")

# Ticketv2 API endpoint - Comprehensive ticket data with Malaysian teams
@app.get("/api/ticketv2")
async def get_ticketv2_data(request: Request):
    """Enhanced ticketv2 API with 1000 tickets and 75 Malaysian cabinet name teams"""
    logger.info("Ticketv2 API endpoint called")
    
    # Get query parameters
    limit = request.query_params.get("limit", "1000")
    status = request.query_params.get("status")
    zone = request.query_params.get("zone")
    priority = request.query_params.get("priority")
    category = request.query_params.get("category")
    
    # Build query parameters
    query_params = []
    if limit:
        query_params.append(f"limit={limit}")
    if status:
        query_params.append(f"status={status}")
    if zone:
        query_params.append(f"zone={zone}")
    if priority:
        query_params.append(f"priority={priority}")
    if category:
        query_params.append(f"category={category}")
    
    query_string = "&".join(query_params)
    tickets_url = f"{TICKETS_URL}/tickets"
    if query_string:
        tickets_url += f"?{query_string}"
    
    async with httpx.AsyncClient() as client:
        try:
            # Get tickets data
            tickets_response = await client.get(tickets_url)
            tickets_data = tickets_response.json() if tickets_response.headers.get("content-type", "").startswith("application/json") else {"data": tickets_response.text}
            logger.info(f"Tickets data structure: {type(tickets_data)}, keys: {tickets_data.keys() if isinstance(tickets_data, dict) else 'not dict'}")
            
            # Get teams data
            teams_response = await client.get(f"{AUTH_URL}/auth/teams")
            teams_data = teams_response.json() if teams_response.headers.get("content-type", "").startswith("application/json") else {"data": teams_response.text}
            logger.info(f"Teams data structure: {type(teams_data)}, keys: {teams_data.keys() if isinstance(teams_data, dict) else 'not dict'}")
            
            # Get assignments data
            assignments_response = await client.get(f"{TICKETS_URL}/assignments")
            assignments_data = assignments_response.json() if assignments_response.headers.get("content-type", "").startswith("application/json") else {"data": assignments_response.text}
            logger.info(f"Assignments data structure: {type(assignments_data)}, keys: {assignments_data.keys() if isinstance(assignments_data, dict) else 'not dict'}")
            
            # Combine all data into comprehensive response
            comprehensive_data = {
                "api_version": "v2",
                "description": "Enhanced AIFF Ticket API with Malaysian Cabinet Name Teams",
                "total_tickets": len(tickets_data.get("tickets", [])) if isinstance(tickets_data, dict) else len(tickets_data),
                "total_teams": len(teams_data.get("teams", [])) if isinstance(teams_data, dict) else len(teams_data),
                "total_assignments": len(assignments_data.get("assignments", [])) if isinstance(assignments_data, dict) else len(assignments_data),
                "features": [
                    "1000 tickets with 3 months of realistic data",
                    "75 Malaysian Cabinet Name Teams",
                    "Ticket aging and SLA tracking",
                    "Intelligent assignment engine",
                    "Productivity metrics and efficiency scores",
                    "Root cause analysis with CTT_ticketnum_rootcausetitle format",
                    "Realistic status distribution (25% open, 35% in-progress, 35% completed, 5% cancelled)",
                    "24-hour SLA compliance tracking",
                    "Zone-based team assignment",
                    "Comprehensive analytics and reporting"
                ],
                "tickets": tickets_data,
                "teams": teams_data,
                "assignments": assignments_data,
                "analytics": {
                    "ticket_status_distribution": {
                        "OPEN": 0.25,
                        "IN_PROGRESS": 0.35,
                        "COMPLETED": 0.35,
                        "CANCELLED": 0.05
                    },
                    "sla_compliance": "24 hours",
                    "team_capacity": "Maximum 5 tickets per day per team",
                    "malaysian_states": [
                        'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
                        'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
                        'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya'
                    ],
                    "root_cause_categories": [
                        'FIBER_CUT', 'EQUIP_FAIL', 'POWER_OUT', 'WEATHER', 
                        'CABLE_THEFT', 'CONSTR_DMG', 'MAINT_OVER', 'NET_CONGEST'
                    ]
                }
            }
            
            logger.info(f"Ticketv2 API response: {len(comprehensive_data.get('tickets', {}).get('tickets', []))} tickets, {len(comprehensive_data.get('teams', {}).get('teams', []))} teams")
            return JSONResponse(content=comprehensive_data, status_code=200)
            
        except httpx.RequestError as e:
            logger.error(f"Ticketv2 API service error: {e}")
            raise HTTPException(status_code=503, detail="Ticketv2 API service unavailable")

# Assignments endpoints
@app.get("/api/assignments")
async def get_assignments():
    logger.info("Assignments endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TICKETS_URL}/assignments")
            logger.info(f"Tickets service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Assignments service error: {e}")
            raise HTTPException(status_code=503, detail="Assignments service unavailable")

@app.get("/api/assignments/analytics/performance")
async def get_assignments_performance():
    logger.info("Assignments performance endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TICKETS_URL}/assignments/analytics/performance")
            logger.info(f"Tickets service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Assignments service error: {e}")
            raise HTTPException(status_code=503, detail="Assignments service unavailable")

# Analytics endpoints
@app.get("/api/analytics/tickets/aging")
async def get_tickets_aging():
    logger.info("Tickets aging endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ANALYTICS_URL}/analytics/tickets/aging")
            logger.info(f"Analytics service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Analytics service error: {e}")
            raise HTTPException(status_code=503, detail="Analytics service unavailable")

# Planning endpoints
@app.get("/api/planning/forecast")
async def get_planning_forecast():
    logger.info("Planning forecast endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ANALYTICS_URL}/planning/forecast")
            logger.info(f"Analytics service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Planning service error: {e}")
            raise HTTPException(status_code=503, detail="Planning service unavailable")

@app.get("/api/planning/zone-materials")
async def get_zone_materials():
    logger.info("Zone materials endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ANALYTICS_URL}/planning/zone-materials")
            logger.info(f"Analytics service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Planning service error: {e}")
            raise HTTPException(status_code=503, detail="Planning service unavailable")

# AI endpoints
@app.get("/api/ai/insights")
async def get_ai_insights():
    logger.info("AI insights endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AI_URL}/ai/insights")
            logger.info(f"AI service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"AI service error: {e}")
            raise HTTPException(status_code=503, detail="AI service unavailable")

@app.post("/api/ai/chat")
async def ai_chat(request: dict):
    logger.info("AI chat endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_URL}/ai/chat", json=request)
            logger.info(f"AI service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"AI service error: {e}")
            raise HTTPException(status_code=503, detail="AI service unavailable")

@app.post("/api/ai/recommendations")
async def ai_recommendations(request: dict):
    logger.info("AI recommendations endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_URL}/ai/recommendations", json=request)
            logger.info(f"AI service response: {response.status_code}")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"AI service error: {e}")
            raise HTTPException(status_code=503, detail="AI service unavailable")

# Live Tracking endpoints
@app.get("/api/live-tracking/teams")
async def get_live_teams():
    """Get live tracking data for all teams"""
    logger.info("Live teams tracking endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams/live-tracking")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Live teams tracking service error: {e}")
            raise HTTPException(status_code=503, detail="Live teams tracking service unavailable")

@app.get("/api/live-tracking/teams/{team_id}")
async def get_team_live_tracking(team_id: int):
    """Get live tracking data for a specific team"""
    logger.info(f"Live team tracking endpoint called for team {team_id}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams/{team_id}/live-tracking")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Live team tracking service error: {e}")
            raise HTTPException(status_code=503, detail="Live team tracking service unavailable")

@app.post("/api/live-tracking/teams/{team_id}/update-location")
async def update_team_location(team_id: int, request: dict):
    """Update team location and status"""
    logger.info(f"Update team location endpoint called for team {team_id}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AUTH_URL}/auth/teams/{team_id}/update-location", json=request)
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Update team location service error: {e}")
            raise HTTPException(status_code=503, detail="Update team location service unavailable")

@app.get("/api/live-tracking/routes")
async def get_live_routes():
    """Get live tracking routes between teams and tickets"""
    logger.info("Live routes tracking endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/live-tracking/routes")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Live routes tracking service error: {e}")
            raise HTTPException(status_code=503, detail="Live routes tracking service unavailable")

@app.get("/api/live-tracking/tickets")
async def get_live_tickets():
    """Get live tracking data for active tickets"""
    logger.info("Live tickets tracking endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TICKETS_URL}/tickets/live-tracking")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Live tickets tracking service error: {e}")
            raise HTTPException(status_code=503, detail="Live tickets tracking service unavailable")

@app.get("/api/live-tracking/tickets/{ticket_id}")
async def get_ticket_live_tracking(ticket_id: int):
    """Get live tracking data for a specific ticket"""
    logger.info(f"Live ticket tracking endpoint called for ticket {ticket_id}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TICKETS_URL}/tickets/{ticket_id}/live-tracking")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Live ticket tracking service error: {e}")
            raise HTTPException(status_code=503, detail="Live ticket tracking service unavailable")

@app.post("/api/live-tracking/tickets/{ticket_id}/update-progress")
async def update_ticket_progress(ticket_id: int, request: dict):
    """Update ticket progress and status"""
    logger.info(f"Update ticket progress endpoint called for ticket {ticket_id}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{TICKETS_URL}/tickets/{ticket_id}/update-progress", json=request)
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Update ticket progress service error: {e}")
            raise HTTPException(status_code=503, detail="Update ticket progress service unavailable")

@app.get("/api/live-tracking/assignments")
async def get_live_assignments():
    """Get live assignment data between teams and tickets"""
    logger.info("Live assignments tracking endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TICKETS_URL}/tickets/live-tracking/assignments")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Live assignments tracking service error: {e}")
            raise HTTPException(status_code=503, detail="Live assignments tracking service unavailable")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("GATEWAY_PORT", 8085))
    uvicorn.run(app, host="0.0.0.0", port=port)
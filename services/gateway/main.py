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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("GATEWAY_PORT", 8085))
    uvicorn.run(app, host="0.0.0.0", port=port)
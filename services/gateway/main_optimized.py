from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AIFF API Gateway - Optimized", version="2.0.0")

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
    return {"status": "healthy", "service": "gateway-optimized"}

# Teams endpoints
@app.get("/api/teams")
async def get_teams():
    logger.info("Teams endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams")
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
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Teams productivity service error: {e}")
            raise HTTPException(status_code=503, detail="Teams productivity service unavailable")

@app.get("/api/teams/analytics/zones")
async def get_teams_zones():
    logger.info("Teams zones endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{AUTH_URL}/auth/teams/analytics/zones")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Teams zones service error: {e}")
            raise HTTPException(status_code=503, detail="Teams zones service unavailable")

# Tickets endpoints
@app.get("/api/tickets")
async def get_tickets(request: Request):
    logger.info("Tickets endpoint called")
    query_params = str(request.url.query)
    tickets_url = f"{TICKETS_URL}/tickets"
    if query_params:
        tickets_url += f"?{query_params}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(tickets_url)
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Tickets service error: {e}")
            raise HTTPException(status_code=503, detail="Tickets service unavailable")

@app.post("/api/tickets")
async def create_ticket(request: Request):
    logger.info("Create ticket endpoint called")
    body = await request.json()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{TICKETS_URL}/tickets", json=body)
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
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Tickets service error: {e}")
            raise HTTPException(status_code=503, detail="Tickets service unavailable")

# Analytics endpoints
@app.get("/api/analytics/tickets/aging")
async def get_tickets_aging():
    logger.info("Tickets aging endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{ANALYTICS_URL}/analytics/tickets/aging")
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"Analytics service error: {e}")
            raise HTTPException(status_code=503, detail="Analytics service unavailable")

# AI endpoints
@app.post("/api/ai/chat")
async def ai_chat(request: dict):
    logger.info("AI chat endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_URL}/ai/chat", json=request)
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"AI service error: {e}")
            raise HTTPException(status_code=503, detail="AI service unavailable")

@app.post("/api/ai/query")
async def ai_query(request: dict):
    logger.info("AI query endpoint called")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{AI_URL}/ai/chat", json=request)
            return JSONResponse(
                content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
                status_code=response.status_code
            )
        except httpx.RequestError as e:
            logger.error(f"AI service error: {e}")
            raise HTTPException(status_code=503, detail="AI service unavailable")

# Live tracking endpoints
@app.get("/api/live-tracking/tickets")
async def get_live_tickets():
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

@app.get("/api/live-tracking/teams")
async def get_live_teams():
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)

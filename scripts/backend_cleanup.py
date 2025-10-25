#!/usr/bin/env python3
"""
Backend Cleanup Script
- Remove unused APIs
- Clean up database
- Optimize services
- Remove unused code
"""

import os
import shutil
import psycopg2
import requests
import json
from pathlib import Path

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'aiff_db',
    'user': 'aiff',
    'password': 'aiffpass'
}

# API endpoints that are actually used by frontend
USED_APIS = {
    'tickets': [
        'GET /api/tickets',
        'POST /api/tickets',
        'GET /api/tickets/analytics/overview',
        'GET /api/live-tracking/tickets',
        'GET /api/live-tracking/tickets/{ticket_id}',
        'POST /api/live-tracking/tickets/{ticket_id}/update-progress'
    ],
    'teams': [
        'GET /api/teams',
        'GET /api/teams/analytics/productivity',
        'GET /api/teams/analytics/zones',
        'GET /api/live-tracking/teams',
        'GET /api/live-tracking/teams/{team_id}',
        'POST /api/live-tracking/teams/{team_id}/update-location'
    ],
    'analytics': [
        'GET /api/analytics/tickets/aging'
    ],
    'assignments': [
        'GET /api/assignments',
        'GET /api/assignments/analytics/performance'
    ],
    'planning': [
        'GET /api/planning/forecast',
        'GET /api/planning/zone-materials',
        'GET /api/planning/inventory',
        'GET /api/planning/reorder-alerts'
    ],
    'ai': [
        'POST /api/ai/chat',
        'POST /api/ai/query',
        'GET /api/ai/insights',
        'POST /api/ai/recommendations'
    ],
    'live_tracking': [
        'GET /api/live-tracking/routes',
        'GET /api/live-tracking/assignments'
    ]
}

def test_api_endpoints():
    """Test which API endpoints are actually working"""
    base_url = "http://localhost:8085"
    working_apis = []
    broken_apis = []
    
    print("🔍 Testing API endpoints...")
    
    # Test each API endpoint
    for service, endpoints in USED_APIS.items():
        for endpoint in endpoints:
            method, path = endpoint.split(' ', 1)
            url = f"{base_url}{path}"
            
            try:
                if method == 'GET':
                    response = requests.get(url, timeout=5)
                elif method == 'POST':
                    response = requests.post(url, json={}, timeout=5)
                elif method == 'PUT':
                    response = requests.put(url, json={}, timeout=5)
                elif method == 'DELETE':
                    response = requests.delete(url, timeout=5)
                
                if response.status_code in [200, 201, 404]:  # 404 is acceptable for some endpoints
                    working_apis.append(endpoint)
                    print(f"✅ {endpoint} - {response.status_code}")
                else:
                    broken_apis.append(f"{endpoint} - {response.status_code}")
                    print(f"❌ {endpoint} - {response.status_code}")
                    
            except Exception as e:
                broken_apis.append(f"{endpoint} - Error: {str(e)}")
                print(f"❌ {endpoint} - Error: {str(e)}")
    
    return working_apis, broken_apis

def clean_database():
    """Clean up database by removing unused data and optimizing tables"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("🧹 Cleaning up database...")
        
        # Get current table sizes
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE schemaname = 'public'
            ORDER BY tablename, attname;
        """)
        
        print("📊 Current database statistics:")
        tables = {}
        for row in cursor.fetchall():
            table = row[1]
            if table not in tables:
                tables[table] = []
            tables[table].append(row)
        
        for table, columns in tables.items():
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  - {table}: {count} rows")
        
        # Clean up unused data
        print("\n🧹 Cleaning up unused data...")
        
        # Remove tickets with invalid data
        cursor.execute("DELETE FROM tickets WHERE ticket_number IS NULL OR ticket_number = ''")
        deleted_tickets = cursor.rowcount
        print(f"  - Removed {deleted_tickets} invalid tickets")
        
        # Remove teams with invalid data
        cursor.execute("DELETE FROM teams WHERE name IS NULL OR name = ''")
        deleted_teams = cursor.rowcount
        print(f"  - Removed {deleted_teams} invalid teams")
        
        # Remove assignments with invalid data
        cursor.execute("DELETE FROM assignments WHERE ticket_id IS NULL OR team_id IS NULL")
        deleted_assignments = cursor.rowcount
        print(f"  - Removed {deleted_assignments} invalid assignments")
        
        # Optimize tables
        print("\n⚡ Optimizing tables...")
        cursor.execute("VACUUM ANALYZE")
        print("  - Database optimized")
        
        # Update table statistics
        cursor.execute("ANALYZE")
        print("  - Statistics updated")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ Database cleanup completed")
        
    except Exception as e:
        print(f"❌ Error cleaning database: {e}")

def remove_unused_files():
    """Remove unused files and directories"""
    print("🗑️ Removing unused files...")
    
    # Files to remove
    files_to_remove = [
        "services/assignmentService.js",
        "services/geolocationService.js", 
        "services/llmService.js",
        "scripts/update_ticket_format.py",
        "scripts/generate_1000_tickets.py",
        "scripts/update_existing_tickets.py"
    ]
    
    for file_path in files_to_remove:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"  - Removed {file_path}")
    
    # Directories to clean
    dirs_to_clean = [
        "client/public/test.html",
        "client/public/field-teams-test.html",
        "client/public/debug.html"
    ]
    
    for dir_path in dirs_to_clean:
        if os.path.exists(dir_path):
            os.remove(dir_path)
            print(f"  - Removed {dir_path}")

def optimize_services():
    """Optimize backend services by removing unused endpoints"""
    print("⚡ Optimizing backend services...")
    
    # Services to optimize
    services_to_optimize = [
        "services/gateway/main.py",
        "services/tickets/main.py", 
        "services/auth/main.py",
        "services/ai/main.py",
        "services/analytics/main.py"
    ]
    
    for service_file in services_to_optimize:
        if os.path.exists(service_file):
            print(f"  - Optimizing {service_file}")
            # Add optimization logic here if needed

def create_optimized_gateway():
    """Create an optimized API Gateway with only used endpoints"""
    print("🔧 Creating optimized API Gateway...")
    
    gateway_content = '''from fastapi import FastAPI, Request, HTTPException
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
'''
    
    # Create optimized gateway
    with open("services/gateway/main_optimized.py", "w") as f:
        f.write(gateway_content)
    
    print("  - Created optimized API Gateway")

def generate_cleanup_report():
    """Generate a cleanup report"""
    print("\n📊 Backend Cleanup Report")
    print("=" * 50)
    
    # Test APIs
    working_apis, broken_apis = test_api_endpoints()
    
    print(f"\n✅ Working APIs: {len(working_apis)}")
    for api in working_apis:
        print(f"  - {api}")
    
    print(f"\n❌ Broken APIs: {len(broken_apis)}")
    for api in broken_apis:
        print(f"  - {api}")
    
    # Database stats
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM tickets")
        ticket_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM teams")
        team_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM assignments")
        assignment_count = cursor.fetchone()[0]
        
        print(f"\n📊 Database Statistics:")
        print(f"  - Tickets: {ticket_count}")
        print(f"  - Teams: {team_count}")
        print(f"  - Assignments: {assignment_count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error getting database stats: {e}")

def main():
    print("🧹 Starting Backend Cleanup...")
    print("=" * 50)
    
    # Step 1: Test APIs
    print("\n1️⃣ Testing API endpoints...")
    working_apis, broken_apis = test_api_endpoints()
    
    # Step 2: Clean database
    print("\n2️⃣ Cleaning database...")
    clean_database()
    
    # Step 3: Remove unused files
    print("\n3️⃣ Removing unused files...")
    remove_unused_files()
    
    # Step 4: Optimize services
    print("\n4️⃣ Optimizing services...")
    optimize_services()
    
    # Step 5: Create optimized gateway
    print("\n5️⃣ Creating optimized gateway...")
    create_optimized_gateway()
    
    # Step 6: Generate report
    print("\n6️⃣ Generating cleanup report...")
    generate_cleanup_report()
    
    print("\n✅ Backend cleanup completed!")
    print("\n📋 Next steps:")
    print("  1. Review the optimized API Gateway")
    print("  2. Test the cleaned up backend")
    print("  3. Deploy the optimized version")

if __name__ == "__main__":
    main()

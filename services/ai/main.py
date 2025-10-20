from fastapi import FastAPI, HTTPException
import httpx
import os
from typing import Dict, Any, List, Optional
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Service", version="1.0.0")

# Service URLs
TICKETS_URL = os.getenv("TICKETS_URL", "http://localhost:8001")
ANALYTICS_URL = os.getenv("ANALYTICS_URL", "http://localhost:8002")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai"}

async def get_tickets_data() -> List[Dict[str, Any]]:
    """Fetch tickets data from tickets service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{TICKETS_URL}/tickets")
            if response.status_code == 200:
                return response.json()
            return []
    except Exception as e:
        logger.error(f"Error fetching tickets: {e}")
        return []

async def get_analytics_data() -> Dict[str, Any]:
    """Fetch analytics data from analytics service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ANALYTICS_URL}/analytics/performance")
            if response.status_code == 200:
                return response.json()
            return {}
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        return {}

def generate_ai_insights(tickets_data: List[Dict], analytics_data: Dict) -> Dict[str, Any]:
    """Generate AI insights based on data"""
    
    # Analyze ticket patterns
    total_tickets = len(tickets_data)
    open_tickets = len([t for t in tickets_data if t.get('status') == 'open'])
    completed_tickets = len([t for t in tickets_data if t.get('status') == 'completed'])
    
    # Priority analysis
    priority_counts = {}
    for ticket in tickets_data:
        priority = ticket.get('priority', 'medium')
        priority_counts[priority] = priority_counts.get(priority, 0) + 1
    
    # Zone analysis
    zone_counts = {}
    for ticket in tickets_data:
        zone = ticket.get('zone')
        if zone:
            zone_counts[zone] = zone_counts.get(zone, 0) + 1
    
    # Generate insights
    insights = {
        "summary": {
            "totalTickets": total_tickets,
            "openTickets": open_tickets,
            "completedTickets": completed_tickets,
            "completionRate": (completed_tickets / total_tickets * 100) if total_tickets > 0 else 0
        },
        "recommendations": [],
        "alerts": [],
        "optimizationTips": []
    }
    
    # Generate recommendations based on data
    if open_tickets > total_tickets * 0.3:
        insights["recommendations"].append({
            "type": "workload",
            "title": "High Open Ticket Volume",
            "description": f"Currently {open_tickets} open tickets. Consider increasing team capacity or prioritizing urgent tickets.",
            "priority": "high"
        })
    
    if priority_counts.get('urgent', 0) > 5:
        insights["recommendations"].append({
            "type": "priority",
            "title": "Multiple Urgent Tickets",
            "description": f"{priority_counts.get('urgent', 0)} urgent tickets require immediate attention.",
            "priority": "urgent"
        })
    
    # Zone-specific recommendations
    for zone, count in zone_counts.items():
        if count > 10:
            insights["recommendations"].append({
                "type": "zone",
                "title": f"High Activity in {zone}",
                "description": f"{zone} zone has {count} tickets. Consider dedicated team assignment.",
                "priority": "medium"
            })
    
    # Optimization tips
    insights["optimizationTips"] = [
        "Consider implementing automated ticket routing based on zone and priority",
        "Set up SLA alerts for tickets approaching deadline",
        "Implement predictive analytics for resource planning",
        "Use AI-powered ticket categorization for better organization"
    ]
    
    # Alerts
    if analytics_data.get('completionRate', 0) < 70:
        insights["alerts"].append({
            "type": "performance",
            "message": "Completion rate below 70%. Review team performance and resource allocation.",
            "severity": "warning"
        })
    
    return insights

@app.post("/ai/recommendations")
async def get_ai_recommendations():
    """Get AI-powered recommendations"""
    try:
        tickets_data = await get_tickets_data()
        analytics_data = await get_analytics_data()
        
        insights = generate_ai_insights(tickets_data, analytics_data)
        
        return {
            "insights": insights,
            "generatedAt": "2024-01-01T00:00:00Z",
            "model": "aiff-analytics-v1"
        }
        
    except Exception as e:
        logger.error(f"Error generating AI recommendations: {e}")
        raise HTTPException(status_code=500, detail="Error generating AI recommendations")

@app.get("/ai/insights")
async def get_ai_insights():
    """Get AI insights for dashboard"""
    try:
        tickets_data = await get_tickets_data()
        analytics_data = await get_analytics_data()
        
        insights = generate_ai_insights(tickets_data, analytics_data)
        
        return {
            "insights": insights,
            "generatedAt": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        raise HTTPException(status_code=500, detail="Error generating AI insights")

@app.post("/ai/chat")
async def ai_chat(request: Dict[str, Any]):
    """AI chat endpoint for NRO-Bots"""
    try:
        query = request.get("query", "")
        context = request.get("context", {})
        
        # Simple AI response generation (can be enhanced with actual LLM)
        if "performance" in query.lower():
            response = "Based on current data, your team performance is good. Consider focusing on urgent tickets to improve completion rates."
        elif "tickets" in query.lower():
            response = "I can help you analyze ticket trends, prioritize work, and optimize team assignments. What specific aspect would you like to know about?"
        elif "recommendations" in query.lower():
            response = "Here are my top recommendations: 1) Prioritize urgent tickets, 2) Balance workload across zones, 3) Monitor SLA compliance."
        else:
            response = "I'm NRO-Bots, your AI assistant for field operations. I can help with performance analysis, ticket management, and optimization recommendations. How can I assist you?"
        
        return {
            "response": response,
            "timestamp": "2024-01-01T00:00:00Z",
            "context": context
        }
        
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        raise HTTPException(status_code=500, detail="Error processing AI chat request")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)

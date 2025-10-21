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

# Service URLs - Use internal Docker network
TICKETS_URL = os.getenv("TICKETS_URL", "http://tickets:8001")
ANALYTICS_URL = os.getenv("ANALYTICS_URL", "http://analytics:8002")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai"}

async def get_tickets_data() -> List[Dict[str, Any]]:
    """Fetch tickets data from tickets service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{TICKETS_URL}/tickets")
            if response.status_code == 200:
                data = response.json()
                return data.get('tickets', [])
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

async def generate_contextual_response(message: str, tickets_data: List[Dict], analytics_data: Dict, context: str) -> str:
    """Generate contextual AI response based on real system data"""
    try:
        lower_message = message.lower()
        
        # Analyze tickets data
        total_tickets = len(tickets_data)
        open_tickets = len([t for t in tickets_data if t.get('status') in ['open', 'pending', 'in_progress']])
        completed_tickets = len([t for t in tickets_data if t.get('status') in ['completed', 'resolved', 'closed']])
        completion_rate = (completed_tickets / total_tickets * 100) if total_tickets > 0 else 0
        
        # Performance analysis
        if "performance" in lower_message or "how are we doing" in lower_message:
            if completion_rate >= 80:
                performance_status = "excellent"
                recommendation = "Keep up the great work! Consider optimizing team assignments for even better efficiency."
            elif completion_rate >= 60:
                performance_status = "good"
                recommendation = "Good performance! Focus on completing pending tickets to improve completion rate."
            else:
                performance_status = "needs improvement"
                recommendation = "Performance needs attention. Prioritize urgent tickets and consider additional resources."
            
            return f"""📊 **Performance Analysis:**
            
**Current Status:** {performance_status.title()}
- Total Tickets: {total_tickets}
- Open Tickets: {open_tickets}
- Completed Tickets: {completed_tickets}
- Completion Rate: {completion_rate:.1f}%

**Recommendation:** {recommendation}

Would you like me to analyze specific areas for improvement?"""

        # Ticket analysis
        elif "tickets" in lower_message or "ticket" in lower_message:
            urgent_tickets = len([t for t in tickets_data if t.get('priority') in ['high', 'emergency']])
            overdue_tickets = len([t for t in tickets_data if t.get('status') in ['open', 'pending']])
            
            return f"""🎫 **Ticket Analysis:**
            
**Current Ticket Status:**
- Total Tickets: {total_tickets}
- Open/Pending: {open_tickets}
- Completed: {completed_tickets}
- Urgent Priority: {urgent_tickets}
- Overdue: {overdue_tickets}

**Recommendations:**
1. Focus on urgent tickets first
2. Address overdue tickets to improve SLA compliance
3. Balance workload across teams

Would you like specific ticket details or team assignments?"""

        # Team performance
        elif "team" in lower_message or "teams" in lower_message:
            return f"""👥 **Team Performance:**
            
**Current Metrics:**
- Total Tickets: {total_tickets}
- Completion Rate: {completion_rate:.1f}%
- Open Tickets: {open_tickets}

**Team Optimization:**
- Ensure balanced workload distribution
- Monitor team capacity and availability
- Focus on high-priority assignments

Would you like team-specific analysis or assignment recommendations?"""

        # Recommendations
        elif "recommend" in lower_message or "suggest" in lower_message or "optimize" in lower_message:
            return f"""💡 **Optimization Recommendations:**
            
**Based on Current Data:**
- Completion Rate: {completion_rate:.1f}%
- Open Tickets: {open_tickets}
- Total Tickets: {total_tickets}

**Key Recommendations:**
1. **Priority Management:** Focus on urgent tickets first
2. **Resource Allocation:** Balance workload across teams
3. **SLA Compliance:** Monitor and address overdue tickets
4. **Performance Tracking:** Regular review of completion rates

**Next Steps:**
- Review team assignments
- Prioritize urgent tickets
- Monitor SLA compliance
- Optimize resource allocation

Would you like detailed analysis of any specific area?"""

        # General help
        else:
            return f"""🤖 **NRO-Bots - Your AI Assistant**
            
**Current System Status:**
- Total Tickets: {total_tickets}
- Open Tickets: {open_tickets}
- Completion Rate: {completion_rate:.1f}%

**I can help you with:**
- 📊 Performance analysis and metrics
- 🎫 Ticket management and prioritization
- 👥 Team optimization and assignments
- 💡 System recommendations and insights
- 📈 Trend analysis and forecasting

**Try asking:**
- "How is our performance?"
- "Show me ticket analysis"
- "Give me optimization recommendations"
- "What's our team status?"

How can I assist you today?"""

    except Exception as e:
        logger.error(f"Error generating contextual response: {e}")
        return "I apologize, but I'm having trouble accessing the current system data. Please try again in a moment."

@app.post("/ai/chat")
async def ai_chat(request: Dict[str, Any]):
    """AI chat endpoint for NRO-Bots"""
    try:
        message = request.get("message", "")
        context = request.get("context", "dashboard")
        history = request.get("history", [])
        
        # Fetch real system data
        tickets_data = await get_tickets_data()
        analytics_data = await get_analytics_data()
        
        # Generate context-aware response based on real data
        response = await generate_contextual_response(message, tickets_data, analytics_data, context)
        
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

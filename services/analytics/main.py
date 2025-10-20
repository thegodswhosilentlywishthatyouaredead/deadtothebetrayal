from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, text
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import logging
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Analytics Service", version="1.0.0")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "analytics"}

@app.get("/analytics/performance")
async def get_performance_analytics(db: Session = Depends(get_db)):
    """Get performance analytics for dashboard"""
    try:
        # Get ticket completion rates
        completion_query = text("""
            SELECT 
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tickets,
                AVG(CASE WHEN status = 'completed' AND completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (completed_at - created_at))/3600 
                    END) as avg_completion_time_hours
            FROM tickets
        """)
        
        result = db.execute(completion_query).fetchone()
        
        total_tickets = result.total_tickets or 0
        completed_tickets = result.completed_tickets or 0
        avg_completion_time = result.avg_completion_time_hours or 0
        
        completion_rate = (completed_tickets / total_tickets * 100) if total_tickets > 0 else 0
        
        # Get team performance
        team_performance_query = text("""
            SELECT 
                t.assigned_team_id,
                tm.name as team_name,
                COUNT(*) as total_assigned,
                COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed,
                AVG(CASE WHEN t.status = 'completed' AND t.completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600 
                    END) as avg_completion_time
            FROM tickets t
            LEFT JOIN teams tm ON t.assigned_team_id = tm.id
            WHERE t.assigned_team_id IS NOT NULL
            GROUP BY t.assigned_team_id, tm.name
            ORDER BY completed DESC
        """)
        
        team_results = db.execute(team_performance_query).fetchall()
        
        team_performance = []
        for row in team_results:
            team_performance.append({
                "team_id": row.assigned_team_id,
                "team_name": row.team_name,
                "total_assigned": row.total_assigned,
                "completed": row.completed,
                "completion_rate": (row.completed / row.total_assigned * 100) if row.total_assigned > 0 else 0,
                "avg_completion_time": float(row.avg_completion_time) if row.avg_completion_time else 0
            })
        
        return {
            "completionRate": round(completion_rate, 2),
            "avgCompletionTime": round(avg_completion_time, 2),
            "totalTickets": total_tickets,
            "completedTickets": completed_tickets,
            "teamPerformance": team_performance
        }
        
    except Exception as e:
        logger.error(f"Error in performance analytics: {e}")
        raise HTTPException(status_code=500, detail="Error generating performance analytics")

@app.get("/analytics/trends")
async def get_trend_analytics(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get trend analytics over time"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Daily ticket trends
        trends_query = text("""
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total_created,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
            FROM tickets
            WHERE created_at >= :start_date
            GROUP BY DATE(created_at)
            ORDER BY date
        """)
        
        trends_result = db.execute(trends_query, {"start_date": start_date}).fetchall()
        
        trends = []
        for row in trends_result:
            trends.append({
                "date": row.date.isoformat(),
                "total_created": row.total_created,
                "completed": row.completed,
                "open": row.open,
                "in_progress": row.in_progress
            })
        
        # Priority trends
        priority_query = text("""
            SELECT 
                priority,
                COUNT(*) as count
            FROM tickets
            WHERE created_at >= :start_date
            GROUP BY priority
        """)
        
        priority_result = db.execute(priority_query, {"start_date": start_date}).fetchall()
        priority_trends = {row.priority: row.count for row in priority_result}
        
        # Category trends
        category_query = text("""
            SELECT 
                category,
                COUNT(*) as count
            FROM tickets
            WHERE created_at >= :start_date
            GROUP BY category
        """)
        
        category_result = db.execute(category_query, {"start_date": start_date}).fetchall()
        category_trends = {row.category: row.count for row in category_result}
        
        return {
            "dailyTrends": trends,
            "priorityTrends": priority_trends,
            "categoryTrends": category_trends,
            "period": f"{days} days"
        }
        
    except Exception as e:
        logger.error(f"Error in trend analytics: {e}")
        raise HTTPException(status_code=500, detail="Error generating trend analytics")

@app.get("/analytics/forecast")
async def get_forecast_analytics(db: Session = Depends(get_db)):
    """Get material and resource forecast"""
    try:
        # Material usage forecast (simplified)
        material_query = text("""
            SELECT 
                category,
                COUNT(*) as ticket_count,
                AVG(estimated_duration) as avg_duration
            FROM tickets
            WHERE status IN ('open', 'in_progress')
            GROUP BY category
        """)
        
        material_result = db.execute(material_query).fetchall()
        
        material_forecast = {
            "fiber": 0,
            "equipment": 0,
            "tools": 0,
            "vehicles": 0
        }
        
        for row in material_result:
            # Simple mapping of categories to materials
            if row.category in ['fiber_installation', 'repair']:
                material_forecast["fiber"] += row.ticket_count * 100  # meters
                material_forecast["equipment"] += row.ticket_count * 2
            elif row.category == 'maintenance':
                material_forecast["tools"] += row.ticket_count * 5
                material_forecast["equipment"] += row.ticket_count * 1
            
            material_forecast["vehicles"] += max(1, row.ticket_count // 3)  # 1 vehicle per 3 tickets
        
        # Resource demand forecast
        resource_query = text("""
            SELECT 
                zone,
                COUNT(*) as active_tickets,
                COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tickets
            FROM tickets
            WHERE status IN ('open', 'in_progress')
            GROUP BY zone
        """)
        
        resource_result = db.execute(resource_query).fetchall()
        
        resource_forecast = []
        for row in resource_result:
            resource_forecast.append({
                "zone": row.zone,
                "activeTickets": row.active_tickets,
                "urgentTickets": row.urgent_tickets,
                "estimatedTeams": max(1, (row.active_tickets + row.urgent_tickets) // 2),
                "estimatedHours": row.active_tickets * 4  # 4 hours per ticket average
            })
        
        return {
            "materialUsage": material_forecast,
            "resourceDemand": resource_forecast,
            "forecastDate": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in forecast analytics: {e}")
        raise HTTPException(status_code=500, detail="Error generating forecast analytics")

@app.get("/analytics/zones")
async def get_zone_analytics(db: Session = Depends(get_db)):
    """Get zone-specific analytics"""
    try:
        zone_query = text("""
            SELECT 
                zone,
                COUNT(*) as total_tickets,
                COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as closed_tickets,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
                AVG(CASE WHEN status = 'completed' AND completed_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (completed_at - created_at))/3600 
                    END) as avg_completion_time
            FROM tickets
            WHERE zone IS NOT NULL
            GROUP BY zone
            ORDER BY total_tickets DESC
        """)
        
        zone_result = db.execute(zone_query).fetchall()
        
        zones = []
        for row in zone_result:
            zones.append({
                "zone": row.zone,
                "totalTickets": row.total_tickets,
                "openTickets": row.open_tickets,
                "closedTickets": row.closed_tickets,
                "inProgressTickets": row.in_progress_tickets,
                "avgCompletionTime": float(row.avg_completion_time) if row.avg_completion_time else 0,
                "productivity": (row.closed_tickets / row.total_tickets * 100) if row.total_tickets > 0 else 0
            })
        
        return {"zones": zones}
        
    except Exception as e:
        logger.error(f"Error in zone analytics: {e}")
        raise HTTPException(status_code=500, detail="Error generating zone analytics")

@app.get("/analytics/tickets/aging")
async def get_tickets_aging(db: Session = Depends(get_db)):
    """Get ticket aging analytics"""
    try:
        aging_query = text("""
            SELECT 
                CASE 
                    WHEN EXTRACT(EPOCH FROM (NOW() - created_at))/3600 <= 24 THEN '0-24 hours'
                    WHEN EXTRACT(EPOCH FROM (NOW() - created_at))/3600 <= 72 THEN '1-3 days'
                    WHEN EXTRACT(EPOCH FROM (NOW() - created_at))/3600 <= 168 THEN '3-7 days'
                    ELSE '7+ days'
                END as age_group,
                COUNT(*) as ticket_count,
                COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_count,
                COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count
            FROM tickets
            WHERE status IN ('OPEN', 'IN_PROGRESS')
            GROUP BY age_group
            ORDER BY age_group
        """)
        
        aging_result = db.execute(aging_query).fetchall()
        
        aging_data = []
        for row in aging_result:
            aging_data.append({
                "ageGroup": row.age_group,
                "totalTickets": row.ticket_count,
                "openTickets": row.open_count,
                "inProgressTickets": row.in_progress_count,
                "percentage": round((row.ticket_count / sum(r.ticket_count for r in aging_result) * 100), 1) if aging_result else 0
            })
        
        return {"aging": aging_data}
        
    except Exception as e:
        logger.error(f"Error in ticket aging analytics: {e}")
        raise HTTPException(status_code=500, detail="Error generating ticket aging analytics")

@app.get("/planning/forecast")
async def get_planning_forecast(db: Session = Depends(get_db)):
    """Get planning forecast data"""
    try:
        # Mock forecast data
        forecast_data = {
            "materialDemand": {
                "fiber": 1500,
                "cables": 800,
                "equipment": 45,
                "tools": 120
            },
            "resourceForecast": {
                "teamsNeeded": 12,
                "estimatedHours": 480,
                "peakHours": "09:00-17:00",
                "recommendedSchedule": "Weekdays"
            },
            "capacityPlanning": {
                "currentCapacity": 75,
                "projectedLoad": 85,
                "recommendation": "Scale up teams by 15%"
            }
        }
        
        return forecast_data
        
    except Exception as e:
        logger.error(f"Error in planning forecast: {e}")
        raise HTTPException(status_code=500, detail="Error generating planning forecast")

@app.get("/planning/zone-materials")
async def get_zone_materials(db: Session = Depends(get_db)):
    """Get zone materials planning data"""
    try:
        # Mock zone materials data
        zone_materials = [
            {
                "zone": "North Zone",
                "materials": {
                    "fiber": 400,
                    "cables": 200,
                    "equipment": 12,
                    "tools": 30
                },
                "estimatedCost": 15000,
                "deliveryTime": "2-3 days"
            },
            {
                "zone": "South Zone", 
                "materials": {
                    "fiber": 350,
                    "cables": 180,
                    "equipment": 10,
                    "tools": 25
                },
                "estimatedCost": 13000,
                "deliveryTime": "1-2 days"
            },
            {
                "zone": "East Zone",
                "materials": {
                    "fiber": 300,
                    "cables": 150,
                    "equipment": 8,
                    "tools": 20
                },
                "estimatedCost": 11000,
                "deliveryTime": "2-3 days"
            },
            {
                "zone": "West Zone",
                "materials": {
                    "fiber": 250,
                    "cables": 120,
                    "equipment": 6,
                    "tools": 15
                },
                "estimatedCost": 9000,
                "deliveryTime": "1-2 days"
            },
            {
                "zone": "Central Zone",
                "materials": {
                    "fiber": 200,
                    "cables": 100,
                    "equipment": 5,
                    "tools": 12
                },
                "estimatedCost": 7500,
                "deliveryTime": "1 day"
            }
        ]
        
        return {"zones": zone_materials}
        
    except Exception as e:
        logger.error(f"Error in zone materials: {e}")
        raise HTTPException(status_code=500, detail="Error generating zone materials data")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)

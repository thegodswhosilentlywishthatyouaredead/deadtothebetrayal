from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime, timedelta
from typing import List, Optional
import logging

from models import Base, Ticket, Assignment, Comment, Team, User, TicketStatus, TicketPriority, TicketCategory
from schemas import (
    TicketCreate, TicketUpdate, TicketResponse, TicketWithDetails,
    AssignmentCreate, AssignmentResponse,
    CommentCreate, CommentResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Tickets Service", version="1.0.0")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_ticket_number(db: Session, zone: str = None) -> str:
    """Generate unique ticket number in CTT_Num format"""
    count = db.query(Ticket).count()
    return f"CTT_{count + 1:03d}"

# Telco Network Issue Causals
TELCO_CAUSALS = {
    "DROP_FIBRE": {
        "code": "DF001",
        "description": "Drop Fiber Cut",
        "title_templates": [
            "Drop Fiber Cut - {location}",
            "Fiber Drop Cable Damaged - {location}",
            "Customer Drop Fiber Failure - {location}",
            "Fiber Optic Drop Cable Issue - {location}"
        ],
        "description_templates": [
            "Drop fiber cable cut or damaged affecting customer connection. Fiber optic cable from distribution point to customer premises requires repair or replacement.",
            "Customer drop fiber cable cut affecting internet/phone services. Fiber optic drop cable needs splicing or replacement.",
            "Drop fiber cable damaged due to construction work. Fiber optic connection from FDP to customer premises requires restoration.",
            "Drop fiber cable severed affecting customer services. Fiber optic drop cable needs immediate repair to restore connectivity."
        ]
    },
    "CUSTOMER_CPE": {
        "code": "CPE002",
        "description": "Customer CPE Failure",
        "title_templates": [
            "CPE Router Issue - {location}",
            "Customer Router Malfunction - {location}",
            "CPE Equipment Failure - {location}",
            "Customer Modem Problem - {location}"
        ],
        "description_templates": [
            "Customer Premises Equipment (CPE) router/modem malfunction. Equipment requires replacement or configuration reset.",
            "CPE router not responding or showing connectivity issues. Customer equipment needs troubleshooting or replacement.",
            "Customer router/modem hardware failure. CPE equipment requires replacement to restore services.",
            "CPE configuration issue causing service disruption. Customer equipment needs reconfiguration or firmware update."
        ]
    },
    "LONGSPAN": {
        "code": "LS003",
        "description": "Long Span Cable Damage",
        "title_templates": [
            "Long Span Cable Cut - {location}",
            "Backbone Fiber Cut - {location}",
            "Long Span Fiber Damage - {location}",
            "Backbone Cable Failure - {location}"
        ],
        "description_templates": [
            "Long span backbone fiber cable cut affecting multiple customers. Backbone infrastructure requires immediate repair.",
            "Backbone fiber cable severed due to external damage. Long span cable needs splicing to restore services.",
            "Long span cable damaged affecting network backbone. Backbone infrastructure requires restoration work.",
            "Backbone fiber cut causing widespread service outage. Long span cable needs emergency repair."
        ]
    },
    "RODENT": {
        "code": "RD004",
        "description": "Rodent Damage",
        "title_templates": [
            "Rodent Damage to Cable - {location}",
            "Cable Chewed by Rodents - {location}",
            "Rodent Infestation Cable Damage - {location}",
            "Animal Damage to Fiber - {location}"
        ],
        "description_templates": [
            "Fiber cable damaged by rodent chewing. Cable requires replacement and rodent-proofing measures.",
            "Rodent damage to fiber cable causing service disruption. Cable needs replacement and pest control measures.",
            "Animal damage to fiber infrastructure. Cable requires repair and protective measures against future damage.",
            "Rodent infestation causing cable damage. Fiber cable needs replacement and environmental protection."
        ]
    },
    "FDP_BREAKDOWN": {
        "code": "FDP",
        "description": "Fiber Distribution Point Breakdown",
        "title_templates": [
            "FDP Equipment Failure - {location}",
            "Distribution Point Breakdown - {location}",
            "FDP Cabinet Malfunction - {location}",
            "Distribution Cabinet Issue - {location}"
        ],
        "description_templates": [
            "Fiber Distribution Point (FDP) equipment failure affecting multiple customers. Distribution cabinet requires repair or replacement.",
            "FDP cabinet malfunction causing service outage. Distribution point equipment needs troubleshooting and repair.",
            "Fiber distribution point breakdown affecting customer services. FDP equipment requires immediate attention.",
            "Distribution cabinet failure impacting multiple connections. FDP infrastructure needs restoration work."
        ]
    },
    "POWER_SUPPLY": {
        "code": "PS",
        "description": "Power Supply Issue",
        "title_templates": [
            "Power Supply Failure - {location}",
            "Equipment Power Issue - {location}",
            "Power Supply Malfunction - {location}",
            "Electrical Power Problem - {location}"
        ],
        "description_templates": [
            "Network equipment power supply failure causing service disruption. Power supply unit requires replacement.",
            "Electrical power issue affecting network equipment. Power supply needs repair or replacement.",
            "Power supply malfunction in network infrastructure. Electrical equipment requires immediate attention.",
            "Power supply failure affecting network services. Electrical infrastructure needs restoration."
        ]
    },
    "WEATHER_DAMAGE": {
        "code": "WD",
        "description": "Weather Damage",
        "title_templates": [
            "Storm Damage to Infrastructure - {location}",
            "Weather-Related Cable Damage - {location}",
            "Storm Impact on Network - {location}",
            "Weather Damage to Equipment - {location}"
        ],
        "description_templates": [
            "Severe weather conditions causing network infrastructure damage. Equipment and cables require assessment and repair.",
            "Storm damage to fiber infrastructure affecting services. Weather-related damage needs immediate restoration.",
            "Heavy rain/flooding causing network equipment damage. Weather impact requires infrastructure repair.",
            "Extreme weather conditions damaging network services. Weather-related damage needs restoration work."
        ]
    },
    "CONSTRUCTION_DAMAGE": {
        "code": "CD",
        "description": "Construction Damage",
        "title_templates": [
            "Construction Work Cable Cut - {location}",
            "Excavation Damage to Fiber - {location}",
            "Construction Impact on Network - {location}",
            "Digging Damage to Infrastructure - {location}"
        ],
        "description_templates": [
            "Construction work accidentally cutting fiber cables. Infrastructure damage requires immediate repair and coordination with contractors.",
            "Excavation work damaging underground fiber infrastructure. Construction impact needs restoration and better coordination.",
            "Construction activities causing network infrastructure damage. Cable damage requires repair and protective measures.",
            "Digging work severing fiber cables. Construction damage needs immediate restoration and future protection."
        ]
    }
}

def generate_telco_ticket_data(zone: str = None) -> dict:
    """Generate realistic telco ticket data with proper causals"""
    import random
    
    # Select random causal
    causal_key = random.choice(list(TELCO_CAUSALS.keys()))
    causal = TELCO_CAUSALS[causal_key]
    
    # Generate location-based data
    location = zone or "Kuala Lumpur"
    
    # Select random template
    title_template = random.choice(causal["title_templates"])
    description_template = random.choice(causal["description_templates"])
    
    # Generate title and description
    title = title_template.format(location=location)
    description = description_template
    
    # Generate priority based on causal
    priority_map = {
        "DROP_FIBRE": ["MEDIUM", "HIGH"],
        "CUSTOMER_CPE": ["LOW", "MEDIUM"],
        "LONGSPAN": ["HIGH", "URGENT"],
        "RODENT": ["MEDIUM", "HIGH"],
        "FDP_BREAKDOWN": ["HIGH", "URGENT"],
        "POWER_SUPPLY": ["HIGH", "URGENT"],
        "WEATHER_DAMAGE": ["HIGH", "URGENT"],
        "CONSTRUCTION_DAMAGE": ["MEDIUM", "HIGH"]
    }
    
    priority = random.choice(priority_map.get(causal_key, ["MEDIUM"]))
    
    return {
        "title": title,
        "description": description,
        "priority": priority,
        "causal_code": causal["code"],
        "causal_description": causal["description"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tickets"}

@app.get("/tickets")
async def get_tickets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    category: Optional[TicketCategory] = None,
    zone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
    if zone:
        query = query.filter(Ticket.zone == zone)
    
    tickets = query.offset(skip).limit(limit).all()
    
    # Enhance tickets with additional fields for frontend compatibility
    enhanced_tickets = []
    for ticket in tickets:
        ticket_dict = {
            "id": ticket.id,
            "ticket_number": ticket.ticket_number,
            "ticketNumber": ticket.ticket_number,  # Alias for frontend
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "category": ticket.category,
            "location": ticket.location,
            "zone": ticket.zone,
            "coordinates": ticket.coordinates,
            "assigned_team_id": ticket.assigned_team_id,
            "assigned_user_id": ticket.assigned_user_id,
            "assigned_team": None,  # Will be populated if team exists
            "assigned_user": None,  # Will be populated if user exists
            "created_at": ticket.created_at,
            "createdAt": ticket.created_at,  # Alias for frontend
            "updated_at": ticket.updated_at,
            "due_date": ticket.due_date,
            "completed_at": ticket.completed_at,
            "sla_hours": ticket.sla_hours,
            "estimated_duration": ticket.estimated_duration,
            "customer_name": ticket.customer_name,
            "customer_contact": ticket.customer_contact,
            "customer_email": ticket.customer_email,
            # Additional fields for KPI calculations
            "resolved_at": ticket.completed_at,  # Alias for frontend compatibility
            "resolvedAt": ticket.completed_at,  # Alias for frontend compatibility
            "in_progress_at": ticket.updated_at if ticket.status == "IN_PROGRESS" else None,
            "age_days": (datetime.now(ticket.created_at.tzinfo) - ticket.created_at).days if ticket.created_at else 0,
            "sla_status": "ON_TIME" if ticket.completed_at and ticket.due_date and ticket.completed_at <= ticket.due_date else "OVERDUE" if ticket.due_date and datetime.now(ticket.due_date.tzinfo) > ticket.due_date else "PENDING"
        }
        
        # Try to get team name if assigned
        if ticket.assigned_team_id:
            team = db.query(Team).filter(Team.id == ticket.assigned_team_id).first()
            if team:
                ticket_dict["assigned_team"] = team.name
        
        # Try to get user name if assigned
        if ticket.assigned_user_id:
            user = db.query(User).filter(User.id == ticket.assigned_user_id).first()
            if user:
                ticket_dict["assigned_user"] = user.full_name
        
        enhanced_tickets.append(ticket_dict)
    
    return {"tickets": enhanced_tickets}

@app.get("/tickets/{ticket_id}", response_model=TicketWithDetails)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.post("/tickets", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    ticket_number = generate_ticket_number(db, ticket.zone)
    db_ticket = Ticket(
        ticket_number=ticket_number,
        **ticket.dict()
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db)
):
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    update_data = ticket_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    
    db_ticket.updated_at = datetime.utcnow()
    
    # If status changed to completed, set completed_at
    if ticket_update.status == TicketStatus.COMPLETED:
        db_ticket.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    db_ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not db_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db.delete(db_ticket)
    db.commit()
    return {"message": "Ticket deleted successfully"}

@app.get("/tickets/stats/summary")
async def get_ticket_stats(db: Session = Depends(get_db)):
    """Get ticket statistics for dashboard"""
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.OPEN).count()
    in_progress_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.IN_PROGRESS).count()
    completed_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.COMPLETED).count()
    
    # Priority breakdown
    priority_stats = db.query(
        Ticket.priority,
        func.count(Ticket.id).label('count')
    ).group_by(Ticket.priority).all()
    
    # Category breakdown
    category_stats = db.query(
        Ticket.category,
        func.count(Ticket.id).label('count')
    ).group_by(Ticket.category).all()
    
    # Zone breakdown
    zone_stats = db.query(
        Ticket.zone,
        func.count(Ticket.id).label('count')
    ).filter(Ticket.zone.isnot(None)).group_by(Ticket.zone).all()
    
    return {
        "total": total_tickets,
        "open": open_tickets,
        "in_progress": in_progress_tickets,
        "completed": completed_tickets,
        "priority_breakdown": {stat.priority: stat.count for stat in priority_stats},
        "category_breakdown": {stat.category: stat.count for stat in category_stats},
        "zone_breakdown": {stat.zone: stat.count for stat in zone_stats}
    }

@app.post("/assignments", response_model=AssignmentResponse)
async def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    # Verify ticket exists
    ticket = db.query(Ticket).filter(Ticket.id == assignment.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db_assignment = Assignment(**assignment.dict())
    db.add(db_assignment)
    
    # Update ticket assignment
    ticket.assigned_team_id = assignment.team_id
    ticket.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@app.post("/comments", response_model=CommentResponse)
async def create_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    # Verify ticket exists
    ticket = db.query(Ticket).filter(Ticket.id == comment.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    db_comment = Comment(**comment.dict())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.get("/assignments")
async def get_assignments(db: Session = Depends(get_db)):
    """Get all assignments"""
    assignments = db.query(Assignment).all()
    return {"assignments": assignments}

@app.get("/assignments/analytics/performance")
async def get_assignments_performance(db: Session = Depends(get_db)):
    """Get assignments performance analytics"""
    assignments = db.query(Assignment).all()
    
    # Calculate performance metrics
    total_assignments = len(assignments)
    completed_assignments = len([a for a in assignments if a.status == "completed"])
    in_progress_assignments = len([a for a in assignments if a.status == "in_progress"])
    
    # Mock performance data
    performance_data = {
        "totalAssignments": total_assignments,
        "completedAssignments": completed_assignments,
        "inProgressAssignments": in_progress_assignments,
        "completionRate": round((completed_assignments / total_assignments * 100) if total_assignments > 0 else 0, 2),
        "avgCompletionTime": 2.5,  # hours
        "averageRating": 4.3,
        "efficiencyScore": 87.5
    }
    
    return performance_data

@app.get("/tickets/analytics/overview")
async def get_tickets_overview(db: Session = Depends(get_db)):
    """Get tickets overview analytics"""
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.OPEN).count()
    in_progress_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.IN_PROGRESS).count()
    completed_tickets = db.query(Ticket).filter(Ticket.status == TicketStatus.COMPLETED).count()
    
    # Mock additional analytics
    overview_data = {
        "totalTickets": total_tickets,
        "openTickets": open_tickets,
        "inProgressTickets": in_progress_tickets,
        "completedTickets": completed_tickets,
        "resolutionRate": round((completed_tickets / total_tickets * 100) if total_tickets > 0 else 0, 2),
        "avgResolutionTime": 4.2,  # hours
        "customerSatisfaction": 4.5,
        "slaCompliance": 92.3
    }
    
    return overview_data

# Live Tracking Endpoints for Tickets
@app.get("/tickets/live-tracking")
async def get_live_ticket_tracking(db: Session = Depends(get_db)):
    """Get live tracking data for active tickets"""
    # Get active tickets (open, assigned, in_progress)
    active_tickets = db.query(Ticket).filter(
        Ticket.status.in_(["open", "assigned", "in_progress"])
    ).all()
    
    live_tickets = []
    for ticket in active_tickets:
        # Generate realistic live tracking data for each ticket
        import random
        import math
        random.seed(ticket.id + int(datetime.now().timestamp() / 300))  # Change every 5 minutes
        
        # Generate location if not exists
        if not ticket.location_latitude or not ticket.location_longitude:
            base_lat = 3.1390 + (random.random() - 0.5) * 0.5
            base_lon = 101.6869 + (random.random() - 0.5) * 0.5
        else:
            base_lat = ticket.location_latitude
            base_lon = ticket.location_longitude
        
        # Simulate small movement for active tickets
        movement_lat = (random.random() - 0.5) * 0.0001
        movement_lon = (random.random() - 0.5) * 0.0001
        
        live_tickets.append({
            "id": ticket.id,
            "ticketNumber": ticket.ticket_number,
            "title": ticket.title,
            "status": ticket.status,
            "priority": ticket.priority,
            "category": ticket.category,
            "location": {
                "latitude": base_lat + movement_lat,
                "longitude": base_lon + movement_lon,
                "address": ticket.location_address or f"Location - {ticket.category}"
            },
            "assignedTeam": ticket.assigned_team_id,
            "progress": random.randint(0, 100),  # 0-100%
            "estimatedArrival": (datetime.now() + timedelta(minutes=random.randint(15, 120))).isoformat(),
            "lastUpdate": datetime.now().isoformat(),
            "urgency": random.choice(["low", "medium", "high", "critical"]),
            "estimatedDuration": random.randint(30, 180),  # minutes
            "customerRating": round(random.uniform(3.0, 5.0), 1) if ticket.status == "completed" else None
        })
    
    return {
        "tickets": live_tickets,
        "lastUpdate": datetime.now().isoformat(),
        "totalActiveTickets": len(live_tickets),
        "openTickets": len([t for t in live_tickets if t["status"] == "open"]),
        "assignedTickets": len([t for t in live_tickets if t["status"] == "assigned"]),
        "inProgressTickets": len([t for t in live_tickets if t["status"] == "in_progress"])
    }

@app.get("/tickets/{ticket_id}/live-tracking")
async def get_ticket_live_tracking(ticket_id: int, db: Session = Depends(get_db)):
    """Get live tracking data for a specific ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    import random
    random.seed(ticket.id + int(datetime.now().timestamp() / 60))  # Change every minute
    
    # Generate live data for this specific ticket
    if not ticket.location_latitude or not ticket.location_longitude:
        base_lat = 3.1390 + (random.random() - 0.5) * 0.5
        base_lon = 101.6869 + (random.random() - 0.5) * 0.5
    else:
        base_lat = ticket.location_latitude
        base_lon = ticket.location_longitude
    
    return {
        "id": ticket.id,
        "ticketNumber": ticket.ticket_number,
        "title": ticket.title,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "location": {
            "latitude": base_lat,
            "longitude": base_lon,
            "address": ticket.location_address or f"Location - {ticket.category}"
        },
        "assignedTeam": ticket.assigned_team_id,
        "progress": random.randint(0, 100),
        "estimatedArrival": (datetime.now() + timedelta(minutes=random.randint(15, 120))).isoformat(),
        "lastUpdate": datetime.now().isoformat(),
        "urgency": random.choice(["low", "medium", "high", "critical"]),
        "estimatedDuration": random.randint(30, 180),
        "customerRating": round(random.uniform(3.0, 5.0), 1) if ticket.status == "completed" else None
    }

@app.post("/tickets/{ticket_id}/update-progress")
async def update_ticket_progress(
    ticket_id: int,
    progress_data: dict,
    db: Session = Depends(get_db)
):
    """Update ticket progress and status"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Update ticket progress
    if "progress" in progress_data:
        # Update status based on progress
        progress = progress_data["progress"]
        if progress == 0:
            ticket.status = "open"
        elif progress < 100:
            ticket.status = "in_progress"
        else:
            ticket.status = "completed"
            ticket.resolved_at = datetime.now()
    
    if "status" in progress_data:
        ticket.status = progress_data["status"]
    
    if "assigned_team_id" in progress_data:
        ticket.assigned_team_id = progress_data["assigned_team_id"]
    
    ticket.updated_at = datetime.now()
    
    db.commit()
    db.refresh(ticket)
    
    return {
        "message": "Ticket progress updated successfully",
        "ticket_id": ticket.id,
        "status": ticket.status,
        "updated_at": ticket.updated_at.isoformat()
    }

@app.get("/tickets/live-tracking/assignments")
async def get_live_assignments(db: Session = Depends(get_db)):
    """Get live assignment data between teams and tickets"""
    # Get active assignments
    assignments = db.query(Assignment).filter(
        Assignment.status.in_(["assigned", "in_progress", "en_route"])
    ).all()
    
    live_assignments = []
    for assignment in assignments:
        # Get ticket and team details
        ticket = db.query(Ticket).filter(Ticket.id == assignment.ticket_id).first()
        team = db.query(Team).filter(Team.id == assignment.team_id).first()
        
        if ticket and team:
            import random
            random.seed(assignment.id + int(datetime.now().timestamp() / 300))
            
            # Calculate ETA and distance
            if (ticket.location_latitude and ticket.location_longitude and 
                team.current_latitude and team.current_longitude):
                
                # Calculate distance (simplified)
                distance = math.sqrt(
                    (ticket.location_latitude - team.current_latitude) ** 2 + 
                    (ticket.location_longitude - team.current_longitude) ** 2
                ) * 111  # Rough conversion to km
                
                eta = max(15, int(distance * 2))  # Rough ETA calculation
            else:
                distance = random.uniform(5.0, 50.0)
                eta = random.randint(15, 75)
            
            live_assignments.append({
                "id": assignment.id,
                "ticketId": ticket.id,
                "ticketNumber": ticket.ticket_number,
                "ticketTitle": ticket.title,
                "teamId": team.id,
                "teamName": team.name,
                "status": assignment.status,
                "distance": round(distance, 1),
                "eta": eta,
                "startedAt": assignment.created_at.isoformat(),
                "estimatedArrival": (datetime.now() + timedelta(minutes=eta)).isoformat(),
                "priority": ticket.priority,
                "progress": random.randint(0, 100)
            })
    
    return {
        "assignments": live_assignments,
        "totalAssignments": len(live_assignments),
        "lastUpdate": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

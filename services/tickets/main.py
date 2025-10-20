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

def generate_ticket_number(db: Session) -> str:
    """Generate unique ticket number"""
    count = db.query(Ticket).count()
    return f"TK-{datetime.now().strftime('%Y%m%d')}-{count + 1:04d}"

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
    return {"tickets": tickets}

@app.get("/tickets/{ticket_id}", response_model=TicketWithDetails)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@app.post("/tickets", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    ticket_number = generate_ticket_number(db)
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

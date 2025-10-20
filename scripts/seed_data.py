#!/usr/bin/env python3
"""
Seed data script for AIFF database
"""
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import random

# Add services to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'auth'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'tickets'))

# Import auth models
from models import User, Team

# Import tickets models
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'tickets'))
from models import Ticket, Assignment, Comment, TicketStatus, TicketPriority, TicketCategory

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all tables"""
    print("Creating database tables...")
    
    # Import all models to ensure they're registered
    from auth.models import Base as AuthBase
    from tickets.models import Base as TicketsBase
    
    # Create tables
    AuthBase.metadata.create_all(bind=engine)
    TicketsBase.metadata.create_all(bind=engine)
    
    print("✅ Tables created successfully")

def seed_users_and_teams(db):
    """Seed users and teams"""
    print("Seeding users and teams...")
    
    # Create teams
    teams_data = [
        {"name": "North Zone Team", "description": "Field team for North Zone", "zone": "North"},
        {"name": "South Zone Team", "description": "Field team for South Zone", "zone": "South"},
        {"name": "East Zone Team", "description": "Field team for East Zone", "zone": "East"},
        {"name": "West Zone Team", "description": "Field team for West Zone", "zone": "West"},
        {"name": "Central Zone Team", "description": "Field team for Central Zone", "zone": "Central"},
    ]
    
    teams = []
    for team_data in teams_data:
        team = Team(**team_data)
        db.add(team)
        teams.append(team)
    
    db.commit()
    
    # Create users
    users_data = [
        {"username": "admin", "email": "admin@aiff.com", "full_name": "System Administrator", "is_admin": True},
        {"username": "manager1", "email": "manager1@aiff.com", "full_name": "John Manager"},
        {"username": "tech1", "email": "tech1@aiff.com", "full_name": "Alice Technician"},
        {"username": "tech2", "email": "tech2@aiff.com", "full_name": "Bob Technician"},
        {"username": "tech3", "email": "tech3@aiff.com", "full_name": "Carol Technician"},
    ]
    
    users = []
    for user_data in users_data:
        # Simple password hash for demo (use proper hashing in production)
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K.",  # "password"
            is_admin=user_data.get("is_admin", False)
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    print("✅ Users and teams seeded successfully")
    return users, teams

def seed_tickets(db, teams):
    """Seed tickets"""
    print("Seeding tickets...")
    
    # Sample ticket data
    ticket_templates = [
        {
            "title": "Fiber Installation - Residential Building",
            "description": "Install fiber optic cable to residential building at specified location",
            "category": TicketCategory.FIBER_INSTALLATION,
            "priority": TicketPriority.HIGH,
            "location": "123 Main Street, Downtown",
            "zone": "North",
            "coordinates": "40.7128,-74.0060",
            "customer_name": "John Smith",
            "customer_contact": "+1-555-0123",
            "sla_hours": 24,
            "estimated_duration": 4.0
        },
        {
            "title": "Network Maintenance - Data Center",
            "description": "Routine maintenance of network equipment in data center",
            "category": TicketCategory.MAINTENANCE,
            "priority": TicketPriority.MEDIUM,
            "location": "456 Tech Avenue, Industrial Zone",
            "zone": "South",
            "coordinates": "40.7589,-73.9851",
            "customer_name": "Tech Corp",
            "customer_contact": "+1-555-0456",
            "sla_hours": 48,
            "estimated_duration": 2.0
        },
        {
            "title": "Emergency Fiber Repair",
            "description": "Urgent repair of damaged fiber optic cable",
            "category": TicketCategory.REPAIR,
            "priority": TicketPriority.URGENT,
            "location": "789 Emergency Lane, Business District",
            "zone": "East",
            "coordinates": "40.7505,-73.9934",
            "customer_name": "Business Inc",
            "customer_contact": "+1-555-0789",
            "sla_hours": 4,
            "estimated_duration": 6.0
        },
        {
            "title": "Equipment Inspection",
            "description": "Quarterly inspection of network equipment",
            "category": TicketCategory.INSPECTION,
            "priority": TicketPriority.LOW,
            "location": "321 Inspection Road, Suburb",
            "zone": "West",
            "coordinates": "40.6892,-74.0445",
            "customer_name": "Suburb Networks",
            "customer_contact": "+1-555-0321",
            "sla_hours": 72,
            "estimated_duration": 1.5
        },
        {
            "title": "Emergency Network Outage",
            "description": "Critical network outage affecting multiple customers",
            "category": TicketCategory.EMERGENCY,
            "priority": TicketPriority.URGENT,
            "location": "654 Crisis Street, Central",
            "zone": "Central",
            "coordinates": "40.7614,-73.9776",
            "customer_name": "Multiple Customers",
            "customer_contact": "+1-555-0654",
            "sla_hours": 2,
            "estimated_duration": 8.0
        }
    ]
    
    tickets = []
    for i in range(50):  # Create 50 tickets
        template = random.choice(ticket_templates)
        
        # Generate ticket number
        ticket_number = f"TK-{datetime.now().strftime('%Y%m%d')}-{i+1:04d}"
        
        # Random status distribution
        status_weights = [0.3, 0.4, 0.25, 0.05]  # open, in_progress, completed, cancelled
        status = random.choices(
            [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.COMPLETED, TicketStatus.CANCELLED],
            weights=status_weights
        )[0]
        
        # Random creation date (last 30 days)
        created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
        
        # Set completion date if completed
        completed_at = None
        if status == TicketStatus.COMPLETED:
            completed_at = created_at + timedelta(hours=random.randint(1, 24))
        
        # Random team assignment
        assigned_team_id = random.choice(teams).id if teams else None
        
        ticket = Ticket(
            ticket_number=ticket_number,
            title=template["title"],
            description=template["description"],
            category=template["category"],
            priority=template["priority"],
            status=status,
            location=template["location"],
            zone=template["zone"],
            coordinates=template["coordinates"],
            customer_name=template["customer_name"],
            customer_contact=template["customer_contact"],
            sla_hours=template["sla_hours"],
            estimated_duration=template["estimated_duration"],
            assigned_team_id=assigned_team_id,
            created_at=created_at,
            completed_at=completed_at
        )
        
        db.add(ticket)
        tickets.append(ticket)
    
    db.commit()
    print("✅ Tickets seeded successfully")
    return tickets

def seed_assignments_and_comments(db, tickets, teams):
    """Seed assignments and comments"""
    print("Seeding assignments and comments...")
    
    # Create assignments for assigned tickets
    for ticket in tickets:
        if ticket.assigned_team_id and ticket.status in [TicketStatus.IN_PROGRESS, TicketStatus.COMPLETED]:
            assignment = Assignment(
                ticket_id=ticket.id,
                team_id=ticket.assigned_team_id,
                assigned_at=ticket.created_at + timedelta(hours=random.randint(1, 6)),
                status="assigned"
            )
            db.add(assignment)
    
    # Create comments for some tickets
    comment_templates = [
        "Work started on this ticket",
        "Equipment delivered to site",
        "Installation in progress",
        "Testing completed successfully",
        "Customer notified of completion",
        "Additional materials required",
        "Weather delay - rescheduled",
        "Quality check passed",
        "Documentation updated",
        "Follow-up scheduled"
    ]
    
    for ticket in random.sample(tickets, min(20, len(tickets))):
        num_comments = random.randint(1, 3)
        for i in range(num_comments):
            comment = Comment(
                ticket_id=ticket.id,
                content=random.choice(comment_templates),
                created_at=ticket.created_at + timedelta(hours=random.randint(1, 24))
            )
            db.add(comment)
    
    db.commit()
    print("✅ Assignments and comments seeded successfully")

def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    
    try:
        # Create tables
        create_tables()
        
        # Create session
        db = SessionLocal()
        
        try:
            # Seed data
            users, teams = seed_users_and_teams(db)
            tickets = seed_tickets(db, teams)
            seed_assignments_and_comments(db, tickets, teams)
            
            print("🎉 Database seeding completed successfully!")
            print(f"   - {len(users)} users created")
            print(f"   - {len(teams)} teams created")
            print(f"   - {len(tickets)} tickets created")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

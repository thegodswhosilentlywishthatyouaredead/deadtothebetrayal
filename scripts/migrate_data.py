#!/usr/bin/env python3
"""
Migration script to copy data from Flask backend to microservices database
"""
import requests
import json
from sqlalchemy import create_engine, text
import random
from datetime import datetime, timedelta

# Database setup
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

# Flask backend URL
FLASK_API_BASE = "http://localhost:8080/api"

def fetch_flask_data():
    """Fetch all data from Flask backend"""
    print("🔄 Fetching data from Flask backend...")
    
    try:
        # Fetch teams
        teams_response = requests.get(f"{FLASK_API_BASE}/teams")
        teams_data = teams_response.json()["teams"] if teams_response.status_code == 200 else []
        print(f"📊 Fetched {len(teams_data)} teams")
        
        # Fetch tickets
        tickets_response = requests.get(f"{FLASK_API_BASE}/tickets")
        tickets_data = tickets_response.json()["tickets"] if tickets_response.status_code == 200 else []
        print(f"🎫 Fetched {len(tickets_data)} tickets")
        
        # Fetch assignments
        assignments_response = requests.get(f"{FLASK_API_BASE}/assignments")
        assignments_data = assignments_response.json()["assignments"] if assignments_response.status_code == 200 else []
        print(f"📋 Fetched {len(assignments_data)} assignments")
        
        return {
            "teams": teams_data,
            "tickets": tickets_data,
            "assignments": assignments_data
        }
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return {"teams": [], "tickets": [], "assignments": []}

def migrate_teams(teams_data):
    """Migrate teams data to microservices database"""
    print("👥 Migrating teams data...")
    
    with engine.connect() as conn:
        # Clear existing teams
        conn.execute(text("DELETE FROM teams"))
        conn.execute(text("DELETE FROM users"))
        
        for team in teams_data:
            # Create user for each team
            username = team["name"].lower().replace(" ", "_")
            email = team.get("email", f"{username}@aiff.com")
            
            # Check if user already exists
            existing_user = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
            user_row = existing_user.fetchone()
            
            if user_row:
                user_id = user_row[0]
            else:
                # Insert new user
                user_result = conn.execute(text("""
                    INSERT INTO users (username, email, full_name, is_active)
                    VALUES (:username, :email, :full_name, :is_active)
                    RETURNING id
                """), {
                    "username": username,
                    "email": email,
                    "full_name": team["name"],
                    "is_active": True
                })
                user_id = user_result.fetchone()[0]
            
            # Check if team already exists
            existing_team = conn.execute(text("SELECT id FROM teams WHERE name = :name"), {"name": team["name"]})
            team_row = existing_team.fetchone()
            
            if not team_row:
                # Insert new team
                conn.execute(text("""
                    INSERT INTO teams (name, zone, is_active)
                    VALUES (:name, :zone, :is_active)
                """), {
                    "name": team["name"],
                    "zone": team.get("currentLocation", {}).get("address", "Unknown Zone"),
                    "is_active": True
                })
        
        conn.commit()
        print(f"✅ Migrated {len(teams_data)} teams")

def migrate_tickets(tickets_data):
    """Migrate tickets data to microservices database"""
    print("🎫 Migrating tickets data...")
    
    with engine.connect() as conn:
        # Clear existing tickets
        conn.execute(text("DELETE FROM tickets"))
        
        for ticket in tickets_data:
            # Map status to enum values
            status_map = {
                "open": "OPEN",
                "in_progress": "IN_PROGRESS", 
                "resolved": "COMPLETED",
                "closed": "COMPLETED",
                "cancelled": "CANCELLED"
            }
            
            # Map priority to enum values
            priority_map = {
                "low": "LOW",
                "medium": "MEDIUM",
                "high": "HIGH",
                "urgent": "URGENT"
            }
            
            # Map category to enum values
            category_map = {
                "Network Breakdown - NTT Class 1 (Major)": "EMERGENCY",
                "Network Breakdown - NTT Class 2 (Intermediate)": "REPAIR",
                "Customer - Drop Fiber": "FIBER_INSTALLATION",
                "Customer - CPE": "MAINTENANCE",
                "Customer - FDP Breakdown": "REPAIR",
                "Network Breakdown - NTT (Minor)": "REPAIR",
                "Infrastructure - FDP Maintenance": "MAINTENANCE",
                "Infrastructure - Fiber Splicing": "FIBER_INSTALLATION",
                "Customer - ONU Issues": "MAINTENANCE",
                "Network - Backhaul Problems": "REPAIR"
            }
            
            status = status_map.get(ticket.get("status", "open"), "OPEN")
            priority = priority_map.get(ticket.get("priority", "medium"), "MEDIUM")
            category = category_map.get(ticket.get("category", "MAINTENANCE"), "MAINTENANCE")
            
            # Extract location data
            location = ticket.get("location", {})
            address = location.get("address", "Unknown Address")
            zone = location.get("zone", "Unknown Zone")
            coordinates = f"{location.get('latitude', 0)},{location.get('longitude', 0)}"
            
            # Extract customer info
            customer_info = ticket.get("customerInfo", {})
            customer_name = customer_info.get("name", "Unknown Customer")
            customer_contact = customer_info.get("phone", "Unknown")
            
            # Generate timestamps
            created_at = ticket.get("createdAt", datetime.now().isoformat())
            updated_at = ticket.get("updatedAt", created_at)
            
            # Insert ticket
            conn.execute(text("""
                INSERT INTO tickets (ticket_number, title, description, status, priority, category,
                                   location, zone, coordinates, customer_name, customer_contact,
                                   created_at, updated_at, sla_hours)
                VALUES (:ticket_number, :title, :description, :status, :priority, :category,
                        :location, :zone, :coordinates, :customer_name, :customer_contact,
                        :created_at, :updated_at, :sla_hours)
            """), {
                "ticket_number": ticket.get("ticketNumber", f"TKT-{random.randint(1000, 9999)}"),
                "title": ticket.get("title", "Sample Ticket"),
                "description": ticket.get("description", "No description available"),
                "status": status,
                "priority": priority,
                "category": category,
                "location": address,
                "zone": zone,
                "coordinates": coordinates,
                "customer_name": customer_name,
                "customer_contact": customer_contact,
                "created_at": created_at,
                "updated_at": updated_at,
                "sla_hours": 24  # Default SLA hours
            })
        
        conn.commit()
        print(f"✅ Migrated {len(tickets_data)} tickets")

def migrate_assignments(assignments_data):
    """Migrate assignments data to microservices database"""
    print("📋 Migrating assignments data...")
    
    with engine.connect() as conn:
        # Clear existing assignments
        conn.execute(text("DELETE FROM assignments"))
        
        for assignment in assignments_data:
            # Get team and ticket IDs (we'll need to map them)
            team_name = assignment.get("assignedTeam", {}).get("name", "")
            ticket_number = assignment.get("ticket", {}).get("ticketNumber", "")
            
            # Find team ID
            team_result = conn.execute(text("SELECT id FROM teams WHERE name = :name"), {"name": team_name})
            team_row = team_result.fetchone()
            team_id = team_row[0] if team_row else None
            
            # Find ticket ID
            ticket_result = conn.execute(text("SELECT id FROM tickets WHERE ticket_number = :ticket_number"), {"ticket_number": ticket_number})
            ticket_row = ticket_result.fetchone()
            ticket_id = ticket_row[0] if ticket_row else None
            
            if team_id and ticket_id:
                # Get a random user ID for assigned_by
                user_result = conn.execute(text("SELECT id FROM users LIMIT 1"))
                user_row = user_result.fetchone()
                assigned_by = user_row[0] if user_row else 1
                
                # Map status
                status_map = {
                    "assigned": "assigned",
                    "in_progress": "in_progress",
                    "completed": "completed",
                    "cancelled": "cancelled"
                }
                status = status_map.get(assignment.get("status", "assigned"), "assigned")
                
                # Insert assignment
                conn.execute(text("""
                    INSERT INTO assignments (ticket_id, team_id, assigned_by, status)
                    VALUES (:ticket_id, :team_id, :assigned_by, :status)
                """), {
                    "ticket_id": ticket_id,
                    "team_id": team_id,
                    "assigned_by": assigned_by,
                    "status": status
                })
        
        conn.commit()
        print(f"✅ Migrated {len(assignments_data)} assignments")

def create_sample_comments():
    """Create sample comments for tickets"""
    print("💬 Creating sample comments...")
    
    with engine.connect() as conn:
        # Get some tickets
        tickets_result = conn.execute(text("SELECT id FROM tickets LIMIT 20"))
        tickets = tickets_result.fetchall()
        
        # Get some users
        users_result = conn.execute(text("SELECT id FROM users LIMIT 5"))
        users = users_result.fetchall()
        
        for ticket_id, in tickets:
            # Create 1-3 comments per ticket
            num_comments = random.randint(1, 3)
            for _ in range(num_comments):
                user_id = random.choice(users)[0]
                comment_text = random.choice([
                    "Initial assessment completed",
                    "Issue identified, working on resolution",
                    "Customer contacted, appointment scheduled",
                    "Equipment tested, no issues found",
                    "Resolution in progress",
                    "Issue resolved successfully",
                    "Follow-up required",
                    "Customer satisfied with service"
                ])
                
                conn.execute(text("""
                    INSERT INTO comments (ticket_id, user_id, content)
                    VALUES (:ticket_id, :user_id, :content)
                """), {
                    "ticket_id": ticket_id,
                    "user_id": user_id,
                    "content": comment_text
                })
        
        conn.commit()
        print("✅ Created sample comments")

def main():
    """Main migration function"""
    print("🚀 Starting data migration from Flask to microservices...")
    
    # Fetch data from Flask backend
    flask_data = fetch_flask_data()
    
    if not flask_data["teams"] and not flask_data["tickets"]:
        print("❌ No data found in Flask backend. Please ensure Flask server is running on port 8080")
        return
    
    # Migrate data
    migrate_teams(flask_data["teams"])
    migrate_tickets(flask_data["tickets"])
    migrate_assignments(flask_data["assignments"])
    create_sample_comments()
    
    print("🎉 Data migration completed successfully!")
    print("📊 Summary:")
    print(f"   - {len(flask_data['teams'])} teams migrated")
    print(f"   - {len(flask_data['tickets'])} tickets migrated")
    print(f"   - {len(flask_data['assignments'])} assignments migrated")
    print("   - Sample comments created")
    
    # Verify data
    with engine.connect() as conn:
        teams_count = conn.execute(text("SELECT COUNT(*) FROM teams")).fetchone()[0]
        tickets_count = conn.execute(text("SELECT COUNT(*) FROM tickets")).fetchone()[0]
        assignments_count = conn.execute(text("SELECT COUNT(*) FROM assignments")).fetchone()[0]
        comments_count = conn.execute(text("SELECT COUNT(*) FROM comments")).fetchone()[0]
        
        print(f"\n📈 Database verification:")
        print(f"   - Teams in database: {teams_count}")
        print(f"   - Tickets in database: {tickets_count}")
        print(f"   - Assignments in database: {assignments_count}")
        print(f"   - Comments in database: {comments_count}")

if __name__ == "__main__":
    main()

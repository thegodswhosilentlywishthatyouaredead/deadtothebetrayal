#!/usr/bin/env python3
"""
Proper seed data script for AIFF database
"""
import os
from sqlalchemy import create_engine, text
import random
from datetime import datetime, timedelta

# Database setup
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

def seed_database():
    """Seed the database with sample data"""
    print("🌱 Seeding database with sample data...")
    
    with engine.connect() as conn:
        # Insert sample users
        print("👥 Creating sample users...")
        users_data = [
            ("admin", "admin@aiff.com", "Admin User"),
            ("john_doe", "john@aiff.com", "John Doe"),
            ("jane_smith", "jane@aiff.com", "Jane Smith"),
            ("mike_wilson", "mike@aiff.com", "Mike Wilson"),
            ("sarah_jones", "sarah@aiff.com", "Sarah Jones"),
        ]
        
        for username, email, full_name in users_data:
            conn.execute(text("""
                INSERT INTO users (username, email, full_name, is_active)
                VALUES (:username, :email, :full_name, :is_active)
                ON CONFLICT (username) DO NOTHING
            """), {
                "username": username,
                "email": email,
                "full_name": full_name,
                "is_active": True
            })
        
        # Insert sample teams
        print("🏢 Creating sample teams...")
        teams_data = [
            ("Team Alpha", "North Zone"),
            ("Team Beta", "South Zone"),
            ("Team Gamma", "East Zone"),
            ("Team Delta", "West Zone"),
            ("Team Echo", "Central Zone"),
        ]
        
        for name, zone in teams_data:
            conn.execute(text("""
                INSERT INTO teams (name, zone)
                VALUES (:name, :zone)
                ON CONFLICT DO NOTHING
            """), {"name": name, "zone": zone})
        
        # Insert sample tickets
        print("🎫 Creating sample tickets...")
        ticket_categories = ["FIBER_INSTALLATION", "MAINTENANCE", "REPAIR", "INSPECTION", "EMERGENCY"]
        ticket_priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        ticket_statuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
        
        for i in range(1, 51):  # Create 50 tickets
            ticket_number = f"TKT-{i:04d}"
            title = f"Sample Ticket {i}"
            description = f"This is a sample ticket description for ticket {i}"
            category = random.choice(ticket_categories)
            priority = random.choice(ticket_priorities)
            status = random.choice(ticket_statuses)
            
            # Random location data
            location = f"Sample Address {i}"
            zone = random.choice(["North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"])
            coordinates = f"{round(random.uniform(40.0, 41.0), 6)},{round(random.uniform(-74.0, -73.0), 6)}"
            
            # Random assignment
            assigned_team_id = random.randint(1, 5) if random.random() > 0.3 else None
            assigned_user_id = random.randint(1, 5) if random.random() > 0.3 else None
            
            conn.execute(text("""
                INSERT INTO tickets (ticket_number, title, description, status, priority, category, 
                                   location, zone, coordinates, assigned_team_id, assigned_user_id,
                                   customer_name, customer_contact)
                VALUES (:ticket_number, :title, :description, :status, :priority, :category,
                        :location, :zone, :coordinates, :assigned_team_id, :assigned_user_id,
                        :customer_name, :customer_contact)
                ON CONFLICT (ticket_number) DO NOTHING
            """), {
                "ticket_number": ticket_number,
                "title": title,
                "description": description,
                "status": status,
                "priority": priority,
                "category": category,
                "location": location,
                "zone": zone,
                "coordinates": coordinates,
                "assigned_team_id": assigned_team_id,
                "assigned_user_id": assigned_user_id,
                "customer_name": f"Customer {i}",
                "customer_contact": f"customer{i}@example.com"
            })
        
        # Insert sample assignments
        print("📋 Creating sample assignments...")
        for i in range(1, 31):  # Create 30 assignments
            ticket_id = random.randint(1, 50)
            team_id = random.randint(1, 5)
            assigned_by = random.randint(1, 5)
            status = random.choice(["assigned", "in_progress", "completed"])
            
            conn.execute(text("""
                INSERT INTO assignments (ticket_id, team_id, assigned_by, status)
                VALUES (:ticket_id, :team_id, :assigned_by, :status)
                ON CONFLICT DO NOTHING
            """), {
                "ticket_id": ticket_id,
                "team_id": team_id,
                "assigned_by": assigned_by,
                "status": status
            })
        
        # Insert sample comments
        print("💬 Creating sample comments...")
        for i in range(1, 21):  # Create 20 comments
            ticket_id = random.randint(1, 50)
            user_id = random.randint(1, 5)
            comment_text = f"This is a sample comment {i} for ticket {ticket_id}"
            
            conn.execute(text("""
                INSERT INTO comments (ticket_id, user_id, comment_text)
                VALUES (:ticket_id, :user_id, :comment_text)
            """), {
                "ticket_id": ticket_id,
                "user_id": user_id,
                "comment_text": comment_text
            })
        
        conn.commit()
        print("✅ Database seeded successfully!")
        print("📊 Created:")
        print("   - 5 users")
        print("   - 5 teams")
        print("   - 50 tickets")
        print("   - 30 assignments")
        print("   - 20 comments")

if __name__ == "__main__":
    seed_database()

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
        
        # Insert 150 sample teams across Malaysian states
        print("🏢 Creating 150 sample teams...")
        malaysian_states = [
            "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", 
            "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", 
            "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya"
        ]
        teams_data = []
        for i in range(1, 151):
            state = malaysian_states[(i - 1) % len(malaysian_states)]
            teams_data.append((f"Team {i:03d}", state))

        for name, zone in teams_data:
            try:
                result = conn.execute(text("""
                    INSERT INTO teams (name, zone, is_active)
                    VALUES (:name, :zone, :is_active)
                    ON CONFLICT (name) DO NOTHING
                """), {"name": name, "zone": zone, "is_active": True})
                print(f"Inserted team: {name} in {zone}")
            except Exception as e:
                print(f"Error inserting team {name}: {e}")
                raise
        
        # Commit teams before inserting tickets
        conn.commit()
        print("✅ Teams committed to database")
        
        # Insert 1000 sample tickets (lowercase fields to match analytics queries)
        print("🎫 Creating 1000 sample tickets...")
        ticket_categories = ["FIBER_INSTALLATION", "MAINTENANCE", "REPAIR", "INSPECTION"]
        ticket_priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        ticket_statuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

        now = datetime.utcnow()
        for i in range(1, 1001):
            ticket_number = f"CTT_{i:03d}"
            title = f"Sample Ticket {i}"
            description = f"This is a sample ticket description for ticket {i}"
            category = random.choice(ticket_categories)
            priority = random.choice(ticket_priorities)
            status = random.choices(ticket_statuses, weights=[40, 30, 25, 5], k=1)[0]

            # Random creation time within last 90 days
            created_at = now - timedelta(days=random.randint(0, 90), hours=random.randint(0, 23), minutes=random.randint(0, 59))
            completed_at = None
            estimated_duration = random.choice([60, 90, 120, 180])

            # If completed, set a realistic completed_at after created_at
            if status == "COMPLETED":
                hours_to_complete = random.randint(1, 12)
                completed_at = created_at + timedelta(hours=hours_to_complete)

            # Random location data (Malaysia coordinates)
            location = f"Sample Address {i}"
            zone = random.choice(malaysian_states)
            # Malaysia coordinates: roughly 1.0-7.0 N, 99.0-120.0 E
            lat = round(random.uniform(1.0, 7.0), 6)
            lng = round(random.uniform(99.0, 120.0), 6)
            coordinates = f"{lng},{lat}"

            # Random assignment to one of the 150 teams
            assigned_team_id = random.randint(1, 150) if status in ("OPEN", "IN_PROGRESS", "COMPLETED") else None
            assigned_user_id = random.randint(1, 5) if random.random() > 0.5 else None

            conn.execute(text("""
                INSERT INTO tickets (
                    ticket_number, title, description, status, priority, category,
                    location, zone, coordinates, assigned_team_id, assigned_user_id,
                    customer_name, customer_contact, created_at, completed_at, estimated_duration
                )
                VALUES (
                    :ticket_number, :title, :description, :status, :priority, :category,
                    :location, :zone, :coordinates, :assigned_team_id, :assigned_user_id,
                    :customer_name, :customer_contact, :created_at, :completed_at, :estimated_duration
                )
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
                "customer_contact": f"customer{i}@example.com",
                "created_at": created_at,
                "completed_at": completed_at,
                "estimated_duration": estimated_duration
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
                INSERT INTO comments (ticket_id, user_id, content)
                VALUES (:ticket_id, :user_id, :content)
            """), {
                "ticket_id": ticket_id,
                "user_id": user_id,
                "content": comment_text
            })
        
        conn.commit()
        print("✅ Database seeded successfully!")
        print("📊 Created:")
        print("   - 5 users")
        print("   - 150 teams")
        print("   - 1000 tickets (open, in_progress, completed, cancelled)")
        print("   - 30 assignments")
        print("   - 20 comments")

if __name__ == "__main__":
    seed_database()

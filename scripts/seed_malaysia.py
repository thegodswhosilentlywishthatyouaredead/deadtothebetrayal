#!/usr/bin/env python3
"""
Seed data script for AIFF database with Malaysian context
"""
import os
from sqlalchemy import create_engine, text
import random
from datetime import datetime, timedelta

# Database setup
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

# Malaysian states
MALAYSIAN_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
    "Pahang", "Penang", "Perak", "Perlis", "Sabah",
    "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya"
]

# Malaysian names
MALAYSIAN_NAMES = [
    "Anwar Ibrahim", "Najib Razak", "Rosmah Mansor", "Mahathir Mohamad",
    "Ahmad Zahid Hamidi", "Ismail Sabri", "Muhyiddin Yassin", "Hishammuddin Hussein",
    "Azmin Ali", "Rafizi Ramli", "Nurul Izzah", "Syed Saddiq",
    "Khairy Jamaluddin", "Hannah Yeoh", "Tony Pua", "Lim Guan Eng",
    "Abdullah Ahmad Badawi", "Khalid Ibrahim", "Azalina Othman", "Nancy Shukri",
    "Ahmad Maslan", "Fadillah Yusof", "Saifuddin Abdullah", "Zulkifli Aziz",
    "Hamzah Zainudin", "Radzi Jidin", "Shahidan Kassim", "Tiong King Sing",
    "Wan Saiful Wan Jan", "Zuraida Kamaruddin", "Steven Sim", "Charles Santiago",
    "Loke Siew Fook", "Gobind Singh Deo", "Nga Kor Ming", "Teresa Kok",
    "Nik Nazmi", "Fahmi Fadzil", "Akmal Nasir", "Salahuddin Ayub",
    "Amirudin Shari", "Sanusi Junid", "Muhammad Sanusi", "Saarani Mohamad",
    "Idris Haron", "Aminuddin Harun", "Hajiji Noor", "Abang Johari",
    "Faizal Azumu", "Ramkarpal Singh", "Sim Tze Tzin", "Yeoh Soon Hin"
]

def seed_database():
    """Seed the database with sample data"""
    print("🌱 Seeding database with Malaysian data...")
    
    with engine.connect() as conn:
        # Insert sample users
        print("👥 Creating sample users...")
        users_data = [
            ("admin", "admin@aiff.com", "Admin User"),
            ("anwar", "anwar@aiff.com", "Anwar Ibrahim"),
            ("najib", "najib@aiff.com", "Najib Razak"),
            ("mahathir", "mahathir@aiff.com", "Mahathir Mohamad"),
            ("ismail", "ismail@aiff.com", "Ismail Sabri"),
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
        
        # Insert 150 teams with Malaysian names
        print("🏢 Creating 150 teams with Malaysian names...")
        teams_created = 0
        for i in range(150):
            # Use Malaysian names, cycling through the list
            name = MALAYSIAN_NAMES[i % len(MALAYSIAN_NAMES)]
            if i >= len(MALAYSIAN_NAMES):
                # Add suffix for duplicates
                name = f"{name} {i // len(MALAYSIAN_NAMES) + 1}"
            
            # Assign to Malaysian state
            state = MALAYSIAN_STATES[i % len(MALAYSIAN_STATES)]
            
            try:
                conn.execute(text("""
                    INSERT INTO teams (name, zone, is_active)
                    VALUES (:name, :zone, :is_active)
                    ON CONFLICT (name) DO NOTHING
                """), {"name": name, "zone": state, "is_active": True})
                teams_created += 1
                if (i + 1) % 30 == 0:
                    print(f"  Created {i + 1} teams...")
            except Exception as e:
                print(f"Error inserting team {name}: {e}")
        
        # Commit teams before inserting tickets
        conn.commit()
        print(f"✅ {teams_created} teams committed to database")
        
        # Get actual team IDs from database
        result = conn.execute(text("SELECT id FROM teams ORDER BY id"))
        team_ids = [row[0] for row in result.fetchall()]
        print(f"📊 Found {len(team_ids)} team IDs in database")
        
        # Insert 1000 tickets
        print("🎫 Creating 1000 sample tickets...")
        ticket_categories = ["FIBER_INSTALLATION", "MAINTENANCE", "REPAIR", "INSPECTION"]
        ticket_priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        ticket_statuses = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

        now = datetime.utcnow()
        tickets_created = 0
        
        for i in range(1, 1001):
            ticket_number = f"TKT-{i:04d}"
            title = f"Ticket {i} - {random.choice(['Fiber Installation', 'Network Maintenance', 'Equipment Repair', 'Site Inspection'])}"
            description = f"Service ticket for {random.choice(MALAYSIAN_STATES)}"
            category = random.choice(ticket_categories)
            priority = random.choice(ticket_priorities)
            status = random.choices(ticket_statuses, weights=[40, 30, 25, 5], k=1)[0]

            # Random creation time within last 90 days
            created_at = now - timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
            completed_at = None
            estimated_duration = random.choice([60, 90, 120, 180])

            # If completed, set completed_at
            if status == "COMPLETED":
                hours_to_complete = random.randint(1, 12)
                completed_at = created_at + timedelta(hours=hours_to_complete)

            # Malaysian location (using KL coordinates as base)
            location = f"{random.choice(['Jalan', 'Lorong', 'Taman'])} {random.randint(1, 100)}, {random.choice(MALAYSIAN_STATES)}"
            state = random.choice(MALAYSIAN_STATES)
            lat = round(random.uniform(1.5, 6.5), 6)  # Malaysia latitude range
            lng = round(random.uniform(99.5, 119.5), 6)  # Malaysia longitude range
            coordinates = f"{lat},{lng}"

            # Random assignment to actual team IDs
            assigned_team_id = random.choice(team_ids) if status in ("OPEN", "IN_PROGRESS", "COMPLETED") and team_ids else None
            assigned_user_id = random.randint(1, 5) if random.random() > 0.5 else None

            try:
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
                    "zone": state,
                    "coordinates": coordinates,
                    "assigned_team_id": assigned_team_id,
                    "assigned_user_id": assigned_user_id,
                    "customer_name": f"Customer {i}",
                    "customer_contact": f"customer{i}@example.my",
                    "created_at": created_at,
                    "completed_at": completed_at,
                    "estimated_duration": estimated_duration
                })
                tickets_created += 1
                if i % 200 == 0:
                    print(f"  Created {i} tickets...")
            except Exception as e:
                print(f"Error inserting ticket {ticket_number}: {e}")
        
        # Insert sample assignments
        print("📋 Creating sample assignments...")
        assignments_created = 0
        for i in range(1, 31):
            if not team_ids:
                break
            ticket_id = random.randint(1, min(50, tickets_created))
            team_id = random.choice(team_ids)
            assigned_by = random.randint(1, 5)
            status = random.choice(["assigned", "in_progress", "completed"])
            
            try:
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
                assignments_created += 1
            except Exception as e:
                print(f"Error inserting assignment: {e}")
        
        # Insert sample comments
        print("💬 Creating sample comments...")
        comments_created = 0
        for i in range(1, 21):
            ticket_id = random.randint(1, min(50, tickets_created))
            user_id = random.randint(1, 5)
            comment_text = f"Update {i}: Work in progress for ticket {ticket_id}"
            
            try:
                conn.execute(text("""
                    INSERT INTO comments (ticket_id, user_id, content)
                    VALUES (:ticket_id, :user_id, :content)
                """), {
                    "ticket_id": ticket_id,
                    "user_id": user_id,
                    "content": comment_text
                })
                comments_created += 1
            except Exception as e:
                print(f"Error inserting comment: {e}")
        
        conn.commit()
        print("\n✅ Database seeded successfully!")
        print("📊 Created:")
        print(f"   - 5 users")
        print(f"   - {teams_created} teams (Malaysian names)")
        print(f"   - {tickets_created} tickets (Malaysian locations)")
        print(f"   - {assignments_created} assignments")
        print(f"   - {comments_created} comments")

if __name__ == "__main__":
    seed_database()


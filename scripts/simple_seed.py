#!/usr/bin/env python3
"""
Simple seed data script for AIFF database
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
        # Create tables if they don't exist
        print("📋 Creating tables...")
        
        # Users table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(20) DEFAULT 'technician',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Teams table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                zone VARCHAR(50),
                team_lead_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Tickets table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                ticket_number VARCHAR(20) UNIQUE NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                status VARCHAR(20) DEFAULT 'open',
                priority VARCHAR(20) DEFAULT 'medium',
                category VARCHAR(50),
                location JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Assignments table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS assignments (
                id SERIAL PRIMARY KEY,
                ticket_id INTEGER REFERENCES tickets(id),
                team_id INTEGER REFERENCES teams(id),
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'assigned'
            )
        """))
        
        conn.commit()
        
        # Insert sample users
        print("👥 Creating sample users...")
        users_data = [
            ("admin", "admin@aiff.com", "hashed_password", "Admin User", "admin"),
            ("john_doe", "john@aiff.com", "hashed_password", "John Doe", "technician"),
            ("jane_smith", "jane@aiff.com", "hashed_password", "Jane Smith", "technician"),
            ("mike_wilson", "mike@aiff.com", "hashed_password", "Mike Wilson", "technician"),
            ("sarah_jones", "sarah@aiff.com", "hashed_password", "Sarah Jones", "technician"),
        ]
        
        for username, email, password, full_name, role in users_data:
            conn.execute(text("""
                INSERT INTO users (username, email, hashed_password, full_name, role)
                VALUES (:username, :email, :password, :full_name, :role)
                ON CONFLICT (username) DO NOTHING
            """), {
                "username": username,
                "email": email,
                "password": password,
                "full_name": full_name,
                "role": role
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
        ticket_categories = ["Fiber Installation", "Cable Repair", "Equipment Maintenance", "Network Upgrade", "Customer Support"]
        ticket_priorities = ["low", "medium", "high", "urgent"]
        ticket_statuses = ["open", "in_progress", "completed", "cancelled"]
        
        for i in range(1, 51):  # Create 50 tickets
            ticket_number = f"TKT-{i:04d}"
            title = f"Sample Ticket {i}"
            description = f"This is a sample ticket description for ticket {i}"
            category = random.choice(ticket_categories)
            priority = random.choice(ticket_priorities)
            status = random.choice(ticket_statuses)
            
            # Random location data
            location = {
                "address": f"Sample Address {i}",
                "zone": random.choice(["North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"]),
                "coordinates": {
                    "lat": round(random.uniform(40.0, 41.0), 6),
                    "lng": round(random.uniform(-74.0, -73.0), 6)
                }
            }
            
            conn.execute(text("""
                INSERT INTO tickets (ticket_number, title, description, status, priority, category, location)
                VALUES (:ticket_number, :title, :description, :status, :priority, :category, :location)
                ON CONFLICT (ticket_number) DO NOTHING
            """), {
                "ticket_number": ticket_number,
                "title": title,
                "description": description,
                "status": status,
                "priority": priority,
                "category": category,
                "location": str(location).replace("'", '"')
            })
        
        # Insert sample assignments
        print("📋 Creating sample assignments...")
        for i in range(1, 31):  # Create 30 assignments
            ticket_id = random.randint(1, 50)
            team_id = random.randint(1, 5)
            status = random.choice(["assigned", "in_progress", "completed"])
            
            conn.execute(text("""
                INSERT INTO assignments (ticket_id, team_id, status)
                VALUES (:ticket_id, :team_id, :status)
                ON CONFLICT DO NOTHING
            """), {
                "ticket_id": ticket_id,
                "team_id": team_id,
                "status": status
            })
        
        conn.commit()
        print("✅ Database seeded successfully!")
        print("📊 Created:")
        print("   - 5 users")
        print("   - 5 teams")
        print("   - 50 tickets")
        print("   - 30 assignments")

if __name__ == "__main__":
    seed_database()

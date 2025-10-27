#!/usr/bin/env python3
"""
Enhanced AIFF Database Seeding Script
Creates ticketv2 API data with Malaysian cabinet names and comprehensive metrics
"""

import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import random
import json

# Database connection
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

# Malaysian Cabinet Names (75 unique teams)
MALAYSIAN_CABINET_NAMES = [
    "Anwar Ibrahim", "Ahmad Zahid Hamidi", "Fadillah Yusof", "Mohamed Azmin Ali",
    "Rafizi Ramli", "Saifuddin Nasution", "Mohamed Sabu", "Gobind Singh Deo",
    "Tengku Zafrul Aziz", "Khairy Jamaluddin", "Azalina Othman Said", "Wan Junaidi Tuanku Jaafar",
    "Nancy Shukri", "Rina Harun", "Reezal Merican Naina Merican", "Ismail Sabri Yaakob",
    "Hishammuddin Hussein", "Mustapa Mohamed", "Noh Omar", "Ahmad Maslan",
    "Johari Abdul Ghani", "Mahdzir Khalid", "Hamzah Zainudin", "Azmin Ali",
    "Zuraida Kamaruddin", "Saifuddin Abdullah", "Redzuan Yusof", "Tariq Ismail",
    "Shamsul Anuar Nasarah", "Halimah Sadique", "Noraini Ahmad", "Mas Ermieyati Samsudin",
    "Rosnah Shirlin", "Teo Nie Ching", "Steven Sim", "Hannah Yeoh",
    "Syed Saddiq Syed Abdul Rahman", "Nik Nazmi Nik Ahmad", "Fahmi Fadzil", "Adam Adli",
    "Syed Ibrahim Syed Noh", "Mohd Hatta Ramli", "Kamarul Baharin Abbas", "Mohd Rashid Hasnon",
    "Mohd Nazri Abdul Aziz", "Mohd Zuki Ali", "Mohd Shafie Apdal", "Mohd Sabu",
    "Mohd Azmin Ali", "Mohd Rafizi Ramli", "Mohd Saifuddin Nasution", "Mohd Gobind Singh Deo",
    "Mohd Tengku Zafrul Aziz", "Mohd Khairy Jamaluddin", "Mohd Azalina Othman Said",
    "Mohd Wan Junaidi Tuanku Jaafar", "Mohd Nancy Shukri", "Mohd Rina Harun",
    "Mohd Reezal Merican Naina Merican", "Mohd Ismail Sabri Yaakob", "Mohd Hishammuddin Hussein",
    "Mohd Mustapa Mohamed", "Mohd Ahmad Maslan", "Mohd Johari Abdul Ghani",
    "Mohd Mahdzir Khalid", "Mohd Hamzah Zainudin", "Mohd Zuraida Kamaruddin",
    "Mohd Saifuddin Abdullah", "Mohd Redzuan Yusof", "Mohd Tariq Ismail",
    "Mohd Shamsul Anuar Nasarah", "Mohd Halimah Sadique", "Mohd Noraini Ahmad",
    "Mohd Mas Ermieyati Samsudin", "Mohd Rosnah Shirlin", "Mohd Lim Guan Eng",
    "Mohd Anthony Loke", "Mohd Gobind Singh", "Mohd Teresa Kok", "Mohd Chong Chieng Jen"
]

# Malaysian States and Zones
MALAYSIAN_STATES = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
    'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya'
]

# Ticket Categories and Priorities
TICKET_CATEGORIES = ['FIBER_INSTALLATION', 'MAINTENANCE', 'REPAIR', 'INSPECTION', 'EMERGENCY']
TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

# Status distribution weights (realistic distribution)
STATUS_DISTRIBUTION = {
    'OPEN': 0.25,           # 25% open
    'IN_PROGRESS': 0.35,    # 35% in progress
    'COMPLETED': 0.35,      # 35% completed
    'CANCELLED': 0.05       # 5% cancelled
}

def seed_enhanced_database():
    print("🚀 Creating Enhanced AIFF Database with ticketv2 API data...")
    
    with engine.connect() as conn:
        trans = conn.begin()
        
        try:
            # Create users first
            print("👤 Creating users...")
            conn.execute(text("""
                INSERT INTO users (username, email, hashed_password, full_name, is_active, is_admin)
                VALUES 
                    ('admin', 'admin@aiff.com', 'adminpass', 'Admin User', true, true),
                    ('field1', 'field1@aiff.com', 'field1pass', 'Field Team 1', true, false),
                    ('field2', 'field2@aiff.com', 'field2pass', 'Field Team 2', true, false)
                ON CONFLICT (username) DO NOTHING
            """))
            conn.commit()  # Commit users first
            print("✅ Users created/verified")
            
            # Create enhanced teams (75 Malaysian cabinet names)
            print("👥 Creating 75 Malaysian Cabinet Name Teams...")
            
            # Check existing teams count
            existing_teams_result = conn.execute(text("SELECT COUNT(*) FROM teams"))
            existing_count = existing_teams_result.fetchone()[0]
            print(f"📊 Found {existing_count} existing teams")
            
            # Only add new teams if we don't have enough
            if existing_count < 75:
                print(f"➕ Adding {75 - existing_count} new teams to reach 75 total")
            
            for i, cabinet_name in enumerate(MALAYSIAN_CABINET_NAMES, 1):
                team_name = f"Team {cabinet_name}"
                
                # Check if team already exists
                existing_team = conn.execute(text("SELECT id FROM teams WHERE name = :name"), {'name': team_name}).fetchone()
                
                if existing_team:
                    print(f"⏭️  Team {team_name} already exists, skipping...")
                    continue
                
                state = random.choice(MALAYSIAN_STATES)
                
                # Generate realistic coordinates for Malaysian locations
                if state == 'Kuala Lumpur':
                    base_lat, base_lon = 3.1390, 101.6869
                elif state == 'Penang':
                    base_lat, base_lon = 5.4164, 100.3327
                elif state == 'Johor':
                    base_lat, base_lon = 1.4927, 103.7414
                elif state == 'Sabah':
                    base_lat, base_lon = 5.9804, 116.0753
                elif state == 'Sarawak':
                    base_lat, base_lon = 1.5533, 110.3593
                else:
                    # Random coordinates within Malaysia bounds
                    base_lat = random.uniform(1.0, 7.0)
                    base_lon = random.uniform(99.0, 120.0)
                
                # Add some variation
                lat = base_lat + random.uniform(-0.1, 0.1)
                lon = base_lon + random.uniform(-0.1, 0.1)
                
                # Generate realistic performance metrics
                efficiency_score = round(random.uniform(70.0, 95.0), 2)
                productivity_score = round(random.uniform(75.0, 90.0), 2)
                rating = round(random.uniform(4.0, 5.0), 2)
                tickets_completed = random.randint(15, 80)
                
                # Calculate mean time to complete (hours)
                mean_completion_time = round(random.uniform(2.0, 8.0), 2)
                
                # Availability status
                availability_status = random.choice(['available', 'busy', 'offline'])
                
                conn.execute(text("""
                    INSERT INTO teams (name, description, zone, is_active, current_latitude, current_longitude, 
                                     current_address, status, battery_level, signal_strength, speed, heading, 
                                     is_moving, rating, productivity_score, efficiency_score, tickets_completed, 
                                     response_time_avg, skills, equipment, availability)
                    VALUES (:name, :description, :zone, :is_active, :lat, :lon, :address, :status, 
                            :battery, :signal, :speed, :heading, :moving, :rating, :productivity, 
                            :efficiency, :completed, :response_time, :skills, :equipment, :availability)
                """), {
                    'name': team_name,
                    'description': f'Field team led by {cabinet_name} operating in {state}',
                    'zone': state,
                    'is_active': True,
                    'lat': lat,
                    'lon': lon,
                    'address': f'{cabinet_name} Field Station, {state}',
                    'status': availability_status,
                    'battery': random.randint(60, 100),
                    'signal': random.randint(70, 100),
                    'speed': random.uniform(0, 60),
                    'heading': random.uniform(0, 360),
                    'moving': random.choice([True, False]),
                    'rating': rating,
                    'productivity': productivity_score,
                    'efficiency': efficiency_score,
                    'completed': tickets_completed,
                    'response_time': mean_completion_time,
                    'skills': json.dumps(['network', 'electrical', 'maintenance', 'telecom']),
                    'equipment': json.dumps(['multimeter', 'cable_tester', 'tools', 'safety_gear']),
                    'availability': json.dumps({
                        'status': availability_status,
                        'max_daily_tickets': 5,
                        'current_daily_load': random.randint(0, 5),
                        'capacity_utilization': round(random.uniform(0.3, 0.9), 2)
                    })
                })
                print(f"✅ Created team: {team_name}")
            
            # Create 1000 tickets with 3 months of realistic data
            print("🎫 Creating 1000 tickets with 3 months of realistic data...")
            
            # Check existing tickets count
            existing_tickets_result = conn.execute(text("SELECT COUNT(*) FROM tickets"))
            existing_ticket_count = existing_tickets_result.fetchone()[0]
            print(f"📊 Found {existing_ticket_count} existing tickets")
            
            # Only add new tickets if we don't have enough
            if existing_ticket_count < 1000:
                tickets_to_add = 1000 - existing_ticket_count
                print(f"➕ Adding {tickets_to_add} new tickets to reach 1000 total")
                
                # Get the next ticket number
                max_ticket_result = conn.execute(text("SELECT MAX(id) FROM tickets"))
                max_id = max_ticket_result.fetchone()[0] or 0
            
                # Generate tickets over 3 months
                start_date = datetime.now() - timedelta(days=90)
                
                for i in range(max_id + 1, max_id + tickets_to_add + 1):
                    # Generate creation date over 3 months
                    days_ago = random.randint(0, 90)
                    created_at = start_date + timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
                    
                    # Select status based on distribution
                    status = random.choices(
                        list(STATUS_DISTRIBUTION.keys()),
                        weights=list(STATUS_DISTRIBUTION.values())
                    )[0]
                    
                    state = random.choice(MALAYSIAN_STATES)
                    category = random.choice(TICKET_CATEGORIES)
                    priority = random.choice(TICKET_PRIORITIES)
                    
                    # Generate ticket number in CTT format
                    ticket_number = f"CTT_{i:04d}_{state.upper()}"
                    
                    # Generate realistic timing based on status
                    updated_at = created_at
                    completed_at = None
                    in_progress_at = None
                    
                    if status == 'COMPLETED':
                        # Completed tickets have completion time
                        completion_hours = random.uniform(1.0, 24.0)  # SLA: 24 hours
                        completed_at = created_at + timedelta(hours=completion_hours)
                        updated_at = completed_at
                        
                        # Some tickets were in progress before completion
                        if random.random() > 0.3:  # 70% were in progress
                            in_progress_hours = random.uniform(0.5, completion_hours * 0.8)
                            in_progress_at = created_at + timedelta(hours=in_progress_hours)
                    
                    elif status == 'IN_PROGRESS':
                        # In progress tickets
                        in_progress_hours = random.uniform(0.5, 12.0)
                        in_progress_at = created_at + timedelta(hours=in_progress_hours)
                        updated_at = in_progress_at
                    
                    elif status == 'CANCELLED':
                        # Cancelled tickets
                        cancelled_hours = random.uniform(0.5, 8.0)
                        updated_at = created_at + timedelta(hours=cancelled_hours)
                    
                    # Calculate ticket aging
                    aging_days = (datetime.now() - created_at).days
                    
                    # Assign team based on availability and zone
                    assigned_team_id = None
                    if status in ['IN_PROGRESS', 'COMPLETED']:
                        # Get teams in the same zone
                        team_result = conn.execute(text("""
                            SELECT id FROM teams WHERE zone = :zone AND is_active = true 
                            ORDER BY RANDOM() LIMIT 1
                        """), {'zone': state})
                        team_row = team_result.fetchone()
                        if team_row:
                            assigned_team_id = team_row[0]
                    
                    # Generate customer data
                    customer_names = ['Ahmad', 'Siti', 'Muhammad', 'Fatimah', 'Ali', 'Aisha', 'Hassan', 'Zainab']
                    customer_name = random.choice(customer_names)
                    
                    conn.execute(text("""
                        INSERT INTO tickets (ticket_number, title, description, priority, status, category,
                                           location, zone, coordinates, assigned_team_id, assigned_user_id,
                                           created_at, updated_at, due_date, completed_at, sla_hours, 
                                           estimated_duration, customer_name, customer_contact)
                        VALUES (:ticket_number, :title, :description, :priority, :status, :category,
                               :location, :zone, :coordinates, :team_id, :user_id, :created_at, :updated_at,
                               :due_date, :completed_at, :sla_hours, :estimated_duration, :customer_name, :customer_contact)
                    """), {
                        'ticket_number': ticket_number,
                        'title': f'{category.title()} Issue - {state} Zone',
                        'description': f'Network infrastructure issue in {state} requiring {priority} priority attention. Issue reported by {customer_name}.',
                        'priority': priority,
                        'status': status,
                        'category': category,
                        'location': f'{customer_name} Location, {state}',
                        'zone': state,
                        'coordinates': f"{random.uniform(1.0, 7.0):.6f},{random.uniform(99.0, 120.0):.6f}",
                        'team_id': assigned_team_id,
                        'user_id': random.randint(1, 3),
                        'created_at': created_at,
                        'updated_at': updated_at,
                        'due_date': created_at + timedelta(hours=24),  # 24-hour SLA
                        'completed_at': completed_at,
                        'sla_hours': 24,
                        'estimated_duration': round(random.uniform(1.0, 8.0), 2),
                        'customer_name': customer_name,
                        'customer_contact': f'60{random.randint(100000000, 999999999)}'
                    })
                
                print(f"✅ Created {tickets_to_add} new tickets")
            else:
                print("✅ Already have 1000+ tickets, skipping ticket creation")
            
            # Create assignment data
            print("🔗 Creating intelligent assignment data...")
            
            # Get all in-progress and completed tickets with teams
            ticket_result = conn.execute(text("""
                SELECT id, assigned_team_id, created_at, completed_at, status 
                FROM tickets 
                WHERE assigned_team_id IS NOT NULL AND status IN ('in_progress', 'completed')
            """))
            
            assignments_created = 0
            for ticket_row in ticket_result.fetchall():
                ticket_id, team_id, created_at, completed_at, status = ticket_row
                
                # Create assignment record
                assignment_status = 'active' if status == 'in_progress' else 'completed'
                assigned_at = created_at + timedelta(minutes=random.randint(5, 60))
                
                conn.execute(text("""
                    INSERT INTO assignments (ticket_id, team_id, assigned_by, assigned_at, status, 
                                           priority, notes, estimated_completion_time, actual_completion_time)
                    VALUES (:ticket_id, :team_id, :assigned_by, :assigned_at, :status, :priority, 
                           :notes, :estimated_completion, :actual_completion)
                """), {
                    'ticket_id': ticket_id,
                    'team_id': team_id,
                    'assigned_by': random.randint(1, 3),
                    'assigned_at': assigned_at,
                    'status': assignment_status,
                    'priority': random.choice(['low', 'medium', 'high', 'urgent']),
                    'notes': f'Assigned to team {team_id} for {status} resolution',
                    'estimated_completion': assigned_at + timedelta(hours=random.uniform(2, 8)),
                    'actual_completion': completed_at if completed_at else None
                })
                assignments_created += 1
            
            # Update team productivity metrics based on actual assignments
            print("📊 Updating team productivity metrics...")
            
            team_result = conn.execute(text("""
                SELECT t.id, COUNT(a.id) as assignment_count, 
                       AVG(EXTRACT(EPOCH FROM (a.actual_completion_time - a.assigned_at))/3600) as avg_completion_hours
                FROM teams t
                LEFT JOIN assignments a ON t.id = a.team_id AND a.status = 'completed'
                GROUP BY t.id
            """))
            
            for team_row in team_result.fetchall():
                team_id, assignment_count, avg_completion_hours = team_row
                
                if avg_completion_hours:
                    efficiency_score = max(70, min(95, 100 - (avg_completion_hours - 2) * 5))
                    productivity_score = max(75, min(90, 80 + (assignment_count * 0.5)))
                    
                    conn.execute(text("""
                        UPDATE teams 
                        SET efficiency_score = :efficiency, productivity_score = :productivity,
                            tickets_completed = :completed, response_time_avg = :response_time
                        WHERE id = :team_id
                    """), {
                        'efficiency': round(efficiency_score, 2),
                        'productivity': round(productivity_score, 2),
                        'completed': assignment_count,
                        'response_time': round(avg_completion_hours, 2),
                        'team_id': team_id
                    })
            
            trans.commit()
            print("✅ Enhanced database seeded successfully!")
            print(f"📊 Created:")
            print(f"   - 75 Malaysian Cabinet Name Teams")
            print(f"   - 1000 tickets with 3 months of realistic data")
            print(f"   - {assignments_created} intelligent assignments")
            print(f"   - Comprehensive productivity metrics")
            print(f"   - Ticket aging and SLA tracking")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Error seeding database: {e}")
            raise

if __name__ == "__main__":
    seed_enhanced_database()

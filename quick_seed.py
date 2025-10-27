#!/usr/bin/env python3
"""
Simple database seeding script for AIFF system
Populates database with sample Malaysian data
"""

import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import random

# Database connection
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

def seed_database():
    print("🌱 Seeding database with sample Malaysian data...")
    
    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()
        
        try:
            # Clear existing data
            print("🧹 Clearing existing data...")
            conn.execute(text("DELETE FROM assignments"))
            conn.execute(text("DELETE FROM comments"))
            conn.execute(text("DELETE FROM tickets"))
            conn.execute(text("DELETE FROM teams"))
            conn.execute(text("DELETE FROM users"))
            
            # Create sample users
            print("👥 Creating sample users...")
            conn.execute(text("""
                INSERT INTO users (username, email, hashed_password, full_name, is_active, is_admin)
                VALUES 
                    ('admin', 'admin@aiff.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V5j5Q5Q5O', 'Admin User', true, true),
                    ('field1', 'field1@aiff.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V5j5Q5Q5O', 'Field Team 1', true, false),
                    ('field2', 'field2@aiff.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V5j5Q5Q5O', 'Field Team 2', true, false)
            """))
            
            # Create sample teams
            print("👥 Creating sample teams...")
            malaysian_states = [
                'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
                'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
                'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya'
            ]
            
            malaysian_names = [
                'Ahmad', 'Siti', 'Muhammad', 'Fatimah', 'Ali', 'Aisha',
                'Hassan', 'Zainab', 'Omar', 'Khadijah', 'Ibrahim', 'Maryam',
                'Yusuf', 'Aminah', 'Ismail', 'Hajar', 'Yunus', 'Sarah'
            ]
            
            for i in range(1, 21):  # Create 20 teams
                state = random.choice(malaysian_states)
                name = f"{random.choice(malaysian_names)} Team {i}"
                
                conn.execute(text("""
                    INSERT INTO teams (name, description, zone, is_active, current_latitude, current_longitude, 
                                     current_address, status, battery_level, signal_strength, speed, heading, 
                                     is_moving, rating, productivity_score, efficiency_score, tickets_completed, 
                                     response_time_avg, skills, equipment, availability)
                    VALUES (:name, :description, :zone, :is_active, :lat, :lon, :address, :status, 
                            :battery, :signal, :speed, :heading, :moving, :rating, :productivity, 
                            :efficiency, :completed, :response_time, :skills, :equipment, :availability)
                """), {
                    'name': name,
                    'description': f'Field team operating in {state}',
                    'zone': state,
                    'is_active': True,
                    'lat': 3.1390 + random.uniform(-0.5, 0.5),
                    'lon': 101.6869 + random.uniform(-0.5, 0.5),
                    'address': f'Field Location, {state}',
                    'status': random.choice(['active', 'busy', 'inactive']),
                    'battery': random.randint(60, 100),
                    'signal': random.randint(70, 100),
                    'speed': random.uniform(0, 60),
                    'heading': random.uniform(0, 360),
                    'moving': random.choice([True, False]),
                    'rating': round(random.uniform(4.0, 5.0), 2),
                    'productivity': round(random.uniform(75.0, 95.0), 2),
                    'efficiency': round(random.uniform(70.0, 90.0), 2),
                    'completed': random.randint(10, 50),
                    'response_time': round(random.uniform(15.0, 45.0), 2),
                    'skills': '["network", "electrical", "maintenance"]',
                    'equipment': '["multimeter", "cable_tester", "tools"]',
                    'availability': '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true}'
                })
            
            # Create sample tickets
            print("🎫 Creating sample tickets...")
            ticket_categories = ['network', 'electrical', 'hvac', 'security', 'maintenance']
            ticket_priorities = ['low', 'medium', 'high', 'urgent']
            ticket_statuses = ['open', 'assigned', 'in_progress', 'completed', 'cancelled']
            
            for i in range(1, 51):  # Create 50 tickets
                state = random.choice(malaysian_states)
                category = random.choice(ticket_categories)
                priority = random.choice(ticket_priorities)
                status = random.choice(ticket_statuses)
                
                conn.execute(text("""
                    INSERT INTO tickets (ticket_number, title, description, priority, status, category,
                                       customer_name, customer_email, customer_phone, location_address,
                                       location_latitude, location_longitude, assigned_team_id, assigned_user_id,
                                       created_at, updated_at)
                    VALUES (:ticket_number, :title, :description, :priority, :status, :category,
                           :customer_name, :customer_email, :customer_phone, :location_address,
                           :lat, :lon, :team_id, :user_id, :created_at, :updated_at)
                """), {
                    'ticket_number': f'CTT_{i:03d}_{state.upper()}',
                    'title': f'{category.title()} Issue - {state}',
                    'description': f'Network infrastructure issue in {state} requiring immediate attention',
                    'priority': priority,
                    'status': status,
                    'category': category,
                    'customer_name': f'Customer {i}',
                    'customer_email': f'customer{i}@company.com',
                    'customer_phone': f'60{random.randint(100000000, 999999999)}',
                    'location_address': f'Location {i}, {state}',
                    'lat': 3.1390 + random.uniform(-0.5, 0.5),
                    'lon': 101.6869 + random.uniform(-0.5, 0.5),
                    'team_id': random.randint(1, 20) if status != 'open' else None,
                    'user_id': random.randint(1, 3),
                    'created_at': datetime.now() - timedelta(days=random.randint(1, 30)),
                    'updated_at': datetime.now() - timedelta(days=random.randint(0, 5))
                })
            
            # Commit transaction
            trans.commit()
            print("✅ Database seeded successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Error seeding database: {e}")
            raise

if __name__ == "__main__":
    seed_database()

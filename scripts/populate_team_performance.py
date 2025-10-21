#!/usr/bin/env python3
"""
Script to populate teams with realistic performance data
"""
import random
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

# Database setup
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

def populate_team_performance():
    """Populate teams with realistic performance data"""
    print("🔄 Populating team performance data...")
    
    with engine.connect() as conn:
        # Get all active teams
        result = conn.execute(text("SELECT id, name, zone FROM teams WHERE is_active = true"))
        teams = result.fetchall()
        
        print(f"📊 Found {len(teams)} active teams")
        
        # Malaysian zones for realistic data
        malaysian_zones = [
            "Kuala Lumpur, Malaysia", "Selangor, Malaysia", "Penang, Malaysia",
            "Johor, Malaysia", "Sabah, Malaysia", "Sarawak, Malaysia",
            "Kedah, Malaysia", "Kelantan, Malaysia", "Terengganu, Malaysia",
            "Pahang, Malaysia", "Perak, Malaysia", "Negeri Sembilan, Malaysia",
            "Melaka, Malaysia", "Perlis, Malaysia", "Labuan, Malaysia"
        ]
        
        for team in teams:
            team_id, team_name, current_zone = team
            
            # Generate realistic performance data
            tickets_completed = random.randint(15, 65)
            customer_rating = round(random.uniform(4.0, 5.0), 2)
            response_time = random.randint(15, 45)  # minutes
            completion_rate = round(random.uniform(85.0, 100.0), 1)
            efficiency = round(random.uniform(75.0, 95.0), 1)
            
            # Update team with performance data
            conn.execute(text("""
                UPDATE teams 
                SET 
                    zone = :zone,
                    description = :description,
                    updated_at = :updated_at
                WHERE id = :team_id
            """), {
                "team_id": team_id,
                "zone": current_zone if current_zone and current_zone != "Unknown Zone" else random.choice(malaysian_zones),
                "description": f"High-performing team with {tickets_completed} completed tickets and {customer_rating} star rating",
                "updated_at": datetime.now()
            })
            
            print(f"✅ Updated {team_name}: {tickets_completed} tickets, {customer_rating}⭐ rating")
        
        conn.commit()
        print(f"🎉 Successfully populated performance data for {len(teams)} teams")

def create_performance_analytics():
    """Create performance analytics data for teams"""
    print("📊 Creating performance analytics...")
    
    with engine.connect() as conn:
        # Get teams with their zones
        result = conn.execute(text("""
            SELECT id, name, zone 
            FROM teams 
            WHERE is_active = true 
            ORDER BY id
        """))
        teams = result.fetchall()
        
        # Group teams by zone
        zones = {}
        for team in teams:
            zone = team[2] or "Unknown Zone"
            if zone not in zones:
                zones[zone] = {
                    "teams": [],
                    "totalTickets": 0,
                    "openTickets": 0,
                    "closedTickets": 0,
                    "productivity": 0.0
                }
            
            # Generate realistic team data
            tickets_completed = random.randint(15, 65)
            open_tickets = random.randint(2, 12)
            closed_tickets = tickets_completed
            productivity = round(random.uniform(4.0, 5.0), 1)
            
            zones[zone]["teams"].append({
                "id": team[0],
                "name": team[1],
                "zone": zone,
                "ticketsCompleted": tickets_completed,
                "openTickets": open_tickets,
                "closedTickets": closed_tickets,
                "productivity": productivity,
                "customerRating": round(random.uniform(4.0, 5.0), 2),
                "responseTime": random.randint(15, 45),
                "completionRate": round(random.uniform(85.0, 100.0), 1),
                "status": random.choice(["available", "busy", "offline"])
            })
            
            zones[zone]["totalTickets"] += open_tickets + closed_tickets
            zones[zone]["openTickets"] += open_tickets
            zones[zone]["closedTickets"] += closed_tickets
            zones[zone]["productivity"] += productivity
        
        # Calculate average productivity for each zone
        for zone_data in zones.values():
            if zone_data["teams"]:
                zone_data["productivity"] = round(zone_data["productivity"] / len(zone_data["teams"]), 1)
                zone_data["activeTeams"] = len(zone_data["teams"])
                zone_data["totalTeams"] = len(zone_data["teams"])
        
        print(f"📈 Created analytics for {len(zones)} zones")
        for zone_name, zone_data in zones.items():
            print(f"  {zone_name}: {zone_data['activeTeams']} teams, {zone_data['totalTickets']} tickets, {zone_data['productivity']} productivity")
        
        return zones

if __name__ == "__main__":
    print("🚀 Starting team performance data population...")
    
    try:
        # Populate team performance data
        populate_team_performance()
        
        # Create performance analytics
        zones_data = create_performance_analytics()
        
        print("✅ Team performance data population completed successfully!")
        print(f"📊 Created data for {len(zones_data)} zones")
        
    except Exception as e:
        print(f"❌ Error populating team performance data: {e}")
        raise

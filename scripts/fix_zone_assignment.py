#!/usr/bin/env python3
"""
Fix Zone Assignment Script
Ensures tickets are assigned to teams from the correct zones and states
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import random
from datetime import datetime, timedelta

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'aiff_db',
    'user': 'aiff',
    'password': 'aiffpass'
}

# Malaysian states and their zones
MALAYSIAN_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
    "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak",
    "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya"
]

def fix_zone_assignment():
    """Fix zone assignment for teams and tickets"""
    
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔧 Fixing zone assignment for teams and tickets...")
        
        # 1. Update teams to have proper Malaysian zones
        print("👥 Updating team zones...")
        cursor.execute("SELECT id, name FROM teams ORDER BY id")
        teams = cursor.fetchall()
        
        for i, team in enumerate(teams):
            # Assign teams to Malaysian states
            assigned_state = MALAYSIAN_STATES[i % len(MALAYSIAN_STATES)]
            
            cursor.execute("""
                UPDATE teams 
                SET zone = %s, updated_at = %s
                WHERE id = %s
            """, (assigned_state, datetime.now(), team['id']))
            
            if i % 50 == 0:
                print(f"   Updated team {i+1}/{len(teams)}: {team['name']} -> {assigned_state}")
        
        # 2. Update tickets to be assigned to teams from the same zone
        print("🎫 Updating ticket assignments...")
        cursor.execute("""
            SELECT t.id, t.zone, t.assigned_team_id, tm.zone as team_zone
            FROM tickets t
            LEFT JOIN teams tm ON t.assigned_team_id = tm.id
            WHERE t.assigned_team_id IS NOT NULL
        """)
        tickets = cursor.fetchall()
        
        reassigned_count = 0
        for ticket in tickets:
            ticket_zone = ticket['zone']
            team_zone = ticket['team_zone']
            
            # If ticket and team are in different zones, reassign to correct team
            if ticket_zone != team_zone:
                # Find a team in the same zone as the ticket
                cursor.execute("""
                    SELECT id FROM teams 
                    WHERE zone = %s AND is_active = true
                    ORDER BY RANDOM()
                    LIMIT 1
                """, (ticket_zone,))
                
                correct_team = cursor.fetchone()
                if correct_team:
                    cursor.execute("""
                        UPDATE tickets 
                        SET assigned_team_id = %s, updated_at = %s
                        WHERE id = %s
                    """, (correct_team['id'], datetime.now(), ticket['id']))
                    reassigned_count += 1
        
        print(f"   Reassigned {reassigned_count} tickets to correct zone teams")
        
        # 3. Ensure ticket status distribution is realistic
        print("📊 Updating ticket status distribution...")
        
        # Get all tickets
        cursor.execute("SELECT id, status FROM tickets")
        all_tickets = cursor.fetchall()
        
        # Define realistic status distribution (using database values)
        status_distribution = {
            'OPEN': 0.30,      # 30% open
            'IN_PROGRESS': 0.20, # 20% in progress
            'COMPLETED': 0.40,  # 40% completed
            'CANCELLED': 0.10   # 10% cancelled
        }
        
        # Update ticket statuses
        for i, ticket in enumerate(all_tickets):
            # Use deterministic random based on ticket ID
            random.seed(ticket['id'])
            rand_val = random.random()
            
            cumulative = 0
            new_status = 'open'  # default
            
            for status, probability in status_distribution.items():
                cumulative += probability
                if rand_val <= cumulative:
                    new_status = status
                    break
            
            # Update status
            cursor.execute("""
                UPDATE tickets 
                SET status = %s, updated_at = %s
                WHERE id = %s
            """, (new_status, datetime.now(), ticket['id']))
            
            # If completed, set completed_at
            if new_status == 'COMPLETED':
                completed_at = datetime.now() - timedelta(hours=random.randint(1, 72))
                cursor.execute("""
                    UPDATE tickets 
                    SET completed_at = %s
                    WHERE id = %s
                """, (completed_at, ticket['id']))
        
        # 4. Update team assignments to ensure proper zone matching
        print("🔄 Updating team assignments...")
        cursor.execute("""
            SELECT t.id, t.zone, t.assigned_team_id, tm.zone as team_zone
            FROM tickets t
            LEFT JOIN teams tm ON t.assigned_team_id = tm.id
            WHERE t.assigned_team_id IS NOT NULL
        """)
        assignments = cursor.fetchall()
        
        for assignment in assignments:
            ticket_zone = assignment['zone']
            team_zone = assignment['team_zone']
            
            # If zones don't match, find correct team
            if ticket_zone != team_zone:
                cursor.execute("""
                    SELECT id FROM teams 
                    WHERE zone = %s AND is_active = true
                    ORDER BY RANDOM()
                    LIMIT 1
                """, (ticket_zone,))
                
                correct_team = cursor.fetchone()
                if correct_team:
                    cursor.execute("""
                        UPDATE tickets 
                        SET assigned_team_id = %s, updated_at = %s
                        WHERE id = %s
                    """, (correct_team['id'], datetime.now(), assignment['id']))
        
        # Commit all changes
        conn.commit()
        
        # 5. Verify the fixes
        print("✅ Verifying fixes...")
        
        # Check team zone distribution
        cursor.execute("""
            SELECT zone, COUNT(*) as team_count
            FROM teams 
            WHERE is_active = true
            GROUP BY zone
            ORDER BY team_count DESC
        """)
        team_zones = cursor.fetchall()
        print("   Team zone distribution:")
        for zone_info in team_zones:
            print(f"     {zone_info['zone']}: {zone_info['team_count']} teams")
        
        # Check ticket-team zone matching
        cursor.execute("""
            SELECT COUNT(*) as total_tickets,
                   COUNT(CASE WHEN t.zone = tm.zone THEN 1 END) as matching_zones
            FROM tickets t
            LEFT JOIN teams tm ON t.assigned_team_id = tm.id
            WHERE t.assigned_team_id IS NOT NULL
        """)
        zone_match = cursor.fetchone()
        match_rate = (zone_match['matching_zones'] / zone_match['total_tickets'] * 100) if zone_match['total_tickets'] > 0 else 0
        print(f"   Zone matching rate: {match_rate:.1f}% ({zone_match['matching_zones']}/{zone_match['total_tickets']})")
        
        # Check status distribution
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM tickets
            GROUP BY status
            ORDER BY count DESC
        """)
        status_dist = cursor.fetchall()
        print("   Ticket status distribution:")
        for status_info in status_dist:
            print(f"     {status_info['status']}: {status_info['count']} tickets")
        
        print("✅ Zone assignment fixes completed successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing zone assignment: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_zone_assignment()

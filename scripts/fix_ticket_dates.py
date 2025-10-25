#!/usr/bin/env python3
"""
Script to fix ticket dates and create realistic field portal data
"""

import psycopg2
import random
import os
from datetime import datetime, timedelta

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'aiff_db',
    'user': 'aiff',
    'password': 'aiffpass'
}

def fix_ticket_dates():
    """Update ticket dates to be realistic and create proper distribution"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("🎫 Fixing ticket dates and creating realistic field portal data...")
        
        # Get all tickets
        cursor.execute("SELECT id, status FROM tickets ORDER BY id")
        tickets = cursor.fetchall()
        
        print(f"📊 Found {len(tickets)} tickets to update")
        
        # Get today's date
        today = datetime.now()
        
        # Create realistic distribution
        # 5 tickets should be open (today)
        # 10 tickets should be in_progress (started today or yesterday)
        # Rest should be completed (historical data from past 30 days)
        
        open_tickets = []
        in_progress_tickets = []
        completed_tickets = []
        
        for ticket_id, status in tickets:
            if status == 'OPEN':
                open_tickets.append(ticket_id)
            elif status == 'IN_PROGRESS':
                in_progress_tickets.append(ticket_id)
            elif status == 'COMPLETED':
                completed_tickets.append(ticket_id)
        
        print(f"📊 Current distribution: {len(open_tickets)} open, {len(in_progress_tickets)} in_progress, {len(completed_tickets)} completed")
        
        # Update open tickets to be today's tickets (only 5)
        open_tickets_to_update = open_tickets[:5]
        for i, ticket_id in enumerate(open_tickets_to_update):
            # Create today's date with random time
            created_date = today.replace(hour=random.randint(8, 17), minute=random.randint(0, 59))
            
            cursor.execute(
                "UPDATE tickets SET created_at = %s, updated_at = %s WHERE id = %s",
                (created_date, created_date, ticket_id)
            )
            print(f"  ✅ Updated open ticket {ticket_id} to today: {created_date}")
        
        # Update remaining open tickets to be completed (historical)
        for ticket_id in open_tickets[5:]:
            # Random date in past 30 days
            days_ago = random.randint(1, 30)
            created_date = today - timedelta(days=days_ago)
            completed_date = created_date + timedelta(hours=random.randint(2, 48))
            
            cursor.execute(
                "UPDATE tickets SET status = 'COMPLETED', created_at = %s, completed_at = %s, updated_at = %s WHERE id = %s",
                (created_date, completed_date, completed_date, ticket_id)
            )
            print(f"  ✅ Converted open ticket {ticket_id} to completed (historical)")
        
        # Update in_progress tickets to be realistic (started today or yesterday)
        for i, ticket_id in enumerate(in_progress_tickets[:10]):
            # Started today or yesterday
            if i < 5:
                started_date = today.replace(hour=random.randint(8, 17), minute=random.randint(0, 59))
            else:
                started_date = (today - timedelta(days=1)).replace(hour=random.randint(8, 17), minute=random.randint(0, 59))
            
            cursor.execute(
                "UPDATE tickets SET created_at = %s, updated_at = %s WHERE id = %s",
                (started_date, started_date, ticket_id)
            )
            print(f"  ✅ Updated in_progress ticket {ticket_id} to started: {started_date}")
        
        # Update remaining in_progress tickets to be completed (historical)
        for ticket_id in in_progress_tickets[10:]:
            days_ago = random.randint(1, 30)
            created_date = today - timedelta(days=days_ago)
            completed_date = created_date + timedelta(hours=random.randint(2, 48))
            
            cursor.execute(
                "UPDATE tickets SET status = 'COMPLETED', created_at = %s, completed_at = %s, updated_at = %s WHERE id = %s",
                (created_date, completed_date, completed_date, ticket_id)
            )
            print(f"  ✅ Converted in_progress ticket {ticket_id} to completed (historical)")
        
        # Update completed tickets to be historical (past 30 days)
        for ticket_id in completed_tickets:
            days_ago = random.randint(1, 30)
            created_date = today - timedelta(days=days_ago)
            completed_date = created_date + timedelta(hours=random.randint(2, 48))
            
            cursor.execute(
                "UPDATE tickets SET created_at = %s, completed_at = %s, updated_at = %s WHERE id = %s",
                (created_date, completed_date, completed_date, ticket_id)
            )
        
        # Commit changes
        conn.commit()
        
        # Get final statistics
        cursor.execute("SELECT status, COUNT(*) FROM tickets GROUP BY status ORDER BY status")
        status_counts = cursor.fetchall()
        
        # Get today's tickets
        cursor.execute("""
            SELECT COUNT(*) FROM tickets 
            WHERE DATE(created_at) = CURRENT_DATE
        """)
        today_count = cursor.fetchone()[0]
        
        print(f"\n✅ Successfully updated ticket dates")
        print(f"📊 Final status distribution:")
        for status, count in status_counts:
            print(f"  - {status}: {count} tickets")
        
        print(f"📅 Today's tickets: {today_count}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Ticket date update completed!")
        
    except Exception as e:
        print(f"❌ Error updating ticket dates: {e}")

if __name__ == "__main__":
    fix_ticket_dates()

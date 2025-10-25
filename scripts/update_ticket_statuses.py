#!/usr/bin/env python3
"""
Script to update ticket statuses to create a realistic mix
"""

import psycopg2
import random
import os

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'aiff_db',
    'user': 'aiff',
    'password': 'aiffpass'
}

def update_ticket_statuses():
    """Update ticket statuses to create a realistic mix"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("🎫 Updating ticket statuses for realistic distribution...")
        
        # Get all tickets
        cursor.execute("SELECT id, created_at FROM tickets ORDER BY id")
        tickets = cursor.fetchall()
        
        print(f"📊 Found {len(tickets)} tickets to update")
        
        # Realistic status distribution
        # 40% completed, 30% in_progress, 25% open, 5% cancelled
        status_distribution = {
            'COMPLETED': 0.40,
            'IN_PROGRESS': 0.30,
            'OPEN': 0.25,
            'CANCELLED': 0.05
        }
        
        # Check current status distribution first
        cursor.execute("SELECT status, COUNT(*) FROM tickets GROUP BY status ORDER BY status")
        current_status = cursor.fetchall()
        print("📊 Current status distribution:")
        for status, count in current_status:
            print(f"  - {status}: {count} tickets")
        
        updated_count = 0
        
        for ticket_id, created_at in tickets:
            # Use ticket ID as seed for consistent results
            random.seed(ticket_id)
            
            # Determine status based on distribution
            rand = random.random()
            cumulative = 0
            
            for status, probability in status_distribution.items():
                cumulative += probability
                if rand <= cumulative:
                    new_status = status
                    break
            else:
                new_status = 'OPEN'  # fallback
            
            # Update ticket status
            cursor.execute(
                "UPDATE tickets SET status = %s WHERE id = %s",
                (new_status, ticket_id)
            )
            
            # If completed, add completion date
            if new_status == 'COMPLETED':
                # Random completion date between creation and now
                import datetime
                created_date = created_at if created_at else datetime.datetime.now() - datetime.timedelta(days=30)
                completion_date = created_date + datetime.timedelta(
                    days=random.randint(1, 30),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
                cursor.execute(
                    "UPDATE tickets SET completed_at = %s WHERE id = %s",
                    (completion_date, ticket_id)
                )
            
            # If in_progress, add started date
            elif new_status == 'IN_PROGRESS':
                import datetime
                started_date = created_at if created_at else datetime.datetime.now() - datetime.timedelta(days=7)
                started_date = started_date + datetime.timedelta(
                    days=random.randint(0, 5),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )
                cursor.execute(
                    "UPDATE tickets SET updated_at = %s WHERE id = %s",
                    (started_date, ticket_id)
                )
            
            updated_count += 1
            
            if updated_count % 100 == 0:
                print(f"  ✅ Updated {updated_count} tickets...")
        
        # Commit changes
        conn.commit()
        
        # Get final statistics
        cursor.execute("SELECT status, COUNT(*) FROM tickets GROUP BY status ORDER BY status")
        status_counts = cursor.fetchall()
        
        print(f"\n✅ Successfully updated {updated_count} tickets")
        print("\n📊 Final status distribution:")
        for status, count in status_counts:
            percentage = (count / updated_count) * 100
            print(f"  - {status}: {count} tickets ({percentage:.1f}%)")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Ticket status update completed!")
        
    except Exception as e:
        print(f"❌ Error updating ticket statuses: {e}")

if __name__ == "__main__":
    update_ticket_statuses()

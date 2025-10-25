#!/usr/bin/env python3
"""
Script to fix ticket format by altering database schema and updating tickets
"""

import psycopg2
import os
import random

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'aiff_db',
    'user': 'aiff',
    'password': 'aiffpass'
}

# Malaysian states
STATES = [
    "Kuala Lumpur", "Selangor", "Penang", "Johor", "Perak", 
    "Kedah", "Kelantan", "Terengganu", "Pahang", "Negeri Sembilan",
    "Melaka", "Sabah", "Sarawak", "Putrajaya", "Perlis"
]

def fix_database_schema():
    """Alter the ticket_number column to allow longer values"""
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("🔧 Altering database schema...")
        
        # Alter the ticket_number column to allow longer values
        cursor.execute("ALTER TABLE tickets ALTER COLUMN ticket_number TYPE VARCHAR(50)")
        
        # Commit changes
        conn.commit()
        print("✅ Database schema updated successfully")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error altering database schema: {e}")

def update_ticket_format():
    """Update existing tickets to use CTT_Num_Zone format"""
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Get all tickets
        cursor.execute("SELECT id, ticket_number, zone FROM tickets ORDER BY id")
        tickets = cursor.fetchall()
        
        print(f"📋 Found {len(tickets)} tickets to update")
        
        updated_count = 0
        for ticket_id, old_ticket_number, zone in tickets:
            # Generate new ticket number
            zone_suffix = zone.replace(' ', '_').replace(',', '').upper() if zone else 'GEN'
            new_ticket_number = f"CTT_{ticket_id:02d}_{zone_suffix}"
            
            # Update the ticket
            cursor.execute(
                "UPDATE tickets SET ticket_number = %s WHERE id = %s",
                (new_ticket_number, ticket_id)
            )
            
            if updated_count < 10:  # Show first 10 updates
                print(f"✅ Updated ticket {ticket_id}: {old_ticket_number} -> {new_ticket_number}")
            elif updated_count == 10:
                print("... (showing first 10 updates)")
            
            updated_count += 1
        
        # Commit changes
        conn.commit()
        print(f"✅ Successfully updated {updated_count} tickets")
        
        # Verify the update
        cursor.execute("SELECT id, ticket_number, zone FROM tickets ORDER BY id LIMIT 10")
        updated_tickets = cursor.fetchall()
        
        print("\n📋 Sample updated tickets:")
        for ticket_id, ticket_number, zone in updated_tickets:
            print(f"  - {ticket_number} ({zone})")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error updating tickets: {e}")

def add_more_tickets():
    """Add more tickets to reach 1000 total"""
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Get current ticket count
        cursor.execute("SELECT COUNT(*) FROM tickets")
        current_count = cursor.fetchone()[0]
        
        print(f"📋 Current ticket count: {current_count}")
        
        # Add tickets to reach 1000
        tickets_to_add = 1000 - current_count
        if tickets_to_add > 0:
            print(f"📋 Adding {tickets_to_add} more tickets...")
            
            # Sample data
            categories = ["network", "customer", "equipment", "maintenance", "installation"]
            priorities = ["low", "medium", "high", "emergency"]
            statuses = ["open", "assigned", "in_progress", "completed", "pending"]
            customer_names = ["Ahmad", "Siti", "Muhammad", "Fatimah", "Ali", "Aisha", "Hassan", "Zainab"]
            
            for i in range(tickets_to_add):
                ticket_id = current_count + i + 1
                state = random.choice(STATES)
                zone_suffix = state.replace(' ', '_').replace(',', '').upper()
                ticket_number = f"CTT_{ticket_id:02d}_{zone_suffix}"
                
                # Generate ticket data
                title = f"Ticket {ticket_id} - {random.choice(['Fiber Installation', 'Equipment Repair', 'Network Maintenance', 'Customer Service'])}"
                description = f"Service request {ticket_id} requiring field team intervention"
                category = random.choice(categories)
                priority = random.choice(priorities)
                status = random.choice(statuses)
                customer_name = random.choice(customer_names)
                location = f"Jalan {state}, {state}"
                
                # Insert ticket
                cursor.execute("""
                    INSERT INTO tickets (
                        ticket_number, title, description, status, priority, category,
                        location, zone, customer_name, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """, (
                    ticket_number, title, description, status, priority, category,
                    location, state, customer_name
                ))
                
                if (i + 1) % 100 == 0:
                    print(f"✅ Added {i + 1} tickets...")
            
            # Commit changes
            conn.commit()
            print(f"✅ Successfully added {tickets_to_add} tickets")
        else:
            print("✅ Already have 1000 tickets")
        
        # Verify final count
        cursor.execute("SELECT COUNT(*) FROM tickets")
        final_count = cursor.fetchone()[0]
        print(f"📋 Final ticket count: {final_count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error adding tickets: {e}")

def main():
    print("🔧 Fixing database schema and ticket format...")
    
    # Step 1: Fix database schema
    fix_database_schema()
    
    # Step 2: Update existing tickets
    print("\n🔄 Updating existing tickets to CTT_Num_Zone format...")
    update_ticket_format()
    
    # Step 3: Add more tickets if needed
    print("\n🔄 Adding more tickets to reach 1000...")
    add_more_tickets()
    
    print("\n✅ Database update complete!")

if __name__ == "__main__":
    main()

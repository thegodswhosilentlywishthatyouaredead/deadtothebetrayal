#!/usr/bin/env python3
"""
Update existing tickets with customer email addresses
"""

import os
import sys
from sqlalchemy import create_engine, text
import random

# Database connection
DATABASE_URL = "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db"
engine = create_engine(DATABASE_URL)

def update_customer_emails():
    print("📧 Updating existing tickets with customer email addresses...")
    
    with engine.connect() as conn:
        # Get all tickets that don't have customer_email
        result = conn.execute(text("""
            SELECT id, customer_name FROM tickets 
            WHERE customer_email IS NULL OR customer_email = ''
        """))
        
        tickets = result.fetchall()
        print(f"Found {len(tickets)} tickets to update")
        
        # Update each ticket with customer email
        for ticket in tickets:
            ticket_id, customer_name = ticket
            customer_email = f"{customer_name.lower()}@example.com"
            
            conn.execute(text("""
                UPDATE tickets 
                SET customer_email = :customer_email 
                WHERE id = :ticket_id
            """), {
                'customer_email': customer_email,
                'ticket_id': ticket_id
            })
        
        conn.commit()
        print("✅ Customer emails updated successfully")

if __name__ == "__main__":
    update_customer_emails()

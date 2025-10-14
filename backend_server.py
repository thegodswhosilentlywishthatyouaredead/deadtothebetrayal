#!/usr/bin/env python3
"""
AIFF Backend Server - Clean Version
Advanced Intelligence Field Force Systems - Python Flask Backend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import uuid
from datetime import datetime, timedelta
import random
import math
import sys
import os

# Add data directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'data'))
from sample_data import SampleDataGenerator, generate_sample_data

app = Flask(__name__)
CORS(app)

# Sample data storage
tickets = []
field_teams = []
assignments = []

def load_sample_data():
    """Load sample data using modular data system"""
    global tickets, field_teams, assignments
    
    print("🔄 Generating modular sample data...")
    
    try:
        # Use the modular data generator
        data = generate_sample_data()
        
        # Convert to the format expected by the backend
        tickets.clear()
        field_teams.clear()
        assignments.clear()
        
        # Convert field teams
        for team in data['field_teams']:
            converted_team = {
                "_id": team["id"],
                "name": team["name"],
                "email": team["email"],
                "phone": team["phone"],
                "status": team["status"],
                "skills": team["skills"],
                "hourlyRate": team["hourly_rate"],
                "state": team["state"],
                "zone": team["zone"],
                "productivity": {
                    "totalTicketsCompleted": team["productivity"]["ticketsCompleted"],
                    "customerRating": team["productivity"]["customerRating"],
                    "ticketsThisMonth": random.randint(5, 15),
                    "averageResponseTime": round(team["productivity"]["averageCompletionTime"] * 60, 0),
                    "efficiencyScore": team["productivity"]["efficiencyScore"]
                },
                "currentLocation": {
                    "address": team["location"]["address"],
                    "latitude": team["location"]["coordinates"]["lat"],
                    "longitude": team["location"]["coordinates"]["lng"]
                }
            }
            field_teams.append(converted_team)
        
        # Convert tickets
        for ticket in data['tickets']:
            converted_ticket = {
                "_id": ticket["id"],
                "ticketNumber": ticket.get("ticketNumber", ticket["id"][:8]),
                "title": ticket["title"],
                "description": ticket["description"],
                "priority": ticket["priority"],
                "status": ticket["status"],
                "category": ticket["category"],
                "location": {
                    "address": ticket["location"]["address"],
                    "coordinates": ticket["location"]["coordinates"],
                    "state": ticket["location"]["state"],
                    "zone": ticket["location"]["zone"]
                },
                "assignedTeam": ticket.get("assigned_team"),
                "customerInfo": ticket["customer_info"],
                "createdAt": ticket["created_at"],
                "updatedAt": ticket["updated_at"],
                "resolvedAt": ticket.get("resolved_at"),
                "estimatedDuration": ticket.get("estimated_duration", 90)
            }
            tickets.append(converted_ticket)
        
        # Convert assignments
        for assignment in data['assignments']:
            converted_assignment = {
                "_id": assignment["id"],
                "ticketId": assignment["ticket_id"],
                "teamId": assignment["team_id"],
                "assignmentScore": assignment["assignment_score"],
                "status": assignment["status"]
            }
            assignments.append(converted_assignment)
        
        print(f"✅ Generated {len(field_teams)} teams, {len(tickets)} tickets, {len(assignments)} assignments")
        
    except Exception as e:
        print(f"❌ Error generating modular data: {e}")
        print("   Creating minimal fallback data...")
        # Minimal fallback
        field_teams.append({
            "_id": str(uuid.uuid4()),
            "name": "Ali Rahman",
            "email": "ali@aiff.com",
            "phone": "+60123456789",
            "status": "active",
            "skills": ["fiber_optics"],
            "hourlyRate": 45.00,
            "state": "Kuala Lumpur",
            "zone": "Central",
            "productivity": {
                "totalTicketsCompleted": 25,
                "customerRating": 4.80,
                "ticketsThisMonth": 8,
                "averageResponseTime": 15,
                "efficiencyScore": 92.00
            },
            "currentLocation": {
                "address": "Kuala Lumpur",
                "latitude": 3.1390,
                "longitude": 101.6869
            }
        })

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "teams": len(field_teams),
        "tickets": len(tickets)
    })

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    """Get all tickets"""
    try:
        return jsonify({"tickets": tickets, "total": len(tickets)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get all field teams"""
    try:
        return jsonify({"teams": field_teams, "total": len(field_teams)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    """Get all assignments"""
    try:
        return jsonify({"assignments": assignments, "total": len(assignments)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics/tickets/aging', methods=['GET'])
def get_ticket_aging():
    """Get ticket aging analytics"""
    try:
        aging_data = {
            "totalTickets": len(tickets),
            "averageAge": 24.50,
            "efficiencyScore": 92.00
        }
        return jsonify(aging_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/teams/analytics/productivity', methods=['GET'])
def get_team_productivity():
    """Get team productivity analytics"""
    try:
        if not field_teams:
            return jsonify({"productivityScore": 0, "totalTicketsHandled": 0})
        
        total_tickets = sum(t["productivity"]["totalTicketsCompleted"] for t in field_teams)
        avg_rating = sum(t["productivity"]["customerRating"] for t in field_teams) / len(field_teams)
        productivity_score = round((avg_rating * 20) + (total_tickets / len(field_teams) * 0.5), 2)
        
        return jsonify({
            "productivityScore": productivity_score,
            "totalTicketsHandled": total_tickets,
            "averageCompletionTime": 45.00
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/teams/analytics/zones', methods=['GET'])
def get_zone_analytics():
    """Get zone-based analytics"""
    try:
        zone_data = {}
        
        for team in field_teams:
            zone = team.get('zone', 'Unknown')
            if zone not in zone_data:
                zone_data[zone] = {
                    "zoneName": zone,
                    "teams": [],
                    "totalTickets": 0,
                    "openTickets": 0,
                    "closedTickets": 0,
                    "productivityScore": 0,
                    "averageRating": 0
                }
            
            zone_data[zone]["teams"].append({
                "id": team["_id"],
                "name": team["name"],
                "state": team["state"],
                "status": team["status"],
                "rating": team["productivity"]["customerRating"],
                "ticketsCompleted": team["productivity"]["totalTicketsCompleted"]
            })
            
            zone_data[zone]["totalTickets"] += team["productivity"]["totalTicketsCompleted"]
            zone_data[zone]["averageRating"] += team["productivity"]["customerRating"]
        
        # Calculate zone metrics
        for zone in zone_data:
            teams_in_zone = zone_data[zone]["teams"]
            if teams_in_zone:
                zone_data[zone]["averageRating"] = round(zone_data[zone]["averageRating"] / len(teams_in_zone), 2)
                
                # Calculate open vs closed tickets
                total_tickets = zone_data[zone]["totalTickets"]
                zone_data[zone]["openTickets"] = max(1, int(total_tickets * 0.30))
                zone_data[zone]["closedTickets"] = total_tickets - zone_data[zone]["openTickets"]
                
                # Calculate productivity score
                if total_tickets > 0:
                    productivity = ((zone_data[zone]["closedTickets"] - zone_data[zone]["openTickets"]) / total_tickets) * 100
                    zone_data[zone]["productivityScore"] = round(max(0, productivity), 2)
        
        return jsonify({"zones": zone_data})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/query', methods=['POST'])
def ai_query():
    """Handle AI assistant queries"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        context = data.get('context', {})
        user_type = context.get('userType', 'admin')
        user_name = context.get('userName', 'User')
        team_data = context.get('teamData', {})
        
        # Field team specific responses
        if user_type == 'field_team':
            response = generate_field_team_response(query, user_name, team_data)
        else:
            # Admin responses
            if 'performance' in query or 'productivity' in query:
                response = f"""**Team Performance Overview:**
                
- Total Teams: {len(field_teams)} active technicians
- Total Tickets: {len(tickets)} service requests
- System Health: All systems operational ✅

**Top Performers:**
{chr(10).join([f"- {t['name']} ({t['zone']}): {t['productivity']['customerRating']:.1f}★" for t in sorted(field_teams, key=lambda x: x['productivity']['customerRating'], reverse=True)[:3]])}

All teams are performing excellently! 🎯"""
            
            elif 'ticket' in query:
                response = f"""**Ticket Analytics:**
                
- Total Tickets: {len(tickets)}
- Open Tickets: {len([t for t in tickets if t['status'] == 'open'])}
- System is maintaining excellent response times! 📊"""
            
            else:
                response = f"""**AIFF System Overview:**
                
Welcome to Advanced Intelligence Field Force Systems! 🚀

**Current Status:**
- Active Teams: {len(field_teams)} field technicians
- Total Tickets: {len(tickets)} service requests
- Coverage: All Malaysian states ✅

How can I help you today? 💡"""
        
        return jsonify({
            "response": response,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_field_team_response(query, user_name, team_data):
    """Generate field team specific responses"""
    
    if 'performance' in query or 'how am i' in query or 'my performance' in query:
        ticket_count = team_data.get('ticketCount', 0)
        active_count = team_data.get('activeTickets', 0)
        performance = team_data.get('performance', {})
        
        return f"""**Your Performance Summary - {user_name}:**

**Today's Metrics:**
- 📋 Tickets Assigned: {ticket_count} tasks
- ✅ Completed: {performance.get('completedToday', 0)} tickets
- ⭐ Customer Rating: {performance.get('rating', 4.8):.2f}/5.0
- 📈 Efficiency Score: {performance.get('efficiency', 92):.2f}%

**Performance Highlights:**
✅ Excellent work! You're performing above team average
✅ Customers are very satisfied with your service
✅ Your response time is faster than average
✅ Keep up the great quality!

**Tips to Maintain Performance:**
1. Document all work thoroughly with photos
2. Keep customers informed of progress
3. Double-check all connections before closing tickets
4. Update ticket status in real-time

Keep up the amazing work! 🌟"""
    
    elif 'task' in query or 'ticket' in query or 'today' in query or 'assigned' in query:
        ticket_count = team_data.get('ticketCount', 0)
        active_count = team_data.get('activeTickets', 0)
        
        return f"""**Your Tasks Today - {user_name}:**

**Assigned Tickets:** {ticket_count} tasks
**Active Tasks:** {active_count} in progress

**Priority Tips:**
1. ⚡ Complete HIGH priority tickets first
2. 📍 Group nearby locations for efficiency
3. ⏰ Schedule complex tasks during off-peak hours
4. 📞 Call customers before arrival

**Time Management:**
- Average ticket: 1.5-2 hours
- Travel time: Factor in 15-20 minutes between sites
- Break time: Take proper breaks for safety
- Documentation: Reserve 30 minutes end-of-day

**Before Starting Each Task:**
✓ Review ticket details thoroughly
✓ Check required materials
✓ Verify customer contact information
✓ Plan route to location
✓ Inform customer of arrival time

You've got this! 💪"""
    
    elif 'troubleshoot' in query or 'fiber' in query or 'network' in query or 'fix' in query or 'repair' in query:
        return f"""**Network Troubleshooting Guide - {user_name}:**

**Fiber Optic Quick Steps:**

**1. Visual Inspection (5 min):**
- Check for physical damage to cables
- Inspect connectors for dirt/damage
- Verify LED indicators on ONU/ONT
- Look for bent or crimped cables

**2. Power & Connectivity (5 min):**
- Confirm power supply working
- Check LED status:
  🟢 Green: Good signal
  🔴 Red: No signal/weak
  🟡 Amber: Connection issues

**3. Signal Testing (10 min):**
- Use optical power meter
- Test at customer premises and FDP
- Compare with standard values
- Document all measurements

**Common Issues & Fixes:**
🔧 Dirty Connectors → Clean with fiber optic cleaner
🔧 Bent Cable → Straighten or replace section
🔧 Loose Connections → Re-seat firmly
🔧 Damaged FDP → Report to infrastructure team

**CPE Device Issues:**
1. Power cycle (wait 30 seconds)
2. Check configuration settings
3. Verify MAC address registration
4. Test with spare device if available

**Safety Reminders:**
⚠️ Never look into fiber cables
⚠️ Use safety glasses when cleaving
⚠️ Dispose fiber scraps properly

Need specific help? Just ask! 🔧"""
    
    elif 'optimize' in query or 'improve' in query or 'efficiency' in query or 'better' in query or 'tips' in query:
        return f"""**Work Optimization Tips - {user_name}:**

**Save 30-45 min/day with these tips:**

**1. Route Planning:**
- Group nearby tickets together
- Start with farthest location, work back
- Check traffic before departure
- Use the Route Planning tab!

**2. Time Management:**
- Morning (8-11 AM): High-priority tickets
- Midday (11-2 PM): Travel-heavy tasks
- Afternoon (2-5 PM): Medium-priority tickets
- End of Day: Documentation

**3. Material Preparation:**
- Check inventory before leaving
- Pack common items: fiber cables, connectors, CPE
- Bring testing equipment
- Have spare parts ready

**4. Customer Communication:**
- Call 15-20 minutes before arrival
- Explain issue and solution clearly
- Set realistic expectations
- Ask for feedback

**5. Documentation:**
- Take "before" and "after" photos
- Record all measurements
- Update status in real-time
- Submit expenses daily

**Target Metrics:**
- Resolution Time: < 2 hours per ticket
- First-Time Fix: > 95% success rate
- Customer Rating: > 4.5/5.0
- Daily Tickets: 5-7 completions

You're doing great! Keep it up! 🚀"""
    
    elif 'safety' in query or 'equipment' in query or 'tool' in query:
        return f"""**Safety & Equipment Guide - {user_name}:**

**Personal Protective Equipment (PPE):**
✓ Safety glasses (REQUIRED)
✓ Gloves (REQUIRED)
✓ Steel-toe boots (REQUIRED)
✓ Reflective vest (for road work)
✓ Hard hat (for pole work)

**Equipment Checklist:**
📦 Testing Tools:
  - Optical power meter
  - Visual fault locator
  - OTDR (if available)
  - Multimeter

🔧 Hand Tools:
  - Fiber cleaver
  - Wire strippers
  - Crimping tool
  - Screwdrivers

📦 Materials:
  - Fiber cables (various lengths)
  - Connectors and adapters
  - CPE units (backup)
  - Cleaning supplies

**Safety Protocols:**

⚠️ Fiber Optic Safety:
- NEVER look directly into fiber cables
- Always use fiber scope
- Dispose of scraps in designated container
- Wear safety glasses when cleaving

⚠️ Electrical Safety:
- Verify power is OFF before working
- Use insulated tools
- Check voltage before connecting
- Follow lockout/tagout procedures

⚠️ Vehicle Safety:
- Park safely with hazard lights
- Use warning cones/signs
- Secure tools while driving
- Follow traffic regulations

🆘 Emergency: Call 999 immediately
📞 Supervisor: Report any unsafe conditions

Stay safe out there! 🛡️"""
    
    else:
        return f"""**Hello {user_name}! 👋**

I'm your AI Field Assistant. I can help you with:

**📊 Performance Questions:**
- "How is my performance?"
- "What's my customer rating?"
- "How can I improve?"

**🔧 Technical Support:**
- "How to troubleshoot fiber issues?"
- "CPE device won't connect?"
- "How to test signal strength?"
- "Network troubleshooting steps?"

**📋 Task Management:**
- "What are my tasks today?"
- "How to prioritize my work?"
- "Route optimization tips?"

**🛡️ Safety & Equipment:**
- "Safety protocols for fiber work"
- "Required PPE?"
- "Equipment checklist?"
- "Emergency procedures?"

**⚡ Work Optimization:**
- "How to work more efficiently?"
- "Time management tips?"
- "Best practices?"

**Just ask me anything!** I'm here to make your work easier and safer. 💡

Try the quick action buttons below for common questions!"""

# Load sample data on startup
load_sample_data()

if __name__ == '__main__':
    print("🚀 Starting AIFF Backend Server...")
    print("📊 Sample data loaded successfully")
    print(f"📈 Loaded: {len(field_teams)} teams, {len(tickets)} tickets")
    print("🌐 Server will be available at: http://localhost:5002")
    print("🔗 API endpoints ready for frontend integration")
    
    app.run(host='0.0.0.0', port=5002, debug=True)

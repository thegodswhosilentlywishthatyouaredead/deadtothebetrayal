#!/usr/bin/env python3
"""
AIFF Backend Server - Clean Version
Advanced Intelligence Field Force Systems - Python Flask Backend
"""

from flask import Flask, jsonify, request, send_from_directory
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

# Static file serving routes
@app.route('/')
def serve_index():
    """Serve the main dashboard"""
    return send_from_directory('client/public', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files from client directory"""
    return send_from_directory('client', filename)

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

@app.route('/api/tickets/analytics/overview', methods=['GET'])
def get_tickets_analytics_overview():
    """Get tickets analytics overview"""
    try:
        # Calculate analytics
        total_tickets = len(tickets)
        resolved_tickets = len([t for t in tickets if t.get('status') in ['resolved', 'closed', 'completed']])
        pending_tickets = len([t for t in tickets if t.get('status') in ['open', 'pending', 'in_progress']])
        critical_tickets = len([t for t in tickets if t.get('priority') == 'high'])
        
        resolution_rate = (resolved_tickets / total_tickets * 100) if total_tickets > 0 else 0
        
        # Calculate average resolution time
        resolved_with_time = [t for t in tickets if t.get('status') in ['resolved', 'closed', 'completed'] and t.get('resolvedAt')]
        if resolved_with_time:
            total_time = 0
            for ticket in resolved_with_time:
                created = datetime.fromisoformat(ticket['createdAt'].replace('Z', '+00:00'))
                resolved = datetime.fromisoformat(ticket['resolvedAt'].replace('Z', '+00:00'))
                total_time += (resolved - created).total_seconds() / 3600  # hours
            avg_resolution_time = total_time / len(resolved_with_time)
        else:
            avg_resolution_time = 0
        
        return jsonify({
            'totalTickets': total_tickets,
            'resolvedTickets': resolved_tickets,
            'pendingTickets': pending_tickets,
            'criticalTickets': critical_tickets,
            'resolutionRate': round(resolution_rate, 2),
            'avgResolutionTime': round(avg_resolution_time, 2),
            'customerSatisfaction': 4.5,  # Mock data
            'autoAssigned': len([t for t in tickets if t.get('assignedBy') == 'AI'])
        })
        
    except Exception as e:
        print(f"Error in tickets analytics overview: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/planning/forecast', methods=['GET'])
def get_planning_forecast():
    """Get predictive planning forecast"""
    try:
        # Mock forecast data
        forecast_data = {
            'totalInventory': 127,
            'aiForecastAccuracy': 89.5,
            'reorderAlerts': 3,
            'activeZones': 6,
            'zoneEfficiency': 87.2,
            'monthlyCost': 12500.00,
            'avgLeadTime': 2.5,
            'stockAvailability': 95.8,
            'materialUsage': {
                'fiber': 45,
                'cpe': 12,
                'connectors': 23,
                'cables': 18
            },
            'criticalAlerts': [
                {'type': 'Low Stock', 'item': 'Fiber Cable', 'quantity': 5, 'priority': 'high'},
                {'type': 'Reorder', 'item': 'CPE Units', 'quantity': 0, 'priority': 'medium'},
                {'type': 'Maintenance', 'item': 'Test Equipment', 'quantity': 2, 'priority': 'low'}
            ]
        }
        
        return jsonify(forecast_data)
        
    except Exception as e:
        print(f"Error in planning forecast: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/planning/zone-materials', methods=['GET'])
def get_zone_materials():
    """Get zone-specific material requirements"""
    try:
        # Mock zone materials data
        zone_materials = {
            'zones': {
                'Central': {
                    'fiberCable': 150,
                    'cpeUnits': 25,
                    'connectors': 45,
                    'cables': 30,
                    'priority': 'high'
                },
                'Northern': {
                    'fiberCable': 80,
                    'cpeUnits': 15,
                    'connectors': 25,
                    'cables': 20,
                    'priority': 'medium'
                },
                'Southern': {
                    'fiberCable': 120,
                    'cpeUnits': 20,
                    'connectors': 35,
                    'cables': 25,
                    'priority': 'high'
                },
                'Eastern': {
                    'fiberCable': 60,
                    'cpeUnits': 12,
                    'connectors': 20,
                    'cables': 15,
                    'priority': 'medium'
                },
                'Sabah': {
                    'fiberCable': 90,
                    'cpeUnits': 18,
                    'connectors': 30,
                    'cables': 22,
                    'priority': 'medium'
                },
                'Sarawak': {
                    'fiberCable': 70,
                    'cpeUnits': 14,
                    'connectors': 25,
                    'cables': 18,
                    'priority': 'medium'
                }
            },
            'totalRequirements': {
                'fiberCable': 570,
                'cpeUnits': 104,
                'connectors': 180,
                'cables': 130
            },
            'lastUpdated': '2024-01-20T10:30:00Z'
        }
        
        return jsonify(zone_materials)
    except Exception as e:
        print(f"Error in zone materials: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/assignments/analytics/performance', methods=['GET'])
def get_assignments_analytics_performance():
    """Get assignments analytics performance"""
    try:
        # Calculate assignment performance metrics
        total_assignments = len(assignments)
        completed_assignments = len([a for a in assignments if a.get('status') == 'completed'])
        in_progress_assignments = len([a for a in assignments if a.get('status') == 'in_progress'])
        pending_assignments = len([a for a in assignments if a.get('status') == 'pending'])
        
        completion_rate = (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0
        
        # Calculate average completion time
        completed_with_time = [a for a in assignments if a.get('status') == 'completed' and a.get('completedAt')]
        if completed_with_time:
            total_time = 0
            for assignment in completed_with_time:
                created = datetime.fromisoformat(assignment['createdAt'].replace('Z', '+00:00'))
                completed = datetime.fromisoformat(assignment['completedAt'].replace('Z', '+00:00'))
                total_time += (completed - created).total_seconds() / 3600  # hours
            avg_completion_time = total_time / len(completed_with_time)
        else:
            avg_completion_time = 0
        
        return jsonify({
            'totalAssignments': total_assignments,
            'completedAssignments': completed_assignments,
            'inProgressAssignments': in_progress_assignments,
            'pendingAssignments': pending_assignments,
            'completionRate': round(completion_rate, 2),
            'avgCompletionTime': round(avg_completion_time, 2),
            'efficiencyScore': 85.5,  # Mock data
            'teamUtilization': 78.3   # Mock data
        })
        
    except Exception as e:
        print(f"Error in assignments analytics performance: {e}")
        return jsonify({'error': 'Internal server error'}), 500

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

@app.route('/api/ticketv2/analytics/performance', methods=['GET'])
def get_ticketv2_performance_analytics():
    """Get comprehensive ticketv2 performance analytics with weekly trends and projections"""
    try:
        from collections import defaultdict
        
        # Calculate weekly data for the past 12 weeks
        now = datetime.now()
        weeks_data = []
        
        for week_offset in range(-11, 1):  # Past 11 weeks + current week = 12 weeks
            week_start = now + timedelta(weeks=week_offset)
            week_end = week_start + timedelta(days=7)
            
            # Filter tickets for this week
            week_tickets = [t for t in tickets if week_start <= datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00')) < week_end]
            
            # Count by status
            status_counts = {
                'open': len([t for t in week_tickets if t['status'] in ['open', 'pending']]),
                'in_progress': len([t for t in week_tickets if t['status'] == 'in_progress']),
                'completed': len([t for t in week_tickets if t['status'] in ['completed', 'resolved', 'closed']]),
                'cancelled': len([t for t in week_tickets if t['status'] == 'cancelled'])
            }
            
            weeks_data.append({
                'week': week_start.strftime('%Y-W%W'),
                'week_label': week_start.strftime('%b %d'),
                'total': len(week_tickets),
                'statuses': status_counts
            })
        
        # Project 4 future weeks based on linear regression
        if len(weeks_data) >= 4:
            # Calculate average growth rate
            recent_totals = [w['total'] for w in weeks_data[-4:]]
            avg_total = sum(recent_totals) / len(recent_totals)
            growth_rate = (recent_totals[-1] - recent_totals[0]) / max(recent_totals[0], 1)
            
            # Project future weeks
            projections = []
            for week_offset in range(1, 5):  # 4 future weeks
                future_week = now + timedelta(weeks=week_offset)
                projected_total = int(avg_total * (1 + growth_rate * week_offset))
                
                # Distribute by status based on current distribution
                total_current = sum([w['total'] for w in weeks_data[-4:]])
                if total_current > 0:
                    open_ratio = sum([w['statuses']['open'] for w in weeks_data[-4:]]) / total_current
                    in_progress_ratio = sum([w['statuses']['in_progress'] for w in weeks_data[-4:]]) / total_current
                    completed_ratio = sum([w['statuses']['completed'] for w in weeks_data[-4:]]) / total_current
                    cancelled_ratio = sum([w['statuses']['cancelled'] for w in weeks_data[-4:]]) / total_current
                else:
                    open_ratio = in_progress_ratio = completed_ratio = cancelled_ratio = 0.25
                
                projections.append({
                    'week': future_week.strftime('%Y-W%W'),
                    'week_label': future_week.strftime('%b %d'),
                    'total': projected_total,
                    'statuses': {
                        'open': int(projected_total * open_ratio),
                        'in_progress': int(projected_total * in_progress_ratio),
                        'completed': int(projected_total * completed_ratio),
                        'cancelled': int(projected_total * cancelled_ratio)
                    },
                    'is_projection': True
                })
        else:
            projections = []
        
        # Status distribution (all time)
        all_status_distribution = {
            'open': len([t for t in tickets if t['status'] in ['open', 'pending']]),
            'in_progress': len([t for t in tickets if t['status'] == 'in_progress']),
            'completed': len([t for t in tickets if t['status'] in ['completed', 'resolved', 'closed']]),
            'cancelled': len([t for t in tickets if t['status'] == 'cancelled'])
        }
        
        # High-level performance metrics by week
        performance_weeks = []
        for week_offset in range(-11, 1):
            week_start = now + timedelta(weeks=week_offset)
            week_end = week_start + timedelta(days=7)
            
            week_tickets = [t for t in tickets if week_start <= datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00')) < week_end]
            completed_tickets = [t for t in week_tickets if t['status'] in ['completed', 'resolved', 'closed']]
            
            # Calculate metrics
            total_tickets = len(week_tickets)
            completed_count = len(completed_tickets)
            productivity = (completed_count / total_tickets * 100) if total_tickets > 0 else 0
            
            # Availability: % of tickets assigned to teams
            assigned_count = len([t for t in week_tickets if t.get('assignedTeam')])
            availability = (assigned_count / total_tickets * 100) if total_tickets > 0 else 0
            
            # Efficiency: % completed within SLA (assume 24 hours)
            efficient_count = 0
            for t in completed_tickets:
                if t.get('resolvedAt'):
                    created = datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00'))
                    resolved = datetime.fromisoformat(t['resolvedAt'].replace('Z', '+00:00'))
                    hours_diff = (resolved - created).total_seconds() / 3600
                    if hours_diff <= 24:
                        efficient_count += 1
            
            efficiency = (efficient_count / completed_count * 100) if completed_count > 0 else 0
            
            performance_weeks.append({
                'week': week_start.strftime('%Y-W%W'),
                'week_label': week_start.strftime('%b %d'),
                'productivity': round(productivity, 2),
                'availability': round(availability, 2),
                'efficiency': round(efficiency, 2)
            })
        
        # States breakdown by week
        states_weekly_data = defaultdict(lambda: [])
        malaysian_states = ['Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
                           'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
                           'Selangor', 'Terengganu', 'Kuala Lumpur', 'Putrajaya']
        
        for state in malaysian_states:
            for week_offset in range(-11, 1):
                week_start = now + timedelta(weeks=week_offset)
                week_end = week_start + timedelta(days=7)
                
                state_tickets = [t for t in tickets if 
                               t.get('location', {}).get('state') == state and
                               week_start <= datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00')) < week_end]
                
                open_tickets = len([t for t in state_tickets if t['status'] in ['open', 'pending', 'in_progress']])
                completed_tickets = len([t for t in state_tickets if t['status'] in ['completed', 'resolved', 'closed']])
                
                states_weekly_data[state].append({
                    'week': week_start.strftime('%Y-W%W'),
                    'week_label': week_start.strftime('%b %d'),
                    'open': open_tickets,
                    'completed': completed_tickets,
                    'total': len(state_tickets)
                })
        
        # States performance metrics (overall)
        states_performance = []
        for state in malaysian_states:
            state_tickets = [t for t in tickets if t.get('location', {}).get('state') == state]
            state_teams = [team for team in field_teams if team.get('state') == state]
            
            total_tickets = len(state_tickets)
            completed_count = len([t for t in state_tickets if t['status'] in ['completed', 'resolved', 'closed']])
            
            # Productivity: completion rate
            productivity = (completed_count / total_tickets * 100) if total_tickets > 0 else 0
            
            # Availability: team availability
            active_teams = len([team for team in state_teams if team.get('status') == 'active'])
            availability = (active_teams / len(state_teams) * 100) if len(state_teams) > 0 else 0
            
            # Efficiency: average team efficiency in state
            if state_teams:
                avg_efficiency = sum([team.get('productivity', {}).get('efficiencyScore', 0) for team in state_teams]) / len(state_teams)
            else:
                avg_efficiency = 0
            
            states_performance.append({
                'state': state,
                'productivity': round(productivity, 2),
                'availability': round(availability, 2),
                'efficiency': round(avg_efficiency, 2),
                'total_tickets': total_tickets,
                'completed_tickets': completed_count
            })
        
        # AI Recommendations
        total_tickets = len(tickets)
        completed_rate = (len([t for t in tickets if t['status'] in ['completed', 'resolved', 'closed']]) / total_tickets * 100) if total_tickets > 0 else 0
        
        # Identify states needing attention
        low_performing_states = [s for s in states_performance if s['productivity'] < 60]
        high_performing_states = [s for s in states_performance if s['productivity'] >= 80]
        
        recommendations = []
        
        if low_performing_states:
            recommendations.append({
                'type': 'warning',
                'category': 'State Performance',
                'title': f'Low Productivity in {len(low_performing_states)} States',
                'description': f"States {', '.join([s['state'] for s in low_performing_states[:3]])} need additional team support. Consider reallocating resources.",
                'action': 'Increase team capacity in underperforming states'
            })
        
        if high_performing_states:
            recommendations.append({
                'type': 'success',
                'category': 'Best Practices',
                'title': f'{len(high_performing_states)} States Exceeding Targets',
                'description': f"States {', '.join([s['state'] for s in high_performing_states[:3]])} are performing excellently. Study their workflows for best practices.",
                'action': 'Share best practices across all states'
            })
        
        # Projection recommendations
        if projections and len(projections) > 0:
            projected_growth = ((projections[-1]['total'] - weeks_data[-1]['total']) / max(weeks_data[-1]['total'], 1) * 100)
            if projected_growth > 20:
                recommendations.append({
                    'type': 'info',
                    'category': 'Future Planning',
                    'title': f'Expected {abs(projected_growth):.1f}% Increase in Tickets',
                    'description': f'Projected {projections[-1]["total"]} tickets in 4 weeks. Plan to add {int(projections[-1]["total"] / 5)} more team members.',
                    'action': f'Recruit and train {int(projections[-1]["total"] / 5)} additional field technicians'
                })
            elif projected_growth < -20:
                recommendations.append({
                    'type': 'info',
                    'category': 'Resource Optimization',
                    'title': f'Expected {abs(projected_growth):.1f}% Decrease in Tickets',
                    'description': 'Ticket volume is projected to decrease. Consider cross-training teams for other tasks.',
                    'action': 'Optimize team allocation and consider preventive maintenance programs'
                })
        
        # Efficiency recommendations
        avg_efficiency = sum([w['efficiency'] for w in performance_weeks]) / len(performance_weeks)
        if avg_efficiency < 70:
            recommendations.append({
                'type': 'warning',
                'category': 'Efficiency',
                'title': 'SLA Compliance Below Target',
                'description': f'Average efficiency is {avg_efficiency:.1f}%. Focus on reducing resolution times.',
                'action': 'Implement faster routing algorithms and better resource planning'
            })
        
        return jsonify({
            'success': True,
            'weekly_trends': weeks_data,
            'projections': projections,
            'status_distribution': all_status_distribution,
            'performance_metrics': performance_weeks,
            'states_weekly': dict(states_weekly_data),
            'states_performance': states_performance,
            'recommendations': recommendations,
            'summary': {
                'total_tickets': total_tickets,
                'completion_rate': round(completed_rate, 2),
                'active_teams': len([t for t in field_teams if t.get('status') == 'active']),
                'avg_efficiency': round(avg_efficiency, 2),
                'projected_growth': round(projected_growth, 2) if projections else 0
            }
        })
        
    except Exception as e:
        print(f"Error in ticketv2 performance analytics: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Load sample data on startup
load_sample_data()

if __name__ == '__main__':
    print("🚀 Starting AIFF Backend Server...")
    print("📊 Sample data loaded successfully")
    print(f"📈 Loaded: {len(field_teams)} teams, {len(tickets)} tickets")
    print("🌐 Server will be available at: http://localhost:5002")
    print("🔗 API endpoints ready for frontend integration")
    print("📁 Static files served from client directory")
    
    app.run(host='0.0.0.0', port=5002, debug=True)

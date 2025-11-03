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

# Try to import enhanced generator, fallback to sample if not available
try:
    from enhanced_data_generator import EnhancedDataGenerator, generate_enhanced_dataset
    ENHANCED_AVAILABLE = True
    print("✅ Enhanced data generator available")
except ImportError:
    ENHANCED_AVAILABLE = False
    print("⚠️  Enhanced data generator not available, using sample data only")

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

def load_enhanced_data():
    """Load and merge enhanced dataset (15,000 tickets) with existing data"""
    global tickets, field_teams, assignments
    
    if not ENHANCED_AVAILABLE:
        print("⚠️  Enhanced data generator not available")
        return
    
    print("\n🚀 Loading enhanced dataset (15,000 tickets)...")
    print("=" * 60)
    
    try:
        # CLEAR OLD DATA before regenerating for fresh today's data
        print("🗑️  Clearing old ticket data to ensure fresh generation...")
        tickets.clear()
        field_teams.clear()
        assignments.clear()
        
        # Generate enhanced data (fresh generation)
        enhanced_data = generate_enhanced_dataset(num_tickets=15000, num_teams=150)
        
        # Add all teams (fresh generation after clear)
        new_teams_added = 0
        for team in enhanced_data['field_teams']:
            converted_team = {
                    "_id": team["id"],
                    "teamNumber": team.get("teamNumber", f"T{len(field_teams) + 1:04d}"),
                    "name": team["name"],
                    "email": team["email"],
                    "phone": team["phone"],
                    "state": team["state"],
                    "zone": team["zone"],
                    "district": team.get("district", team["state"]),
                    "currentLocation": {
                        "address": team["location"]["address"],
                        "latitude": team["location"]["coordinates"]["lat"],
                        "longitude": team["location"]["coordinates"]["lng"]
                    },
                    "availability": team.get("availability", {
                        "status": "available",
                        "currentCapacity": 0,
                        "maxDailyCapacity": 5,
                        "todayAssigned": 0,
                        "availableSlots": 5
                    }),
                    "productivity": {
                        "totalTicketsCompleted": team["productivity"]["ticketsCompleted"],
                        "ticketsThisMonth": team["productivity"].get("ticketsThisMonth", 0),
                        "averageResponseTime": team["productivity"].get("responseTime", 100),
                        "customerRating": team["productivity"]["customerRating"],
                        "efficiencyScore": team["productivity"]["efficiencyScore"],
                        "averageCompletionTime": team["productivity"]["averageCompletionTime"]
                    },
                    "skills": team.get("skills", []),
                    "status": team.get("status", "active"),
                    "hourlyRate": team.get("hourlyRate", 45.00),
                    "currentTickets": team.get("currentTickets", [])
                }
                field_teams.append(converted_team)
                new_teams_added += 1
        
        print(f"✅ Added {new_teams_added} new teams (total: {len(field_teams)})")
        
        # Add all tickets (fresh generation after clear)
        new_tickets_added = 0
        for ticket in enhanced_data['tickets']:
            converted_ticket = {
                    "_id": ticket["id"],
                    "ticketNumber": ticket["ticketNumber"],
                    "title": ticket["title"],
                    "description": ticket["description"],
                    "category": ticket["category"],
                    "priority": ticket["priority"],
                    "status": ticket["status"],  # 4 states: open, in_progress, closed, cancelled
                    
                    # Enhanced location
                    "location": {
                        "address": ticket["location"]["address"],
                        "coordinates": {
                            "lat": ticket["location"]["coordinates"]["lat"],
                            "lng": ticket["location"]["coordinates"]["lng"]
                        },
                        "state": ticket["location"]["state"],
                        "zone": ticket["location"]["zone"],
                        "district": ticket["location"]["district"],
                        "postalCode": ticket["location"].get("postalCode", "")
                    },
                    
                    # Timing fields
                    "createdAt": ticket["createdAt"],
                    "updatedAt": ticket["updatedAt"],
                    "startedAt": ticket.get("startedAt"),
                    "completedAt": ticket.get("completedAt"),
                    "cancelledAt": ticket.get("cancelledAt"),
                    
                    # Aging
                    "agingDays": ticket["agingDays"],
                    "agingHours": ticket["agingHours"],
                    
                    # SLA and completion metrics
                    "sla": ticket.get("sla", {}),
                    
                    # Customer info
                    "customerInfo": ticket["customerInfo"],
                    
                    # Assignment
                    "assignedTeam": ticket.get("assignedTeam"),
                    "assignmentScore": ticket.get("assignmentScore"),
                    "assignmentReason": ticket.get("assignmentReason"),
                    
                    # Durations
                    "estimatedDuration": ticket["estimatedDuration"],
                    "actualDuration": ticket.get("actualDuration"),
                    
                    # Efficiency
                    "efficiencyScore": ticket.get("efficiencyScore")
                }
            tickets.append(converted_ticket)
            new_tickets_added += 1
        
        print(f"✅ Added {new_tickets_added} new tickets (total: {len(tickets)})")
        
        # Add new assignments (merge with existing)
        new_assignments_added = 0
        for assignment in enhanced_data['assignments']:
            converted_assignment = {
                "_id": assignment["id"],
                "ticketId": assignment["ticketId"],
                "teamId": assignment["teamId"],
                "teamNumber": assignment.get("teamNumber"),
                "teamName": assignment.get("teamName"),
                "assignmentScore": assignment["assignmentScore"],
                "assignmentReason": assignment["assignmentReason"],
                "status": assignment["status"],
                "assignedAt": assignment["assignedAt"],
                "startedAt": assignment.get("startedAt"),
                "completedAt": assignment.get("completedAt"),
                "location": assignment.get("location", {}),
                "metrics": assignment.get("metrics", {})
            }
            assignments.append(converted_assignment)
            new_assignments_added += 1
        
        print(f"✅ Added {new_assignments_added} new assignments (total: {len(assignments)})")
        
        print("=" * 60)
        print("✅ Enhanced data loaded and merged successfully!")
        print(f"📊 Final totals: {len(field_teams)} teams, {len(tickets)} tickets, {len(assignments)} assignments")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error loading enhanced data: {e}")
        import traceback
        traceback.print_exc()

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

@app.route('/api/ticketv2', methods=['GET'])
def get_tickets_v2():
    """Get all tickets (v2 API with limit and offset support for pagination)"""
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)
        
        # Get total count before pagination
        total_count = len(tickets)
        
        # Apply offset and limit for pagination
        if limit:
            start_idx = offset
            end_idx = offset + limit
            result_tickets = tickets[start_idx:end_idx]
        else:
            result_tickets = tickets
        
        return jsonify({
            "tickets": result_tickets, 
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "count": len(result_tickets)
        })
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

@app.route('/api/teams/analytics/performance', methods=['GET'])
def get_teams_performance_analytics():
    """Get comprehensive field teams performance analytics with weekly trends and projections"""
    try:
        from collections import defaultdict
        
        # Calculate weekly team activity data for the past 12 weeks
        now = datetime.now()
        weeks_data = []
        
        for week_offset in range(-11, 1):  # Past 11 weeks + current week = 12 weeks
            week_start = now + timedelta(weeks=week_offset)
            week_end = week_start + timedelta(days=7)
            
            # Filter teams by their activity in this week (checking if they completed tickets)
            week_tickets = [t for t in tickets if week_start <= datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00')) < week_end]
            
            # Count teams by activity status
            active_teams = set()
            for ticket in week_tickets:
                if ticket.get('assignedTeam'):
                    active_teams.add(ticket['assignedTeam'])
            
            total_active = len(active_teams)
            total_inactive = len(field_teams) - total_active
            
            weeks_data.append({
                'week': week_start.strftime('%Y-W%W'),
                'week_label': week_start.strftime('%b %d'),
                'total': len(field_teams),
                'active': total_active,
                'inactive': total_inactive,
                'busy': int(total_active * 0.7) if total_active > 0 else 0,
                'idle': total_inactive
            })
        
        # Project 4 future weeks
        if len(weeks_data) >= 4:
            recent_active = [w['active'] for w in weeks_data[-4:]]
            avg_active = sum(recent_active) / len(recent_active)
            growth_rate = (recent_active[-1] - recent_active[0]) / max(recent_active[0], 1)
            
            projections = []
            for week_offset in range(1, 5):
                future_week = now + timedelta(weeks=week_offset)
                projected_active = int(avg_active * (1 + growth_rate * week_offset))
                projected_active = min(projected_active, len(field_teams))
                
                projections.append({
                    'week': future_week.strftime('%Y-W%W'),
                    'week_label': future_week.strftime('%b %d'),
                    'total': len(field_teams),
                    'active': projected_active,
                    'inactive': len(field_teams) - projected_active,
                    'busy': int(projected_active * 0.7),
                    'idle': len(field_teams) - projected_active,
                    'is_projection': True
                })
        else:
            projections = []
        
        # Activity distribution (all time)
        active_teams_count = len([t for t in field_teams if t.get('status') in ['active', 'available', 'busy']])
        inactive_teams_count = len([t for t in field_teams if t.get('status') not in ['active', 'available', 'busy']])
        
        activity_distribution = {
            'active': active_teams_count,
            'inactive': inactive_teams_count,
            'busy': int(active_teams_count * 0.6),
            'idle': int(active_teams_count * 0.4)
        }
        
        # Performance metrics by week
        performance_weeks = []
        for week_offset in range(-11, 1):
            week_start = now + timedelta(weeks=week_offset)
            week_end = week_start + timedelta(days=7)
            
            week_tickets = [t for t in tickets if week_start <= datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00')) < week_end]
            
            # Calculate average team performance for this week
            active_team_ids = set([t.get('assignedTeam') for t in week_tickets if t.get('assignedTeam')])
            active_teams_data = [t for t in field_teams if t['_id'] in active_team_ids]
            
            if active_teams_data:
                avg_productivity = sum([t.get('productivity', {}).get('totalTicketsCompleted', 0) for t in active_teams_data]) / len(active_teams_data)
                avg_availability = len(active_teams_data) / len(field_teams) * 100
                avg_efficiency = sum([t.get('productivity', {}).get('efficiencyScore', 0) for t in active_teams_data]) / len(active_teams_data)
            else:
                avg_productivity = 0
                avg_availability = 0
                avg_efficiency = 0
            
            performance_weeks.append({
                'week': week_start.strftime('%Y-W%W'),
                'week_label': week_start.strftime('%b %d'),
                'productivity': round(avg_productivity, 2),
                'availability': round(avg_availability, 2),
                'efficiency': round(avg_efficiency, 2)
            })
        
        # States weekly activity data
        states_weekly_data = defaultdict(lambda: {'weeks': []})
        states = set([t['state'] for t in field_teams if 'state' in t])
        
        for state in states:
            state_teams = [t for t in field_teams if t.get('state') == state]
            for week_offset in range(-11, 1):
                week_start = now + timedelta(weeks=week_offset)
                week_end = week_start + timedelta(days=7)
                
                week_tickets = [t for t in tickets if week_start <= datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00')) < week_end]
                
                active_in_week = set([t.get('assignedTeam') for t in week_tickets if t.get('assignedTeam') and any(team['_id'] == t.get('assignedTeam') and team.get('state') == state for team in state_teams)])
                
                states_weekly_data[state]['weeks'].append({
                    'week': week_start.strftime('%b %d'),
                    'active': len(active_in_week),
                    'inactive': len(state_teams) - len(active_in_week)
                })
        
        # States performance breakdown
        states_performance = []
        for state in states:
            state_teams_list = [t for t in field_teams if t.get('state') == state]
            if state_teams_list:
                avg_productivity = sum([t.get('productivity', {}).get('totalTicketsCompleted', 0) for t in state_teams_list]) / len(state_teams_list)
                avg_availability = len([t for t in state_teams_list if t.get('status') in ['active', 'available', 'busy']]) / len(state_teams_list) * 100
                avg_efficiency = sum([t.get('productivity', {}).get('efficiencyScore', 0) for t in state_teams_list]) / len(state_teams_list)
            else:
                avg_productivity = avg_availability = avg_efficiency = 0
            
            states_performance.append({
                'state': state,
                'productivity': round(avg_productivity, 2),
                'availability': round(avg_availability, 2),
                'efficiency': round(avg_efficiency, 2)
            })
        
        # AI Recommendations
        recommendations = []
        avg_prod = sum([t.get('productivity', {}).get('totalTicketsCompleted', 0) for t in field_teams]) / len(field_teams) if field_teams else 0
        avg_eff = sum([t.get('productivity', {}).get('efficiencyScore', 0) for t in field_teams]) / len(field_teams) if field_teams else 0
        
        if avg_prod < 10:
            recommendations.append({
                'type': 'warning',
                'category': 'Productivity',
                'title': 'Low Team Productivity Detected',
                'description': f'Average team productivity is {avg_prod:.1f} tickets. Consider additional training.',
                'action': 'Provide skill enhancement workshops'
            })
        
        if avg_eff < 70:
            recommendations.append({
                'type': 'warning',
                'category': 'Efficiency',
                'title': 'Efficiency Below Target',
                'description': f'Average efficiency is {avg_eff:.1f}%. Optimize team workflows.',
                'action': 'Review and improve operational processes'
            })
        
        if len(recommendations) == 0:
            recommendations.append({
                'type': 'success',
                'category': 'Performance',
                'title': 'Teams Performing Well',
                'description': 'All teams are meeting performance targets.',
                'action': 'Continue current strategies'
            })
        
        # Summary
        total_teams = len(field_teams)
        avg_rating = sum([t.get('productivity', {}).get('customerRating', 0) for t in field_teams]) / len(field_teams) if field_teams else 0
        projected_growth = (projections[-1]['active'] - weeks_data[-1]['active']) / max(weeks_data[-1]['active'], 1) * 100 if projections else 0
        
        return jsonify({
            'success': True,
            'weekly_trends': weeks_data,
            'projections': projections,
            'activity_distribution': activity_distribution,
            'performance_metrics': performance_weeks,
            'states_weekly': dict(states_weekly_data),
            'states_performance': states_performance,
            'recommendations': recommendations,
            'summary': {
                'total_teams': total_teams,
                'avg_productivity': round(avg_prod, 2),
                'avg_rating': round(avg_rating, 2),
                'active_teams': active_teams_count,
                'projected_growth': round(projected_growth, 2)
            }
        })
    
    except Exception as e:
        print(f"❌ Error in teams performance analytics: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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
                'open': status_counts['open'],
                'in_progress': status_counts['in_progress'],
                'completed': status_counts['completed'],
                'cancelled': status_counts['cancelled']
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
                    open_ratio = sum([w['open'] for w in weeks_data[-4:]]) / total_current
                    in_progress_ratio = sum([w['in_progress'] for w in weeks_data[-4:]]) / total_current
                    completed_ratio = sum([w['completed'] for w in weeks_data[-4:]]) / total_current
                    cancelled_ratio = sum([w['cancelled'] for w in weeks_data[-4:]]) / total_current
                else:
                    open_ratio = in_progress_ratio = completed_ratio = cancelled_ratio = 0.25
                
                projections.append({
                    'week': future_week.strftime('%Y-W%W'),
                    'week_label': future_week.strftime('%b %d'),
                    'total': projected_total,
                    'open': int(projected_total * open_ratio),
                    'in_progress': int(projected_total * in_progress_ratio),
                    'completed': int(projected_total * completed_ratio),
                    'cancelled': int(projected_total * cancelled_ratio),
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
                # Check both resolvedAt and completedAt fields
                resolved_time = t.get('resolvedAt') or t.get('completedAt')
                if resolved_time:
                    try:
                        created = datetime.fromisoformat(t['createdAt'].replace('Z', '+00:00'))
                        resolved = datetime.fromisoformat(resolved_time.replace('Z', '+00:00'))
                        hours_diff = (resolved - created).total_seconds() / 3600
                        if hours_diff <= 24:
                            efficient_count += 1
                    except Exception as e:
                        # Skip tickets with invalid dates
                        continue
            
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

# ============================================================================
# ADDITIONAL API ENDPOINTS - Planning, Live Tracking, CRUD Operations
# ============================================================================

@app.route('/api/planning/inventory', methods=['GET'])
def get_planning_inventory():
    """Get inventory planning data"""
    try:
        # Generate inventory data from tickets
        inventory = {
            'totalItems': 45,
            'lowStockItems': 8,
            'criticalItems': 3,
            'categories': [
                {'name': 'Fiber Cables', 'stock': 234, 'threshold': 100, 'status': 'good'},
                {'name': 'ONUs', 'stock': 89, 'threshold': 50, 'status': 'good'},
                {'name': 'Splitters', 'stock': 45, 'threshold': 50, 'status': 'low'},
                {'name': 'Connectors', 'stock': 567, 'threshold': 200, 'status': 'good'},
                {'name': 'Tools', 'stock': 23, 'threshold': 30, 'status': 'low'}
            ]
        }
        return jsonify(inventory)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/planning/reorder-alerts', methods=['GET'])
def get_reorder_alerts():
    """Get reorder alerts for inventory"""
    try:
        alerts = {
            'total': 3,
            'alerts': [
                {
                    'id': 'alert_001',
                    'item': 'Splitters',
                    'currentStock': 45,
                    'threshold': 50,
                    'recommendedOrder': 100,
                    'priority': 'medium',
                    'estimatedDepletion': '7 days'
                },
                {
                    'id': 'alert_002',
                    'item': 'Tools',
                    'currentStock': 23,
                    'threshold': 30,
                    'recommendedOrder': 50,
                    'priority': 'high',
                    'estimatedDepletion': '3 days'
                },
                {
                    'id': 'alert_003',
                    'item': 'Patch Cords',
                    'currentStock': 89,
                    'threshold': 100,
                    'recommendedOrder': 200,
                    'priority': 'low',
                    'estimatedDepletion': '14 days'
                }
            ]
        }
        return jsonify(alerts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/live-tracking/teams', methods=['GET'])
def get_live_tracking_teams():
    """Get real-time team locations"""
    try:
        tracking_data = []
        for team in field_teams:
            tracking_data.append({
                'teamId': team['_id'],
                'teamName': team['name'],
                'location': team.get('currentLocation', {}),
                'status': team.get('status', 'active'),
                'currentTask': team.get('currentTask', None),
                'lastUpdate': datetime.now().isoformat()
            })
        return jsonify({'teams': tracking_data, 'total': len(tracking_data)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/live-tracking/tickets', methods=['GET'])
def get_live_tracking_tickets():
    """Get real-time ticket status"""
    try:
        active_tickets = [t for t in tickets if t.get('status') in ['pending', 'in_progress']]
        return jsonify({'tickets': active_tickets, 'total': len(active_tickets)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/live-tracking/routes', methods=['GET'])
def get_live_tracking_routes():
    """Get optimized routes for teams"""
    try:
        routes = []
        for team in field_teams:
            team_tickets = [t for t in tickets if t.get('assignedTeam') == team['_id'] and t.get('status') == 'in_progress']
            if team_tickets:
                routes.append({
                    'teamId': team['_id'],
                    'teamName': team['name'],
                    'currentLocation': team.get('currentLocation', {}),
                    'stops': [
                        {
                            'ticketId': t['_id'],
                            'location': t.get('location', {}),
                            'estimatedArrival': (datetime.now() + timedelta(minutes=30)).isoformat()
                        } for t in team_tickets[:3]  # Next 3 stops
                    ]
                })
        return jsonify({'routes': routes, 'total': len(routes)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets/<ticket_id>', methods=['GET'])
def get_ticket_by_id(ticket_id):
    """Get a specific ticket by ID"""
    try:
        ticket = next((t for t in tickets if t['_id'] == ticket_id), None)
        if ticket:
            return jsonify({'ticket': ticket})
        return jsonify({'error': 'Ticket not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    """Create a new ticket"""
    try:
        data = request.get_json()
        new_ticket = {
            '_id': f"ticket_{uuid.uuid4().hex[:8]}",
            'ticketNumber': f"TT_{len(tickets) + 1:03d}",
            'title': data.get('title'),
            'description': data.get('description'),
            'category': data.get('category'),
            'priority': data.get('priority', 'medium'),
            'status': 'pending',
            'location': data.get('location'),
            'customerInfo': data.get('customerInfo'),
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat(),
            'estimatedDuration': data.get('estimatedDuration', 60)
        }
        tickets.append(new_ticket)
        return jsonify({'ticket': new_ticket, 'message': 'Ticket created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets/<ticket_id>/assign', methods=['POST'])
def assign_ticket(ticket_id):
    """Assign a ticket to a team"""
    try:
        data = request.get_json()
        team_id = data.get('teamId')
        
        ticket = next((t for t in tickets if t['_id'] == ticket_id), None)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
            
        team = next((t for t in field_teams if t['_id'] == team_id), None)
        if not team:
            return jsonify({'error': 'Team not found'}), 404
        
        ticket['assignedTeam'] = team_id
        ticket['status'] = 'assigned'
        ticket['updatedAt'] = datetime.now().isoformat()
        
        # Create assignment
        assignment = {
            '_id': f"assign_{uuid.uuid4().hex[:8]}",
            'ticketId': ticket_id,
            'teamId': team_id,
            'assignedAt': datetime.now().isoformat(),
            'status': 'assigned'
        }
        assignments.append(assignment)
        
        return jsonify({'ticket': ticket, 'assignment': assignment, 'message': 'Ticket assigned successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tickets/<ticket_id>/auto-assign', methods=['POST'])
def auto_assign_ticket(ticket_id):
    """Auto-assign a ticket to the best available team"""
    try:
        ticket = next((t for t in tickets if t['_id'] == ticket_id), None)
        if not ticket:
            return jsonify({'error': 'Ticket not found'}), 404
        
        # Simple auto-assignment logic: find closest available team
        available_teams = [t for t in field_teams if t.get('status') == 'active']
        if not available_teams:
            return jsonify({'error': 'No available teams'}), 400
        
        # For now, just assign to first available team (can be enhanced with geo logic)
        best_team = available_teams[0]
        
        ticket['assignedTeam'] = best_team['_id']
        ticket['status'] = 'assigned'
        ticket['updatedAt'] = datetime.now().isoformat()
        
        assignment = {
            '_id': f"assign_{uuid.uuid4().hex[:8]}",
            'ticketId': ticket_id,
            'teamId': best_team['_id'],
            'assignedAt': datetime.now().isoformat(),
            'status': 'assigned',
            'autoAssigned': True
        }
        assignments.append(assignment)
        
        return jsonify({
            'ticket': ticket,
            'assignment': assignment,
            'team': best_team,
            'message': 'Ticket auto-assigned successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assignments/<assignment_id>/status', methods=['PATCH'])
def update_assignment_status(assignment_id):
    """Update assignment status"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        assignment = next((a for a in assignments if a['_id'] == assignment_id), None)
        if not assignment:
            return jsonify({'error': 'Assignment not found'}), 404
        
        assignment['status'] = new_status
        assignment['updatedAt'] = datetime.now().isoformat()
        
        # Update related ticket status
        ticket = next((t for t in tickets if t['_id'] == assignment['ticketId']), None)
        if ticket:
            if new_status == 'completed':
                ticket['status'] = 'resolved'
                ticket['resolvedAt'] = datetime.now().isoformat()
            elif new_status == 'in_progress':
                ticket['status'] = 'in_progress'
            ticket['updatedAt'] = datetime.now().isoformat()
        
        return jsonify({'assignment': assignment, 'message': 'Assignment status updated'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams', methods=['POST'])
def create_team():
    """Create a new field team"""
    try:
        data = request.get_json()
        new_team = {
            '_id': f"team_{uuid.uuid4().hex[:8]}",
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'skills': data.get('skills', []),
            'currentLocation': data.get('currentLocation', {}),
            'status': 'active',
            'productivity': {
                'totalTicketsCompleted': 0,
                'ticketsThisMonth': 0,
                'averageResponseTime': 0,
                'customerRating': 0,
                'efficiencyScore': 0
            },
            'createdAt': datetime.now().isoformat()
        }
        field_teams.append(new_team)
        return jsonify({'team': new_team, 'message': 'Team created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Handle AI chat messages"""
    try:
        data = request.get_json()
        message = data.get('message', '').lower()
        
        # Simple AI chat responses
        if 'ticket' in message:
            response = f"You currently have {len(tickets)} tickets. {len([t for t in tickets if t.get('status') == 'pending'])} are pending assignment."
        elif 'team' in message:
            response = f"There are {len(field_teams)} field teams available. {len([t for t in field_teams if t.get('status') == 'active'])} are currently active."
        elif 'help' in message:
            response = "I can help you with ticket management, team assignments, analytics, and planning. What would you like to know?"
        else:
            response = "I'm here to help! You can ask me about tickets, teams, performance, or any other aspect of the field force management system."
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'context': {
                'totalTickets': len(tickets),
                'totalTeams': len(field_teams),
                'pendingTickets': len([t for t in tickets if t.get('status') == 'pending'])
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Load sample data on startup
load_sample_data()

# Load enhanced data (15,000 tickets) - adds to existing data
if ENHANCED_AVAILABLE:
    load_enhanced_data()

if __name__ == '__main__':
    print("\n🚀 Starting AIFF Backend Server...")
    print("📊 Data loaded successfully")
    print(f"📈 Total: {len(field_teams)} teams, {len(tickets)} tickets, {len(assignments)} assignments")
    print("🌐 Server will be available at: http://localhost:5002")
    print("🔗 API endpoints ready for frontend integration")
    print("📁 Static files served from client directory")
    
    app.run(host='0.0.0.0', port=5002, debug=True)

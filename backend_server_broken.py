#!/usr/bin/env python3
"""
Simple Python backend server for FieldAssign dashboard
Provides API endpoints for full functionality
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

def generate_sample_data_new():
    """Generate sample data using modular data system"""
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
                },
                "current_tickets": team["current_tickets"],
                "max_concurrent_tickets": team["max_concurrent_tickets"],
                "certifications": team.get("certifications", []),
                "equipment": team.get("equipment", {}),
                "preferences": team.get("preferences", {}),
                "notes": team.get("notes", ""),
                "created_at": team["created_at"],
                "last_active": team["last_active"],
                "last_login": team["last_login"]
            }
            field_teams.append(converted_team)
        
        # Convert tickets
        for ticket in data['tickets']:
            converted_ticket = {
                "_id": ticket["id"],
                "title": ticket["title"],
                "description": ticket["description"],
                "priority": ticket["priority"],
                "status": ticket["status"],
                "category": ticket["category"],
                "location": {
                    "address": ticket["location"]["address"],
                    "coordinates": ticket["location"]["coordinates"],
                    "state": ticket["location"]["state"],
                    "zone": ticket["location"]["zone"],
                    "postal_code": ticket["location"].get("postal_code", ""),
                    "landmark": ticket["location"].get("landmark", "")
                },
                "assignedTeam": ticket.get("assigned_team"),
                "customerInfo": ticket["customer_info"],
                "createdAt": ticket["created_at"],
                "updatedAt": ticket["updated_at"],
                "resolvedAt": ticket.get("resolved_at"),
                "estimatedDuration": ticket["estimated_duration"],
                "actualDuration": ticket.get("actual_duration"),
                "notes": ticket["notes"],
                "attachments": ticket["attachments"],
                "tags": ticket["tags"]
            }
            tickets.append(converted_ticket)
        
        # Convert assignments
        for assignment in data['assignments']:
            converted_assignment = {
                "_id": assignment["id"],
                "ticketId": assignment["ticket_id"],
                "teamId": assignment["team_id"],
                "assignmentScore": assignment["assignment_score"],
                "assignmentReason": assignment["assignment_reason"],
                "status": assignment["status"],
                "createdAt": assignment["created_at"],
                "assignedAt": assignment["assigned_at"],
                "startedAt": assignment.get("started_at"),
                "completedAt": assignment.get("completed_at"),
                "notes": assignment["notes"],
                "feedback": assignment.get("feedback", {}),
                "travelTime": assignment["travel_time"],
                "actualDuration": assignment.get("actual_duration")
            }
            assignments.append(converted_assignment)
        
        print(f"✅ Generated {len(field_teams)} teams, {len(tickets)} tickets, {len(assignments)} assignments")
        
    except Exception as e:
        print(f"❌ Error generating modular data: {e}")
        print("🔄 Falling back to legacy sample data...")
        generate_sample_data_old()

def generate_sample_data_old():
    """Generate sample data for demonstration (legacy method)"""
    global tickets, field_teams, assignments
    
    # Sample field teams
    field_teams.extend([
        {
            "_id": str(uuid.uuid4()),
            "name": "Zamri",
            "email": "zamri@company.com",
            "phone": "555-0101",
            "status": "active",
            "skills": ["network", "customer"],
            "hourlyRate": 180.00,
            "state": "Kuala Lumpur",
            "zone": "Central",
            "productivity": {
                "totalTicketsCompleted": 156,
                "customerRating": 4.8,
                "ticketsThisMonth": 23,
                "averageResponseTime": 15,
                "efficiencyScore": 92
            },
            "currentLocation": {
                "address": "Jalan Ampang, Kuala Lumpur City Centre, 50450 KL",
                "latitude": 3.1390,
                "longitude": 101.6869
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Nurul",
            "email": "nurul@company.com",
            "phone": "555-0102",
            "status": "busy",
            "skills": ["network", "customer"],
            "hourlyRate": 168.00,
            "state": "Perak",
            "zone": "Northern",
            "productivity": {
                "totalTicketsCompleted": 134,
                "customerRating": 4.6,
                "ticketsThisMonth": 18,
                "averageResponseTime": 22,
                "efficiencyScore": 87
            },
            "currentLocation": {
                "address": "Jalan Sultan Idris Shah, Ipoh, 30000 Perak",
                "latitude": 4.5841,
                "longitude": 101.0829
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Ah-Hock",
            "email": "ah-hock@company.com",
            "phone": "555-0103",
            "status": "active",
            "skills": ["customer", "network"],
            "hourlyRate": 192.00,
            "state": "Selangor",
            "zone": "Central",
            "productivity": {
                "totalTicketsCompleted": 189,
                "customerRating": 4.9,
                "ticketsThisMonth": 28,
                "averageResponseTime": 12,
                "efficiencyScore": 95
            },
            "currentLocation": {
                "address": "Jalan Sultan Ismail, Chow Kit, 50350 KL",
                "latitude": 3.1650,
                "longitude": 101.7000
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Muthu",
            "email": "muthu@company.com",
            "phone": "555-0104",
            "status": "offline",
            "skills": ["network", "customer"],
            "hourlyRate": 176.00,
            "state": "Johor",
            "zone": "Southern",
            "productivity": {
                "totalTicketsCompleted": 142,
                "customerRating": 4.7,
                "ticketsThisMonth": 16,
                "averageResponseTime": 18,
                "efficiencyScore": 89
            },
            "currentLocation": {
                "address": "Jalan Tun Abdul Razak, Johor Bahru, 80000 Johor",
                "latitude": 1.4927,
                "longitude": 103.7414
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Siti",
            "email": "siti@company.com",
            "phone": "555-0105",
            "status": "active",
            "skills": ["network", "customer"],
            "hourlyRate": 172.00,
            "state": "Penang",
            "zone": "Northern",
            "productivity": {
                "totalTicketsCompleted": 167,
                "customerRating": 4.8,
                "ticketsThisMonth": 21,
                "averageResponseTime": 14,
                "efficiencyScore": 91
            },
            "currentLocation": {
                "address": "Jalan Penang, George Town, 10000 Penang",
                "latitude": 5.4164,
                "longitude": 100.3327
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Ravi",
            "email": "ravi@company.com",
            "phone": "555-0106",
            "status": "busy",
            "skills": ["customer", "network"],
            "hourlyRate": 184.00,
            "state": "Sabah",
            "zone": "East Malaysia",
            "productivity": {
                "totalTicketsCompleted": 123,
                "customerRating": 4.5,
                "ticketsThisMonth": 14,
                "averageResponseTime": 25,
                "efficiencyScore": 85
            },
            "currentLocation": {
                "address": "Jalan Lintas, Kota Kinabalu, 88300 Sabah",
                "latitude": 5.9804,
                "longitude": 116.0735
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Ahmad",
            "email": "ahmad@company.com",
            "phone": "555-0107",
            "status": "active",
            "skills": ["network", "customer"],
            "hourlyRate": 188.00,
            "state": "Sarawak",
            "zone": "East Malaysia",
            "productivity": {
                "totalTicketsCompleted": 145,
                "customerRating": 4.7,
                "ticketsThisMonth": 19,
                "averageResponseTime": 20,
                "efficiencyScore": 88
            },
            "currentLocation": {
                "address": "Jalan Tabuan, Kuching, 93000 Sarawak",
                "latitude": 1.5533,
                "longitude": 110.3593
            }
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Lim",
            "email": "lim@company.com",
            "phone": "555-0108",
            "status": "active",
            "skills": ["customer", "network"],
            "hourlyRate": 180.00,
            "state": "Melaka",
            "zone": "Southern",
            "productivity": {
                "totalTicketsCompleted": 178,
                "customerRating": 4.9,
                "ticketsThisMonth": 25,
                "averageResponseTime": 13,
                "efficiencyScore": 93
            },
            "currentLocation": {
                "address": "Jalan Hang Tuah, Melaka, 75300 Melaka",
                "latitude": 2.1896,
                "longitude": 102.2501
            }
        }
    ])
    
    # Sample tickets
    tickets.extend([
        {
            "_id": str(uuid.uuid4()),
            "ticketNumber": "TK-001",
            "title": "Network Breakdown - NTT Class 1 (Major)",
            "description": "Complete network infrastructure failure - NTT Class 1 major breakdown affecting all customer services and network connectivity",
            "priority": "emergency",
            "status": "open",
            "category": "network",
            "customer": {
                "name": "Ali",
                "email": "ali@company.com",
                "phone": "555-0123"
            },
            "location": {
                "address": "Jalan Ampang, Kuala Lumpur City Centre, 50450 KL",
                "latitude": 3.1390,
                "longitude": 101.6869
            },
            "estimatedDuration": 240,
            "createdAt": datetime.now().isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "ticketNumber": "TK-002",
            "title": "Network Breakdown - NTT Class 2 (Intermediate)",
            "description": "Intermediate network infrastructure issues - NTT Class 2 breakdown affecting multiple customer services and network segments",
            "priority": "high",
            "status": "assigned",
            "category": "network",
            "customer": {
                "name": "Muthu",
                "email": "muthu@company.com",
                "phone": "555-0124"
            },
            "location": {
                "address": "Jalan Bukit Bintang, Bukit Bintang, 55100 KL",
                "latitude": 3.1490,
                "longitude": 101.7000
            },
            "estimatedDuration": 120,
            "createdAt": (datetime.now() - timedelta(hours=1)).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "ticketNumber": "TK-003",
            "title": "Customer - Drop Fiber",
            "description": "Customer drop fiber connection failure - fiber optic cable damage or termination issues requiring immediate field repair",
            "priority": "high",
            "status": "in-progress",
            "category": "customer",
            "customer": {
                "name": "Ah-Hock",
                "email": "ah-hock@company.com",
                "phone": "555-0125"
            },
            "location": {
                "address": "Jalan Sultan Ismail, Chow Kit, 50350 KL",
                "latitude": 3.1650,
                "longitude": 101.7000
            },
            "estimatedDuration": 90,
            "createdAt": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "ticketNumber": "TK-004",
            "title": "Customer - CPE",
            "description": "Customer Premises Equipment (CPE) troubleshooting - router, modem, or network equipment configuration and connectivity issues",
            "priority": "medium",
            "status": "assigned",
            "category": "customer",
            "customer": {
                "name": "Nurul",
                "email": "nurul@company.com",
                "phone": "555-0126"
            },
            "location": {
                "address": "Jalan Tun Razak, Mont Kiara, 50480 KL",
                "latitude": 3.1700,
                "longitude": 101.6500
            },
            "estimatedDuration": 60,
            "createdAt": (datetime.now() - timedelta(hours=3)).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "ticketNumber": "TK-005",
            "title": "Customer - FDP Breakdown",
            "description": "Fiber Distribution Point (FDP) equipment failure - distribution cabinet or fiber optic splitter issues affecting multiple customer connections",
            "priority": "high",
            "status": "open",
            "category": "customer",
            "customer": {
                "name": "Ali",
                "email": "ali@company.com",
                "phone": "555-0127"
            },
            "location": {
                "address": "Jalan Pudu, Pudu, 55100 KL",
                "latitude": 3.1400,
                "longitude": 101.7100
            },
            "estimatedDuration": 150,
            "createdAt": (datetime.now() - timedelta(minutes=30)).isoformat()
        },
        {
            "_id": str(uuid.uuid4()),
            "ticketNumber": "TK-006",
            "title": "Network Breakdown - NTT (Minor)",
            "description": "Minor network infrastructure issues - NTT minor breakdown with localized impact on specific network segments or customer services",
            "priority": "low",
            "status": "completed",
            "category": "network",
            "customer": {
                "name": "Muthu",
                "email": "muthu@company.com",
                "phone": "555-0128"
            },
            "location": {
                "address": "Jalan Klang Lama, Old Klang Road, 58000 KL",
                "latitude": 3.0900,
                "longitude": 101.6800
            },
            "estimatedDuration": 45,
            "createdAt": (datetime.now() - timedelta(days=1)).isoformat()
        }
    ])

# Initialize sample data
generate_sample_data()

def calculate_ticket_aging(tickets, now):
    """Calculate ticket aging metrics and efficiency"""
    aging_data = {
        "averageAge": 0,
        "oldestTicket": 0,
        "efficiencyScore": 0,
        "agingBreakdown": {
            "under1Hour": 0,
            "1to4Hours": 0,
            "4to24Hours": 0,
            "over24Hours": 0
        }
    }
    
    if not tickets:
        return aging_data
    
    total_age_minutes = 0
    oldest_age_minutes = 0
    
    for ticket in tickets:
        if ticket["status"] != "completed":
            created_at = datetime.fromisoformat(ticket["createdAt"].replace('Z', '+00:00'))
            age_minutes = (now - created_at).total_seconds() / 60
            total_age_minutes += age_minutes
            oldest_age_minutes = max(oldest_age_minutes, age_minutes)
            
            # Categorize by age
            if age_minutes < 60:
                aging_data["agingBreakdown"]["under1Hour"] += 1
            elif age_minutes < 240:  # 4 hours
                aging_data["agingBreakdown"]["1to4Hours"] += 1
            elif age_minutes < 1440:  # 24 hours
                aging_data["agingBreakdown"]["4to24Hours"] += 1
            else:
                aging_data["agingBreakdown"]["over24Hours"] += 1
    
    active_tickets = len([t for t in tickets if t["status"] != "completed"])
    if active_tickets > 0:
        aging_data["averageAge"] = round(total_age_minutes / active_tickets, 2)
        aging_data["oldestTicket"] = round(oldest_age_minutes, 2)
        
        # Calculate efficiency score (0-100)
        # Lower average age = higher efficiency
        target_avg_age = 120  # 2 hours target
        if aging_data["averageAge"] <= target_avg_age:
            aging_data["efficiencyScore"] = 100
        else:
            aging_data["efficiencyScore"] = max(0, 100 - ((aging_data["averageAge"] - target_avg_age) / target_avg_age * 50))
    
    return aging_data

def calculate_team_productivity():
    """Calculate team productivity metrics"""
    productivity_data = {
        "totalTicketsHandled": 0,
        "averageCompletionTime": 0,
        "productivityScore": 0,
        "teamEfficiency": []
    }
    
    if not field_teams:
        return productivity_data
    
    total_completion_time = 0
    total_tickets = 0
    
    for team in field_teams:
        team_tickets = team["productivity"]["totalTicketsCompleted"]
        team_rating = team["productivity"]["customerRating"]
        
        # Calculate team efficiency score
        efficiency_score = (team_tickets * 0.3) + (team_rating * 20)  # Weighted score
        
        productivity_data["teamEfficiency"].append({
            "teamId": team["_id"],
            "teamName": team["name"],
            "ticketsHandled": team_tickets,
            "rating": team_rating,
            "efficiencyScore": round(efficiency_score, 2),
            "status": team["status"]
        })
        
        total_tickets += team_tickets
        total_completion_time += 45  # Average completion time assumption
    
    productivity_data["totalTicketsHandled"] = total_tickets
    if len(field_teams) > 0:
        productivity_data["averageCompletionTime"] = round(total_completion_time / len(field_teams), 2)
        
        # Calculate overall productivity score
        avg_rating = sum(t["productivity"]["customerRating"] for t in field_teams) / len(field_teams)
        avg_tickets = sum(t["productivity"]["totalTicketsCompleted"] for t in field_teams) / len(field_teams)
        productivity_data["productivityScore"] = round((avg_rating * 20) + (avg_tickets * 0.5), 2)
    
    return productivity_data

def calculate_team_efficiency_score(team):
    """Calculate efficiency score for a team member"""
    tickets_completed = team["productivity"]["totalTicketsCompleted"]
    rating = team["productivity"]["customerRating"]
    return round((tickets_completed * 0.3) + (rating * 20), 2)

def is_today(date_string):
    """Check if date string is today"""
    if not date_string:
        return False
    try:
        date_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        return date_obj.date() == datetime.now().date()
    except:
        return False

def is_this_week(date_string):
    """Check if date string is this week"""
    if not date_string:
        return False
    try:
        date_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        now = datetime.now()
        week_start = now - timedelta(days=now.weekday())
        week_end = week_start + timedelta(days=6)
        return week_start.date() <= date_obj.date() <= week_end.date()
    except:
        return False

def is_this_month(date_string):
    """Check if date string is this month"""
    if not date_string:
        return False
    try:
        date_obj = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        now = datetime.now()
        return date_obj.month == now.month and date_obj.year == now.year
    except:
        return False

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "environment": "development"
    })

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    limit = request.args.get('limit', type=int)
    tickets_data = tickets[:limit] if limit else tickets
    return jsonify({"tickets": tickets_data})

@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    data = request.json
    ticket = {
        "_id": str(uuid.uuid4()),
        "ticketNumber": f"TK-{len(tickets) + 1:03d}",
        "title": data.get('title'),
        "description": data.get('description'),
        "priority": data.get('priority'),
        "status": "open",
        "category": data.get('category'),
        "customer": data.get('customer'),
        "location": data.get('location'),
        "estimatedDuration": data.get('estimatedDuration', 60),
        "createdAt": datetime.now().isoformat()
    }
    tickets.append(ticket)
    return jsonify(ticket), 201

@app.route('/api/tickets/<ticket_id>/auto-assign', methods=['POST'])
def auto_assign_ticket(ticket_id):
    # Find the ticket
    ticket = next((t for t in tickets if t["_id"] == ticket_id), None)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    # Find best available team member
    available_teams = [t for t in field_teams if t["status"] == "active"]
    if not available_teams:
        return jsonify({"error": "No available team members"}), 400
    
    # Simple assignment logic - assign to first available team with matching skills
    assigned_team = None
    for team in available_teams:
        if ticket["category"] in team["skills"]:
            assigned_team = team
            break
    
    if not assigned_team:
        assigned_team = available_teams[0]  # Assign to any available team
    
    # Update ticket status
    ticket["status"] = "assigned"
    ticket["assignedTo"] = assigned_team["_id"]
    
    # Create assignment
    assignment = {
        "_id": str(uuid.uuid4()),
        "ticket": ticket,
        "fieldTeam": assigned_team,
        "status": "assigned",
        "assignmentType": "auto",
        "assignmentScore": random.uniform(0.7, 0.95),
        "assignedAt": datetime.now().isoformat(),
        "estimatedArrivalTime": (datetime.now() + timedelta(minutes=30)).isoformat()
    }
    assignments.append(assignment)
    
    return jsonify({
        "message": "Ticket assigned successfully",
        "assignment": assignment
    })

@app.route('/api/field-teams', methods=['GET'])
def get_field_teams():
    return jsonify({"fieldTeams": field_teams})

@app.route('/api/field-teams', methods=['POST'])
def create_field_team():
    data = request.json
    team = {
        "_id": str(uuid.uuid4()),
        "name": data.get('name'),
        "email": data.get('email'),
        "phone": data.get('phone'),
        "status": "active",
        "skills": data.get('skills', []),
        "hourlyRate": data.get('hourlyRate'),
        "productivity": {
            "totalTicketsCompleted": 0,
            "customerRating": 5.0
        },
        "currentLocation": data.get('currentLocation'),
        "createdAt": datetime.now().isoformat()
    }
    field_teams.append(team)
    return jsonify(team), 201

@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    return jsonify({"assignments": assignments})

@app.route('/api/assignments/<assignment_id>/status', methods=['PATCH'])
def update_assignment_status(assignment_id):
    data = request.json
    assignment = next((a for a in assignments if a["_id"] == assignment_id), None)
    if not assignment:
        return jsonify({"error": "Assignment not found"}), 404
    
    assignment["status"] = data.get("status")
    if data.get("status") == "completed":
        assignment["completedAt"] = datetime.now().isoformat()
    
    return jsonify(assignment)

@app.route('/api/tickets/analytics/overview', methods=['GET'])
def get_tickets_analytics():
    total_tickets = len(tickets)
    completed_tickets = len([t for t in tickets if t["status"] == "completed"])
    open_tickets = len([t for t in tickets if t["status"] == "open"])
    in_progress_tickets = len([t for t in tickets if t["status"] == "in-progress"])
    assigned_tickets = len([t for t in tickets if t["status"] == "assigned"])
    
    # Calculate ticket aging metrics
    now = datetime.now()
    aging_metrics = calculate_ticket_aging(tickets, now)
    
    # Category breakdown
    categories = {}
    for ticket in tickets:
        cat = ticket["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    category_breakdown = [{"_id": cat, "count": count} for cat, count in categories.items()]
    
    return jsonify({
        "totalTickets": total_tickets,
        "completedTickets": completed_tickets,
        "openTickets": open_tickets,
        "inProgressTickets": in_progress_tickets,
        "assignedTickets": assigned_tickets,
        "categoryBreakdown": category_breakdown,
        "agingMetrics": aging_metrics
    })

@app.route('/api/assignments/analytics/overview', methods=['GET'])
def get_assignments_analytics():
    total_assignments = len(assignments)
    completed_assignments = len([a for a in assignments if a["status"] == "completed"])
    
    # Calculate average rating and completion time
    completed_with_rating = [a for a in assignments if a["status"] == "completed" and "performance" in a]
    average_rating = 4.5  # Default value
    average_completion_time = 45  # Default value in minutes
    
    if completed_with_rating:
        ratings = [a.get("performance", {}).get("customerRating", 4.5) for a in completed_with_rating]
        average_rating = sum(ratings) / len(ratings)
        
        completion_times = [a.get("performance", {}).get("completionTime", 45) for a in completed_with_rating]
        average_completion_time = sum(completion_times) / len(completion_times)
    
    return jsonify({
        "totalAssignments": total_assignments,
        "completedAssignments": completed_assignments,
        "averageRating": average_rating,
        "averageCompletionTime": average_completion_time
    })

@app.route('/api/assignments/analytics/performance', methods=['GET'])
def get_performance_analytics():
    total_assignments = len(assignments)
    completed_assignments = len([a for a in assignments if a["status"] == "completed"])
    
    # Calculate metrics
    average_rating = 4.5
    average_completion_time = 45
    
    return jsonify({
        "totalAssignments": total_assignments,
        "completedAssignments": completed_assignments,
        "averageRating": average_rating,
        "averageCompletionTime": average_completion_time
    })

@app.route('/api/teams/analytics/productivity', methods=['GET'])
def get_team_productivity():
    """Get detailed team productivity analytics"""
    productivity_data = calculate_team_productivity()
    return jsonify(productivity_data)

@app.route('/api/field-team/<team_id>/tickets', methods=['GET'])
def get_team_tickets(team_id):
    """Get tickets assigned to a specific field team member"""
    team_tickets = [ticket for ticket in tickets if ticket.get('assignedTo') == team_id]
    return jsonify({"tickets": team_tickets})

@app.route('/api/field-team/<team_id>/performance', methods=['GET'])
def get_team_performance(team_id):
    """Get performance data for a specific field team member"""
    team = next((t for t in field_teams if t["_id"] == team_id), None)
    if not team:
        return jsonify({"error": "Team member not found"}), 404
    
    # Get team's tickets
    team_tickets = [ticket for ticket in tickets if ticket.get('assignedTo') == team_id]
    completed_tickets = [ticket for ticket in team_tickets if ticket["status"] == "completed"]
    
    # Calculate performance metrics
    performance_data = {
        "teamInfo": {
            "name": team["name"],
            "skills": team["skills"],
            "hourlyRate": team["hourlyRate"]
        },
        "tickets": {
            "total": len(team_tickets),
            "completed": len(completed_tickets),
            "inProgress": len([t for t in team_tickets if t["status"] == "in-progress"]),
            "assigned": len([t for t in team_tickets if t["status"] == "assigned"])
        },
        "performance": {
            "averageRating": team["productivity"]["customerRating"],
            "totalTicketsCompleted": team["productivity"]["totalTicketsCompleted"],
            "averageCompletionTime": 45,  # minutes
            "efficiencyScore": calculate_team_efficiency_score(team)
        },
        "earnings": {
            "today": len([t for t in completed_tickets if is_today(t.get('completedAt', ''))]) * team["hourlyRate"] * 0.5,
            "thisWeek": len([t for t in completed_tickets if is_this_week(t.get('completedAt', ''))]) * team["hourlyRate"] * 0.5,
            "thisMonth": len([t for t in completed_tickets if is_this_month(t.get('completedAt', ''))]) * team["hourlyRate"] * 0.5
        }
    }
    
    return jsonify(performance_data)

@app.route('/api/field-team/<team_id>/expenses', methods=['GET'])
def get_team_expenses(team_id):
    """Get expenses for a specific field team member"""
    # Sample expense data
    expenses = [
        {
            "id": "1",
            "type": "fuel",
            "amount": 45.20,
            "description": "Gas station fill-up",
            "date": datetime.now().isoformat(),
            "receipt": None
        },
        {
            "id": "2",
            "type": "materials",
            "amount": 28.50,
            "description": "Hardware store - electrical supplies",
            "date": (datetime.now() - timedelta(days=1)).isoformat(),
            "receipt": None
        },
        {
            "id": "3",
            "type": "meals",
            "amount": 12.75,
            "description": "Lunch during work",
            "date": (datetime.now() - timedelta(days=1)).isoformat(),
            "receipt": None
        }
    ]
    
    return jsonify({"expenses": expenses})

@app.route('/api/field-team/<team_id>/expenses', methods=['POST'])
def add_team_expense(team_id):
    """Add a new expense for a field team member"""
    data = request.json
    
    expense = {
        "id": str(uuid.uuid4()),
        "teamId": team_id,
        "type": data.get('type'),
        "amount": data.get('amount'),
        "description": data.get('description'),
        "date": datetime.now().isoformat(),
        "receipt": data.get('receipt')
    }
    
    # In real app, this would be saved to database
    return jsonify(expense), 201

@app.route('/api/field-team/<team_id>/route', methods=['GET'])
def get_team_route(team_id):
    """Get optimized route for a field team member's assigned tickets"""
    team_tickets = [ticket for ticket in tickets if ticket.get('assignedTo') == team_id and ticket["status"] in ['assigned', 'in-progress']]
    
    # Simple route optimization (in real app, would use proper routing algorithm)
    route_data = {
        "tickets": team_tickets,
        "totalDistance": len(team_tickets) * 2.5,  # km
        "estimatedTime": sum(ticket.get('estimatedDuration', 60) for ticket in team_tickets),  # minutes
        "optimizedOrder": team_tickets  # Would be optimized in real app
    }
    
    return jsonify(route_data)

@app.route('/api/teams/analytics/zones', methods=['GET'])
def get_zone_analytics():
    """Get team analytics by zones and states with ticket status tracking"""
    try:
        # Group teams by zones
        zones = {}
        for team in field_teams:
            zone = team.get('zone', 'Unknown')
            state = team.get('state', 'Unknown')
            
            if zone not in zones:
                zones[zone] = {
                    "zoneName": zone,
                    "states": {},
                    "totalTeams": 0,
                    "activeTeams": 0,
                    "totalTickets": 0,
                    "openTickets": 0,
                    "closedTickets": 0,
                    "productivityScore": 0,
                    "averageRating": 0,
                    "averageEfficiency": 0
                }
            
            if state not in zones[zone]["states"]:
                zones[zone]["states"][state] = {
                    "stateName": state,
                    "teams": [],
                    "totalTickets": 0,
                    "openTickets": 0,
                    "closedTickets": 0,
                    "productivityScore": 0,
                    "averageRating": 0,
                    "averageEfficiency": 0
                }
            
            zones[zone]["states"][state]["teams"].append(team)
            zones[zone]["totalTeams"] += 1
            if team["status"] == "active":
                zones[zone]["activeTeams"] += 1
            
            # Calculate metrics
            total_tickets = team["productivity"]["totalTicketsCompleted"]
            rating = team["productivity"]["customerRating"]
            efficiency = team["productivity"]["efficiencyScore"]
            
            # Simulate open vs closed tickets (in real app, this would come from actual ticket data)
            # For demo purposes, we'll use a ratio based on team efficiency
            closed_ratio = efficiency / 100.0
            open_tickets = max(1, int(total_tickets * (1 - closed_ratio)))
            closed_tickets = total_tickets
            
            zones[zone]["totalTickets"] += total_tickets + open_tickets
            zones[zone]["openTickets"] += open_tickets
            zones[zone]["closedTickets"] += closed_tickets
            zones[zone]["states"][state]["totalTickets"] += total_tickets + open_tickets
            zones[zone]["states"][state]["openTickets"] += open_tickets
            zones[zone]["states"][state]["closedTickets"] += closed_tickets
        
        # Calculate productivity scores and averages
        for zone in zones.values():
            if zone["totalTickets"] > 0:
                # Productivity formula: (closed tickets - open tickets) / total tickets * 100
                zone["productivityScore"] = round(((zone["closedTickets"] - zone["openTickets"]) / zone["totalTickets"]) * 100, 2)
            
            if zone["totalTeams"] > 0:
                total_rating = sum(t["productivity"]["customerRating"] for t in field_teams if t.get('zone') == zone["zoneName"])
                total_efficiency = sum(t["productivity"]["efficiencyScore"] for t in field_teams if t.get('zone') == zone["zoneName"])
                zone["averageRating"] = round(total_rating / zone["totalTeams"], 2)
                zone["averageEfficiency"] = round(total_efficiency / zone["totalTeams"], 2)
            
            for state in zone["states"].values():
                if state["totalTickets"] > 0:
                    state["productivityScore"] = round(((state["closedTickets"] - state["openTickets"]) / state["totalTickets"]) * 100, 2)
                
                if len(state["teams"]) > 0:
                    state_rating = sum(t["productivity"]["customerRating"] for t in state["teams"])
                    state_efficiency = sum(t["productivity"]["efficiencyScore"] for t in state["teams"])
                    state["averageRating"] = round(state_rating / len(state["teams"]), 2)
                    state["averageEfficiency"] = round(state_efficiency / len(state["teams"]), 2)
        
        return jsonify({"zones": zones})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/query', methods=['POST'])
def ai_query():
    data = request.json
    query = data.get('query', '')
    context = data.get('context', {})
    
    # Simple AI response based on query type
    response = generate_ai_response(query, context)
    
    return jsonify({
        "response": response,
        "queryType": "general",
        "timestamp": datetime.now().isoformat()
    })

def generate_field_team_response(query, context, query_lower, user_name, team_data):
    """Generate responses specifically for field team members"""
    
    if "performance" in query_lower or "how am i" in query_lower or "my" in query_lower and "performance" in query_lower:
        ticket_count = team_data.get('ticketCount', 0)
        performance = team_data.get('performance', {})
        return f"""**Your Performance Summary - {user_name}:**

**This Week's Metrics:**
- **Tickets Assigned:** {ticket_count} tasks
- **Completed Today:** {min(3, ticket_count)} tickets
- **Avg Resolution Time:** 2.3 hours
- **Customer Rating:** 4.8/5.0 ⭐
- **Efficiency Score:** 92%

**Performance Highlights:**
✅ **Excellent Work!** You're performing above team average
✅ **Customer Satisfaction:** Customers are very happy with your service
✅ **Quick Response:** Your resolution time is 15% faster than average
✅ **Quality Work:** Zero re-visits this week

**Areas of Excellence:**
- Network troubleshooting expertise
- Clear customer communication
- Detailed documentation
- Safety protocol compliance

**Tips to Maintain Performance:**
1. Continue documenting all work thoroughly
2. Keep customers informed of progress
3. Double-check connections before closing tickets
4. Update ticket status in real-time

Keep up the great work! 🌟"""

    elif "troubleshoot" in query_lower or "fiber" in query_lower or "network" in query_lower or "fix" in query_lower:
        return f"""**Network Troubleshooting Guide - {user_name}:**

**Fiber Optic Troubleshooting Steps:**

**1. Visual Inspection (5 min):**
- Check for physical damage to fiber cables
- Inspect connectors for dirt or damage
- Verify LED indicators on ONU/ONT devices
- Look for bent or crimped cables

**2. Power & Connectivity (5 min):**
- Confirm power supply is connected and working
- Check if LEDs are showing proper status:
  - Green: Good signal
  - Red: No signal or weak signal
  - Amber: Connection issues

**3. Signal Testing (10 min):**
- Use optical power meter to measure signal strength
- Test at customer premises and FDP
- Compare readings with standard values
- Document all measurements in ticket

**4. Common Fiber Issues:**
- **Dirty Connectors:** Clean with fiber optic cleaner
- **Bent Cable:** Straighten or replace damaged section
- **Loose Connections:** Re-seat all connectors firmly
- **Damaged FDP:** Report for infrastructure team

**5. CPE Device Issues:**
- Power cycle the device (wait 30 seconds)
- Check configuration settings
- Verify MAC address registration
- Test with spare device if available

**Safety Reminders:**
⚠️ Never look directly into fiber optic cables
⚠️ Use proper safety glasses when working with lasers
⚠️ Dispose of fiber scraps properly

**Documentation:**
- Take photos of issue and resolution
- Record all test measurements
- Note any replaced materials
- Update ticket with detailed findings

Need specific help with a particular issue? Let me know!"""

    elif "task" in query_lower or "ticket" in query_lower or "today" in query_lower or "assigned" in query_lower:
        tickets = team_data.get('todayTickets', [])
        ticket_count = len(tickets)
        return f"""**Your Tasks Today - {user_name}:**

**Assigned Tickets:** {ticket_count} tasks

**Priority Breakdown:**
- **High Priority:** {sum(1 for t in tickets if t.get('priority') == 'high')} tickets - Complete these first!
- **Medium Priority:** {sum(1 for t in tickets if t.get('priority') == 'medium')} tickets
- **Low Priority:** {sum(1 for t in tickets if t.get('priority') == 'low')} tickets

**Task Categories:**
- **Network Breakdown - NTT:** Critical infrastructure issues
- **Customer - Fiber/CPE:** Customer premise equipment issues
- **FDP Breakdown:** Field distribution point repairs

**Recommended Task Order:**
1. ⚡ Complete HIGH priority tickets first
2. 📍 Group nearby locations for efficiency
3. ⏰ Schedule complex tasks during off-peak hours
4. 📞 Call customers before arrival

**Time Management Tips:**
- **Average ticket:** 1.5-2 hours
- **Travel time:** Factor in 15-20 minutes between sites
- **Break time:** Take proper breaks for safety
- **End-of-day:** Reserve 30 minutes for documentation

**Before Starting Each Task:**
✓ Review ticket details thoroughly
✓ Check required materials
✓ Verify customer contact information
✓ Plan route to location
✓ Inform customer of arrival time

**After Completing Each Task:**
✓ Update ticket status
✓ Upload photos
✓ Record materials used
✓ Get customer signature
✓ Move to next priority task

You've got this! 💪"""

    elif "improve" in query_lower or "efficiency" in query_lower or "better" in query_lower or "tips" in query_lower:
        return f"""**Performance Improvement Tips - {user_name}:**

**Efficiency Optimization:**

**1. Route Planning (Save 30-45 min/day):**
- Group nearby tickets together
- Start with farthest location, work back
- Use route optimization in the portal
- Check traffic conditions before departure

**2. Time Management:**
- **Morning (8-11 AM):** High-priority tickets
- **Midday (11-2 PM):** Travel-heavy tasks
- **Afternoon (2-5 PM):** Medium-priority tickets
- **End of Day:** Documentation and updates

**3. Material Preparation:**
- Check inventory before leaving
- Pack common items: fiber cables, connectors, CPE
- Bring testing equipment
- Have spare parts ready

**4. Customer Communication:**
- Call 15-20 minutes before arrival
- Explain issue and solution clearly
- Set realistic completion expectations
- Ask for feedback

**5. Documentation Best Practices:**
- Take "before" and "after" photos
- Record all measurements
- Update status in real-time
- Submit expenses daily

**6. Technical Excellence:**
- Test all connections thoroughly
- Verify signal strength before closing
- Ensure customer can use service
- Provide basic usage tips

**7. Safety & Quality:**
- Always use proper PPE
- Follow safety protocols
- Double-check all work
- Clean up work area

**Productivity Boosters:**
🚀 **Pre-trip Planning:** Review all tickets the night before
🚀 **Batch Updates:** Update multiple tickets during breaks
🚀 **Tool Organization:** Keep van organized for quick access
🚀 **Knowledge Sharing:** Learn from experienced team members

**Target Metrics:**
- **Resolution Time:** < 2 hours per ticket
- **First-Time Fix:** > 95% success rate
- **Customer Rating:** > 4.5/5.0
- **Daily Tickets:** 5-7 completions

**Current Status:** You're doing great! Keep following these practices. 🌟"""

    elif "safety" in query_lower or "equipment" in query_lower or "tool" in query_lower:
        return f"""**Safety & Equipment Guidelines - {user_name}:**

**Personal Protective Equipment (PPE):**
- **Required:** Safety glasses, gloves, steel-toe boots
- **Recommended:** Reflective vest, hard hat (pole work)
- **Always:** Safety first, speed second

**Equipment Checklist:**
✓ **Testing Tools:**
  - Optical power meter
  - Visual fault locator
  - OTDR (if available)
  - Multimeter
  
✓ **Hand Tools:**
  - Fiber cleaver
  - Strippers
  - Crimping tool
  - Screwdrivers
  
✓ **Materials:**
  - Fiber cables (various lengths)
  - Connectors and adapters
  - CPE units (backup)
  - Cleaning supplies

**Safety Protocols:**

**1. Fiber Optic Safety:**
⚠️ NEVER look directly into fiber cables
⚠️ Always use fiber scope for inspection
⚠️ Dispose of fiber scraps in designated container
⚠️ Wear safety glasses when cleaving

**2. Electrical Safety:**
⚠️ Verify power is off before working
⚠️ Use insulated tools
⚠️ Check voltage before connecting
⚠️ Follow lockout/tagout procedures

**3. Height Safety (Pole Work):**
⚠️ Use proper ladder positioning
⚠️ Secure tools to prevent drops
⚠️ Never work alone on heights
⚠️ Check weather conditions

**4. Vehicle Safety:**
⚠️ Park safely with hazard lights
⚠️ Use warning cones/signs
⚠️ Secure tools while driving
⚠️ Follow traffic regulations

**Emergency Procedures:**
🆘 **Injury:** Call 999, report to supervisor immediately
🆘 **Customer Emergency:** Prioritize safety, escalate if needed
🆘 **Equipment Damage:** Document and report
🆘 **Unsafe Conditions:** Stop work, report to supervisor

**Equipment Maintenance:**
- Clean tools after each use
- Report damaged equipment immediately
- Return borrowed items same day
- Keep van organized and clean

Stay safe out there! 🛡️"""

    else:
        return f"""**Hello {user_name}! How can I assist you today?**

**I can help you with:**

**📊 Performance Questions:**
- "How is my performance this week?"
- "What's my customer rating?"
- "How can I improve my efficiency?"

**🔧 Technical Support:**
- "How do I troubleshoot fiber optic issues?"
- "What to do when CPE device won't connect?"
- "How to test signal strength?"
- "Network troubleshooting procedures"

**📋 Task Management:**
- "What are my assigned tickets today?"
- "How should I prioritize my tasks?"
- "How to update ticket status?"
- "Route optimization tips"

**🛡️ Safety & Equipment:**
- "Safety protocols for fiber work"
- "Required PPE for field work"
- "Equipment usage guidelines"
- "Emergency procedures"

**💰 Expense & Time:**
- "How to submit expenses?"
- "What can I claim?"
- "Time management tips"

**Malaysian Network Operations:**
- Best practices for Malaysian field work
- Zone-specific guidelines
- Customer communication tips
- Documentation requirements

**Just ask me anything!** I'm here to help make your work easier and more efficient. 🚀"""

def generate_ai_response(query, context):
    """Generate AI-like responses based on query with updated system information"""
    query_lower = query.lower()
    user_type = context.get('userType', 'admin')
    user_name = context.get('userName', 'User')
    team_data = context.get('teamData', {})
    
    # Field team-specific responses
    if user_type == 'field_team':
        return generate_field_team_response(query, context, query_lower, user_name, team_data)
    
    # Admin responses
    if "performance" in query_lower or "team" in query_lower:
        return """**Team Performance Analysis - Malaysian Field Teams:**

**Current Team Status:**
- **Active Teams:** 8 technicians across 4 Malaysian zones
- **Average Rating:** 4.7/5.0 across all completed assignments
- **Total Tickets Completed:** 2,468 tickets handled
- **Zone Efficiency:** 87% overall performance

**Top Performers by Zone:**
🏆 **Central Zone (KL):** Zamri - 4.8 rating, 345 tickets completed
🏆 **Northern Zone (Penang):** Nurul - 4.7 rating, 301 tickets completed
🏆 **Southern Zone (Johor):** Ah-Hock - 4.9 rating, 320 tickets completed
🏆 **East Malaysia:** Muthu - 4.6 rating, 268 tickets completed

**Additional Team Members:**
- **Siti (Penang):** Network Specialist, 4.5 rating
- **Ravi (Sabah):** Customer Service Expert, 4.4 rating
- **Ahmad (Sarawak):** Technical Lead, 4.7 rating
- **Lim (Melaka):** Field Operations, 4.6 rating

**Performance Metrics:**
- **Average Completion Time:** 45 minutes per ticket
- **Customer Satisfaction:** 4.7/5.0 average rating
- **Response Time:** 15 minutes average
- **First-time Fix Rate:** 89%

**Recommendations:**
1. **Cross-zone Training:** Share expertise between zones
2. **Peak Hour Planning:** Schedule additional teams during 9-11 AM and 2-4 PM
3. **Skill Development:** Focus on network troubleshooting specialization
4. **Performance Monitoring:** Track zone-specific productivity trends"""

    elif "ticket" in query_lower or "trend" in query_lower:
        return """**Ticket Trends Analysis - Malaysian Network Operations:**

**Current Ticket Status:**
- **Open Tickets:** 3 tickets requiring attention
- **In Progress:** 2 tickets being handled
- **Completed:** 7 tickets resolved this week
- **Total Active:** 12 tickets across Malaysian zones

**Network Ticket Categories:**
🔴 **Network Breakdown - NTT Class 1 (Major):** 2 tickets (High Priority)
🟡 **Network Breakdown - NTT Class 2 (Intermediate):** 3 tickets (Medium Priority)
🟢 **Customer - Drop Fiber:** 2 tickets (Standard Priority)
🔵 **Customer - CPE:** 2 tickets (Standard Priority)
🟠 **Customer - FDP Breakdown:** 2 tickets (Medium Priority)
⚪ **Network Breakdown - NTT (Minor):** 1 ticket (Low Priority)

**Geographic Distribution:**
- **Kuala Lumpur:** 4 tickets (Central Zone)
- **Penang:** 3 tickets (Northern Zone)
- **Johor:** 2 tickets (Southern Zone)
- **Sabah/Sarawak:** 3 tickets (East Malaysia)

**Priority Analysis:**
- **Emergency:** 0 tickets (excellent response)
- **High:** 2 tickets (NTT Class 1 major breakdowns)
- **Medium:** 5 tickets (intermediate issues)
- **Low:** 5 tickets (minor network issues)

**Performance Insights:**
- **Average Resolution Time:** 2.5 hours
- **Customer Impact:** Minimal due to proactive monitoring
- **Network Uptime:** 99.2% across all zones
- **Response Efficiency:** 15-minute average response time

**Recommendations:**
1. **Priority Management:** Focus on NTT Class 1 major breakdowns
2. **Resource Allocation:** Deploy additional teams to KL and Penang
3. **Preventive Measures:** Implement proactive network monitoring
4. **Customer Communication:** Update customers on resolution progress"""

    elif "material" in query_lower or "inventory" in query_lower or "forecast" in query_lower:
        return """**Material Management & AI Forecasting - Malaysian Operations:**

**Current Inventory Status:**
- **Total Items:** 6 different network materials
- **Low Stock Alerts:** 3 items need immediate attention
- **Out of Stock:** 1 critical item (CPE Units)
- **Reorder Needed:** 4 items require urgent action

**Critical Stock Alerts:**
🚨 **CPE Units:** 0 units (OUT OF STOCK) - Urgent reorder needed
🚨 **Fiber Cable (100m):** 5 units (minimum: 10) - Critical low
⚠️ **Splitters:** 8 units (minimum: 10) - Low stock warning
⚠️ **Network Switches:** 3 units (minimum: 5) - Low stock warning

**AI Forecast - Next 7 Days:**
- **Expected Tickets:** 23 new network tickets
- **Workforce Required:** 8 technicians
- **Material Demand:** 45m fiber cable, 12 CPE units
- **Peak Hours:** 9-11 AM, 2-4 PM
- **Confidence Level:** 85%

**Zone-wise Material Usage:**
- **Central Zone (KL):** 45 units (highest demand)
- **Northern Zone (Penang):** 32 units
- **Southern Zone (Johor):** 28 units
- **East Malaysia:** 22 units

**Material Usage Trends (4-week analysis):**
- **Week 1:** 35m fiber, 8 CPE units, 15 connectors
- **Week 2:** 42m fiber, 12 CPE units, 18 connectors
- **Week 3:** 38m fiber, 10 CPE units, 16 connectors
- **Week 4 (Forecast):** 45m fiber, 12 CPE units, 20 connectors

**Top Materials by Zone:**
1. **Fiber Cable:** 45 units (Central Zone - KL)
2. **CPE Units:** 32 units (Northern Zone - Penang)
3. **Connectors:** 28 units (Southern Zone - Johor)
4. **Splitters:** 22 units (East Malaysia)

**Immediate Actions Required:**
1. **Urgent Reorder:** CPE units (suggested: 20 units)
2. **Critical Reorder:** Fiber cable (suggested: 30 units)
3. **Preventive Reorder:** Splitters (suggested: 15 units)
4. **Monitor:** Network switches (reorder when <5 units)

**Cost Impact (RM):**
- **CPE Units:** RM 2,000 (20 units × RM 100)
- **Fiber Cable:** RM 1,500 (30 units × RM 50)
- **Total Urgent Reorder:** RM 3,500"""

    elif "zone" in query_lower or "location" in query_lower or "malaysia" in query_lower:
        return """**Malaysian Zone Performance Analysis:**

**Zone Efficiency Overview:**
- **Central Zone (Kuala Lumpur):** 87% efficiency - Best performing
- **Northern Zone (Penang):** 82% efficiency - Strong performance
- **Southern Zone (Johor):** 78% efficiency - Good performance
- **East Malaysia (Sabah/Sarawak):** 75% efficiency - Developing zone

**Team Distribution by Malaysian States:**
🏢 **Kuala Lumpur (Central):**
- Zamri - Network Specialist, RM 180/hour, 4.8 rating
- 345 tickets completed, 15-minute response time

🏢 **Penang (Northern):**
- Nurul - Customer Service Expert, RM 175/hour, 4.7 rating
- Siti - Network Specialist, RM 170/hour, 4.5 rating
- 602 tickets completed combined

🏢 **Johor (Southern):**
- Ah-Hock - Technical Lead, RM 185/hour, 4.9 rating
- 320 tickets completed, highest efficiency

🏢 **Sabah (East Malaysia):**
- Muthu - Field Operations, RM 165/hour, 4.6 rating
- Ravi - Customer Service Expert, RM 160/hour, 4.4 rating

🏢 **Sarawak (East Malaysia):**
- Ahmad - Technical Lead, RM 175/hour, 4.7 rating

🏢 **Melaka (Southern):**
- Lim - Field Operations, RM 170/hour, 4.6 rating

**Productivity Metrics by Zone:**
- **Central Zone:** 690 total tickets, 87% productivity score
- **Northern Zone:** 602 total tickets, 82% productivity score
- **Southern Zone:** 640 total tickets, 78% productivity score
- **East Malaysia:** 536 total tickets, 75% productivity score

**Material Usage by Malaysian Zones:**
- **Central (KL):** 45 units - Fiber cable, CPE, connectors
- **Northern (Penang):** 32 units - Network equipment, splitters
- **Southern (Johor):** 28 units - Patch panels, switches
- **East Malaysia:** 22 units - Basic network components

**Geographic Coverage:**
- **West Malaysia:** 3 zones (Central, Northern, Southern)
- **East Malaysia:** 1 zone (Sabah, Sarawak, Melaka)
- **Total Coverage:** 13 Malaysian states
- **Population Served:** 32+ million Malaysians

**Recommendations:**
1. **Resource Optimization:** Focus on Central and Northern zones during peak hours
2. **Skill Development:** Cross-train teams across zones for better coverage
3. **Inventory Distribution:** Stock materials based on zone-specific usage patterns
4. **Performance Monitoring:** Track zone efficiency trends for continuous improvement"""

    elif "optimize" in query_lower or "improve" in query_lower or "efficiency" in query_lower:
        return """**System Optimization Recommendations - AIFF:**

**Immediate Optimization Actions:**
1. **Route Optimization:** Implement dynamic routing based on Malaysian traffic patterns
2. **Skill Matching:** Use AI to match technician expertise with network ticket requirements
3. **Predictive Maintenance:** Schedule preventive network work during low-demand periods
4. **Zone Balancing:** Redistribute workload across Malaysian zones for optimal efficiency

**Performance Metrics to Track:**
- **Response Time:** Target <15 minutes (current: 15 minutes) ✅
- **First-time Fix Rate:** Target >85% (current: 89%) ✅
- **Customer Satisfaction:** Target >4.5/5 (current: 4.7/5) ✅
- **Zone Efficiency:** Target >80% (current: 87%) ✅

**Technology Enhancements:**
- **Real-time GPS Tracking:** Monitor all 8 field teams across Malaysian zones
- **Mobile App Integration:** Instant updates and ticket management
- **Automated Scheduling:** AI-powered workload distribution
- **Predictive Analytics:** Demand forecasting for material and workforce

**Material Management Optimization:**
- **Automated Reorder System:** Prevent stockouts with AI predictions
- **Zone-based Inventory:** Distribute materials based on usage patterns
- **Cost Optimization:** Reduce emergency purchases by 25%
- **Supplier Integration:** Direct API connections for faster restocking

**Workforce Optimization:**
- **Peak Hour Planning:** Schedule additional teams during 9-11 AM and 2-4 PM
- **Cross-zone Training:** Share expertise between Malaysian regions
- **Performance Incentives:** Reward top performers in each zone
- **Skill Development:** Focus on network troubleshooting specialization

**Long-term Improvements:**
- **Machine Learning:** Advanced demand prediction for Malaysian market
- **IoT Integration:** Proactive network monitoring and maintenance
- **Advanced Analytics:** Comprehensive reporting dashboard
- **Customer Integration:** Direct customer portal for ticket management

**Expected Results:**
- **Cost Reduction:** 20-25% savings on material procurement
- **Efficiency Gains:** 30% improvement in resource utilization
- **Service Quality:** 99%+ material availability
- **Customer Satisfaction:** Maintain 4.7+ rating across all zones"""

    elif "currency" in query_lower or "rm" in query_lower or "ringgit" in query_lower:
        return """**Malaysian Ringgit (RM) Integration - AIFF:**

**Currency Conversion Applied:**
- **All hourly rates converted to RM:**
  - Zamri (KL): RM 180/hour
  - Ah-Hock (Johor): RM 185/hour
  - Nurul (Penang): RM 175/hour
  - Muthu (Sabah): RM 165/hour
  - Siti (Penang): RM 170/hour
  - Ravi (Sabah): RM 160/hour
  - Ahmad (Sarawak): RM 175/hour
  - Lim (Melaka): RM 170/hour

**Material Costs in RM:**
- **CPE Units:** RM 100 per unit
- **Fiber Cable (100m):** RM 50 per unit
- **Connectors:** RM 15 per unit
- **Splitters:** RM 25 per unit
- **Network Switches:** RM 200 per unit
- **Patch Panels:** RM 80 per unit

**Budget Planning:**
- **Monthly Team Costs:** RM 25,000+ (8 technicians)
- **Material Budget:** RM 5,000+ monthly
- **Emergency Fund:** RM 10,000 for urgent reorders
- **Total Monthly Budget:** RM 40,000+

**Cost Optimization:**
- **Bulk Purchasing:** 15% discount on orders >RM 5,000
- **Local Suppliers:** Reduce shipping costs by 20%
- **Zone-based Pricing:** Competitive rates across Malaysian regions
- **Currency Stability:** Fixed RM pricing for budget planning"""

    else:
        return """**AIFF - Advanced Intelligence Field Force Systems Overview:**

**Current System Status:**
- **Active Tickets:** 12 network tickets across Malaysian zones
- **Field Teams:** 8 technicians covering 13 Malaysian states
- **System Efficiency:** 87% overall performance
- **Customer Rating:** 4.7/5.0 average satisfaction
- **Currency:** All pricing in Malaysian Ringgit (RM)

**Key Features Available:**
1. **Predictive Planning:** AI-powered material and workforce forecasting
2. **Malaysian Zone Management:** State-based team organization (KL, Penang, Johor, Sabah, Sarawak, Melaka)
3. **Real-time Tracking:** Live ticket and team status monitoring
4. **Smart Inventory Management:** Automated reorder alerts and stock optimization
5. **Performance Analytics:** Comprehensive team and zone metrics
6. **Network Troubleshooting:** Specialized categories for NTT and customer issues

**Recent System Updates:**
- ✅ Malaysian Ringgit (RM) currency integration
- ✅ Network troubleshooting ticket categories (NTT Class 1/2, Customer services)
- ✅ Malaysian state-based zone organization
- ✅ AI forecasting for material and workforce demand
- ✅ Enhanced team performance analytics by zone
- ✅ Predictive planning with reorder alerts
- ✅ Zone efficiency tracking and optimization

**Malaysian Team Coverage:**
- **Central Zone (KL):** Zamri - Network Specialist
- **Northern Zone (Penang):** Nurul, Siti - Customer Service & Network Specialists
- **Southern Zone (Johor):** Ah-Hock, Lim - Technical Lead & Field Operations
- **East Malaysia:** Muthu, Ravi, Ahmad - Field Operations & Technical Lead

**Quick Actions Available:**
- View ticket analytics and distributions
- Check team performance by Malaysian zones
- Monitor material inventory and reorder alerts
- Access AI forecasting predictions
- Review zone efficiency metrics
- Track network troubleshooting trends

**Need specific information?** Ask about:
- Team performance and ratings by zone
- Network ticket trends and categories
- Material inventory status and forecasting
- Malaysian zone efficiency analysis
- AI-powered demand predictions
- System optimization recommendations
- Currency and cost management in RM"""

# Predictive Planning API Endpoints
@app.route('/api/planning/forecast', methods=['GET'])
def get_material_forecast():
    """Get AI-powered material and workforce forecast"""
    try:
        # Calculate forecast based on historical data and current trends
        total_tickets = len(tickets)
        active_teams = len([team for team in field_teams if team["status"] == "active"])
        
        # Simple forecasting algorithm (in real app, this would use ML models)
        next_7_days = max(1, int(total_tickets * 0.3))  # 30% of current tickets
        workforce_needed = max(1, int(active_teams * 0.8))  # 80% of active teams
        
        # Material demand calculation
        fiber_demand = next_7_days * 2  # 2m fiber per ticket on average
        cpe_demand = next_7_days * 0.5  # 0.5 CPE units per ticket
        
        forecast_data = {
            "next7Days": next_7_days,
            "workforceNeeded": workforce_needed,
            "materialDemand": {
                "fiber": fiber_demand,
                "cpe": cpe_demand,
                "connectors": next_7_days * 1.5,
                "splitters": next_7_days * 0.3
            },
            "peakHours": "9-11 AM, 2-4 PM",
            "confidence": 85,
            "trends": {
                "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
                "fiber": [35, 42, 38, fiber_demand],
                "cpe": [8, 12, 10, cpe_demand],
                "connectors": [15, 18, 16, next_7_days * 1.5]
            },
            "topMaterials": [
                {"name": "Fiber Cable", "usage": fiber_demand, "zone": "Central"},
                {"name": "CPE Units", "usage": cpe_demand, "zone": "Northern"},
                {"name": "Connectors", "usage": next_7_days * 1.5, "zone": "Southern"},
                {"name": "Splitters", "usage": next_7_days * 0.3, "zone": "Eastern"}
            ]
        }
        
        return jsonify(forecast_data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/planning/zone-materials', methods=['GET'])
def get_zone_material_usage():
    """Get material usage by zones"""
    try:
            # Group material usage by zones
            zone_usage = {}
            
            for team in field_teams:
                zone = team.get('zone', 'Unknown')
                if zone not in zone_usage:
                    zone_usage[zone] = {
                        "zoneName": zone,
                        "totalUsage": 0,
                        "materials": {
                            "fiber": 0,
                            "cpe": 0,
                            "connectors": 0,
                            "splitters": 0
                        }
                    }
                
                # Simulate material usage based on team productivity
                productivity = team["productivity"]["totalTicketsCompleted"]
                zone_usage[zone]["totalUsage"] += productivity * 2  # 2 units per ticket
                zone_usage[zone]["materials"]["fiber"] += productivity * 1.5
                zone_usage[zone]["materials"]["cpe"] += productivity * 0.4
                zone_usage[zone]["materials"]["connectors"] += productivity * 1.2
                zone_usage[zone]["materials"]["splitters"] += productivity * 0.3
            
            return jsonify({"zones": list(zone_usage.values())})
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/planning/inventory', methods=['GET'])
    def get_inventory():
        """Get current inventory status"""
        try:
            # Sample inventory data
            inventory = [
                {
                    "id": "1",
                    "name": "Fiber Cable (100m)",
                    "currentStock": 5,
                    "minLevel": 10,
                    "usageRate": 2,
                    "status": "Low Stock",
                    "lastUpdated": "2024-01-15T10:30:00Z"
                },
                {
                    "id": "2",
                    "name": "CPE Units",
                    "currentStock": 0,
                    "minLevel": 5,
                    "usageRate": 1,
                    "status": "Out of Stock",
                    "lastUpdated": "2024-01-15T09:15:00Z"
                },
                {
                    "id": "3",
                    "name": "Connectors",
                    "currentStock": 25,
                    "minLevel": 15,
                    "usageRate": 3,
                    "status": "Good",
                    "lastUpdated": "2024-01-15T11:45:00Z"
                },
                {
                    "id": "4",
                    "name": "Splitters",
                    "currentStock": 8,
                    "minLevel": 10,
                    "usageRate": 1,
                    "status": "Low Stock",
                    "lastUpdated": "2024-01-15T08:20:00Z"
                },
                {
                    "id": "5",
                    "name": "Patch Panels",
                    "currentStock": 12,
                    "minLevel": 8,
                    "usageRate": 2,
                    "status": "Good",
                    "lastUpdated": "2024-01-15T12:00:00Z"
                },
                {
                    "id": "6",
                    "name": "Network Switches",
                    "currentStock": 3,
                    "minLevel": 5,
                    "usageRate": 1,
                    "status": "Low Stock",
                    "lastUpdated": "2024-01-15T07:30:00Z"
                }
            ]
            
            # Calculate stats
            stats = {
                "totalItems": len(inventory),
                "lowStock": len([item for item in inventory if item["status"] == "Low Stock"]),
                "outOfStock": len([item for item in inventory if item["status"] == "Out of Stock"]),
                "reorderNeeded": len([item for item in inventory if item["status"] in ["Low Stock", "Out of Stock"]])
            }
            
            return jsonify({
                "inventory": inventory,
                "stats": stats,
                "lastUpdated": datetime.now().isoformat()
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/planning/reorder-alerts', methods=['GET'])
    def get_reorder_alerts():
        """Get reorder alerts for low stock items"""
        try:
            # Sample reorder alerts
            critical_alerts = [
                {
                    "id": "1",
                    "title": "CPE Units Out of Stock",
                    "description": "No CPE units available. Urgent reorder needed.",
                    "priority": "critical",
                    "materialId": "2",
                    "suggestedQuantity": 10
                },
                {
                    "id": "2",
                    "title": "Fiber Cable Critical Low",
                    "description": "Only 5 units left. Minimum level: 10 units.",
                    "priority": "critical",
                    "materialId": "1",
                    "suggestedQuantity": 20
                }
            ]
            
            warning_alerts = [
                {
                    "id": "3",
                    "title": "Splitters Low Stock",
                    "description": "8 units remaining. Consider reordering soon.",
                    "priority": "warning",
                    "materialId": "4",
                    "suggestedQuantity": 15
                },
                {
                    "id": "4",
                    "title": "Network Switches Low Stock",
                    "description": "3 units remaining. Usage rate increasing.",
                    "priority": "warning",
                    "materialId": "6",
                    "suggestedQuantity": 8
                }
            ]
            
            return jsonify({
                "critical": critical_alerts,
                "warning": warning_alerts,
                "totalAlerts": len(critical_alerts) + len(warning_alerts),
                "lastChecked": datetime.now().isoformat()
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/planning/reorder/<material_id>', methods=['POST'])
    def create_reorder(material_id):
        """Create a reorder request for a material"""
        try:
            data = request.get_json()
            quantity = data.get('quantity', 2)
            
            # In a real system, this would create a purchase order
            reorder_data = {
                "materialId": material_id,
                "quantity": quantity,
                "status": "pending",
                "createdAt": datetime.now().isoformat(),
                "estimatedDelivery": (datetime.now() + timedelta(days=3)).isoformat()
            }
            
            return jsonify({
                "message": "Reorder request created successfully",
                "reorder": reorder_data
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# Generate sample data on startup
generate_sample_data_new()

if __name__ == '__main__':
    print("🚀 Starting AIFF Backend Server...")
    print("📊 Sample data loaded successfully")
    print("🌐 Server will be available at: http://localhost:5002")
    print("🔗 API endpoints ready for frontend integration")
    
    app.run(host='0.0.0.0', port=5002, debug=True)

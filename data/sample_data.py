"""
AIFF Sample Data Generator
Generates realistic sample data for development and testing
"""

import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

class SampleDataGenerator:
    def __init__(self):
        self.states = [
            "Kuala Lumpur", "Selangor", "Penang", "Johor", "Perak", 
            "Sabah", "Sarawak", "Pahang", "Kedah", "Kelantan",
            "Terengganu", "Negeri Sembilan", "Melaka", "Perlis", "Labuan"
        ]
        
        self.zones = {
            "Central": ["Kuala Lumpur", "Selangor", "Negeri Sembilan", "Melaka"],
            "Northern": ["Penang", "Perak", "Kedah", "Perlis"],
            "Southern": ["Johor"],
            "Eastern": ["Pahang", "Terengganu", "Kelantan"],
            "Sabah": ["Sabah", "Labuan"],
            "Sarawak": ["Sarawak"]
        }
        
        self.ticket_categories = [
            "Network Breakdown - NTT Class 1 (Major)",
            "Network Breakdown - NTT Class 2 (Intermediate)", 
            "Customer - Drop Fiber",
            "Customer - CPE",
            "Customer - FDP Breakdown",
            "Network Breakdown - NTT (Minor)",
            "Infrastructure - FDP Maintenance",
            "Infrastructure - Fiber Splicing",
            "Customer - ONU Issues",
            "Network - Backhaul Problems"
        ]
        
        self.skills = [
            "fiber_optics", "network_troubleshooting", "cpe_installation",
            "fdp_maintenance", "fiber_splicing", "onu_configuration",
            "backhaul_maintenance", "customer_service", "equipment_testing",
            "route_optimization", "safety_protocols", "documentation"
        ]
        
        self.customer_names = [
            "Ahmad Rahman", "Siti Aminah", "Fatimah Abdullah", "Mohammad Ali",
            "Nurul Huda", "Hassan Ismail", "Aisha Rahman", "Omar Hassan",
            "Khadijah Ibrahim", "Yusuf Ahmad", "Zainab Omar", "Ibrahim Ali",
            "Mariam Hassan", "Abdullah Rahman", "Aminah Yusuf", "Hassan Omar",
            "Siti Mariam", "Ali Ibrahim", "Nurul Aisha", "Ahmad Zainab",
            "Rahman Hassan", "Aminah Omar", "Ismail Mariam", "Huda Abdullah",
            "Yusuf Siti", "Ibrahim Khadijah", "Hassan Zainab", "Omar Aminah",
            "Ahmad Mariam", "Rahman Nurul", "Siti Abdullah", "Ali Hassan"
        ]
        
        self.company_names = [
            "ABC Sdn Bhd", "XYZ Enterprise", "Tech Solutions", "Digital Works",
            "Network Pro", "Fiber Tech", "Connect Plus", "Smart Systems",
            "Data Link", "Internet Solutions", "Broadband Pro", "Network Hub",
            "Fiber Connect", "Tech Bridge", "Digital Link", "Network Elite"
        ]

    def generate_field_teams(self, count: int = 20) -> List[Dict[str, Any]]:
        """Generate field team members with realistic Malaysian data"""
        teams = []
        
        for i in range(count):
            # Generate realistic Malaysian names
            first_names = ["Anwar", "Muthu", "Ah-Hock", "Nurul", "Ahmad", "Siti", "Hassan", "Fatimah", "Omar", "Aisha", "Yusuf", "Khadijah", "Ibrahim", "Mariam", "Abdullah", "Nurul", "Zainab", "Hassan", "Aminah", "Ismail"]
            last_names = ["Ibrahim", "Ismail", "Hassan", "Omar", "Ibrahim", "Ahmad", "Yusuf", "Abdullah", "Ali", "Siti"]
            
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            full_name = f"{first_name} {last_name}"
            
            # Assign state and zone
            state = random.choice(self.states)
            zone = self.get_zone_for_state(state)
            
            # Generate location coordinates for the state
            coordinates = self.get_coordinates_for_state(state)
            
            # Generate realistic productivity metrics
            customer_rating = round(random.uniform(4.0, 5.0), 2)
            efficiency_score = round(random.uniform(80.0, 95.0), 2)
            tickets_completed = random.randint(5, 25)
            avg_completion_time = round(random.uniform(1.0, 3.0), 2)
            
            # Generate skills (2-4 skills per person)
            person_skills = random.sample(self.skills, random.randint(2, 4))
            
            # Generate hourly rate based on experience and zone
            base_rate = 35.0
            if zone in ["Central"]:
                base_rate += random.uniform(5, 15)
            elif zone in ["Northern", "Southern"]:
                base_rate += random.uniform(2, 10)
            
            hourly_rate = round(base_rate, 2)
            
            team = {
                "id": f"team_{str(uuid.uuid4())[:8]}",
                "name": full_name,
                "email": f"{first_name.lower()}.{last_name.lower()}@aiff.com",
                "phone": f"+601{random.randint(10000000, 99999999)}",
                "location": {
                    "address": f"{state}, Malaysia",
                    "coordinates": coordinates
                },
                "state": state,
                "zone": zone,
                "skills": person_skills,
                "certifications": self.generate_certifications(person_skills),
                "equipment": self.generate_equipment(),
                "hourly_rate": hourly_rate,
                "currency": "MYR",
                "status": random.choice(["available", "busy", "offline"]),
                "productivity": {
                    "customerRating": customer_rating,
                    "efficiencyScore": efficiency_score,
                    "ticketsCompleted": tickets_completed,
                    "averageCompletionTime": avg_completion_time,
                    "totalHoursWorked": round(tickets_completed * avg_completion_time, 2),
                    "overtimeHours": round(random.uniform(0, 20), 2),
                    "qualityScore": round(random.uniform(85.0, 98.0), 2)
                },
                "current_tickets": [],
                "max_concurrent_tickets": random.randint(2, 4),
                "created_at": self.generate_random_date(days_ago=365),
                "last_active": self.generate_random_date(days_ago=1),
                "last_login": self.generate_random_date(days_ago=random.randint(1, 7)),
                "preferences": {
                    "work_hours": "08:00-18:00",
                    "max_travel_distance": random.randint(50, 150),
                    "notification_enabled": True
                },
                "notes": self.generate_team_notes()
            }
            
            teams.append(team)
        
        return teams

    def generate_tickets(self, count: int = 50) -> List[Dict[str, Any]]:
        """Generate realistic tickets with Malaysian locations"""
        tickets = []
        
        # Ensure we have tickets spread across 12 weeks for trend analysis
        # 15% today, 15% this week, 70% past 12 weeks
        today_count = max(int(count * 0.15), 10)  # At least 10 today
        this_week_count = max(int(count * 0.15), 10)  # At least 10 this week
        historical_count = count - today_count - this_week_count
        
        print(f"Generating tickets: {today_count} today, {this_week_count} this week, {historical_count} past 12 weeks")
        
        for i in range(count):
            # Generate ticket number in format TT_001, TT_002, etc.
            ticket_number = f"TT_{str(i + 1).zfill(3)}"
            
            # Generate ticket details
            category = random.choice(self.ticket_categories)
            priority = self.determine_priority(category)
            
            # Generate customer info
            customer_name = random.choice(self.customer_names)
            company = random.choice(self.company_names)
            
            # Generate location
            state = random.choice(self.states)
            zone = self.get_zone_for_state(state)
            coordinates = self.get_coordinates_for_state(state)
            
            # Generate realistic addresses
            address = self.generate_address(state)
            
            # Generate ticket description based on category
            description = self.generate_ticket_description(category, state)
            
            # Generate timestamps based on distribution
            if i < today_count:
                # Today's tickets (0-23 hours ago)
                hours_ago = random.randint(0, 23)
                created_at = self.generate_random_date(days_ago=0, hours_ago=hours_ago)
                # 40% of today's tickets should be resolved
                if i < today_count * 0.4:
                    status = "resolved"
                else:
                    status = random.choice(["open", "in_progress", "in_progress"])
            elif i < today_count + this_week_count:
                # This week's tickets (1-6 days ago)
                days_ago = random.randint(1, 6)
                hours_ago = random.randint(0, 23)
                created_at = self.generate_random_date(days_ago=days_ago, hours_ago=hours_ago)
                # 60% of this week's tickets should be resolved
                if i < today_count + (this_week_count * 0.6):
                    status = "resolved"
                else:
                    status = random.choice(["in_progress", "resolved"])
            else:
                # Historical tickets (7-84 days ago = past 12 weeks)
                days_ago = random.randint(7, 84)  # Past 12 weeks
                created_at = self.generate_random_date(days_ago=days_ago)
                # Most older tickets should be resolved or closed
                status = random.choice(["resolved", "resolved", "closed", "completed"])
            
            # Override status with determine_status for consistency
            # status = self.determine_status(created_at)
            
            ticket = {
                "id": f"ticket_{str(uuid.uuid4())[:8]}",
                "ticketNumber": ticket_number,
                "title": category,
                "description": description,
                "priority": priority,
                "status": status,
                "category": category,
                "location": {
                    "address": address,
                    "coordinates": coordinates,
                    "state": state,
                    "zone": zone,
                    "postal_code": self.generate_postal_code(state),
                    "landmark": self.generate_landmark(state)
                },
                "assigned_team": None,  # Will be assigned later
                "customer_info": {
                    "name": customer_name,
                    "phone": f"+601{random.randint(10000000, 99999999)}",
                    "email": f"{customer_name.lower().replace(' ', '.')}@example.com",
                    "company": company,
                    "contact_preference": random.choice(["phone", "email", "sms"])
                },
                "created_at": created_at,
                "updated_at": created_at,
                "resolved_at": self.generate_resolved_at(created_at, status),
                "estimated_duration": self.estimate_duration(category, priority),
                "actual_duration": self.generate_actual_duration(status),
                "notes": self.generate_ticket_notes(category, status),
                "attachments": self.generate_attachments(status),
                "tags": self.generate_tags(category)
            }
            
            tickets.append(ticket)
        
        return tickets

    def generate_assignments(self, teams: List[Dict], tickets: List[Dict]) -> List[Dict[str, Any]]:
        """Generate assignments between teams and tickets"""
        assignments = []
        assigned_tickets = set()
        
        # Use all teams for assignment (not just "available" ones)
        # Because we want historical assignments too
        all_teams = teams
        
        for ticket in tickets:
            # Assign ALL tickets (not just open/in_progress) because historical tickets were also assigned
            if len(assigned_tickets) < len(all_teams) * 5:  # Each team can handle multiple tickets
                # Find best matching team
                best_team = self.find_best_team_for_ticket(ticket, all_teams)
                
                if best_team:
                    assignment_score = self.calculate_assignment_score(ticket, best_team)
                    
                    assignment = {
                        "id": f"assign_{str(uuid.uuid4())[:8]}",
                        "ticket_id": ticket["id"],
                        "team_id": best_team["id"],
                        "assignment_score": round(assignment_score, 2),
                        "assignment_reason": self.generate_assignment_reason(ticket, best_team),
                        "status": "assigned" if ticket["status"] == "open" else "in_progress",
                        "created_at": ticket["created_at"],
                        "assigned_at": ticket["created_at"],
                        "started_at": self.generate_started_at(ticket),
                        "completed_at": self.generate_completed_at(ticket),
                        "notes": self.generate_assignment_notes(ticket, best_team),
                        "feedback": self.generate_feedback(ticket),
                        "travel_time": self.estimate_travel_time(ticket, best_team),
                        "actual_duration": ticket.get("actual_duration")
                    }
                    
                    assignments.append(assignment)
                    assigned_tickets.add(ticket["id"])
                    
                    # Update team's current tickets
                    best_team["current_tickets"].append(ticket["id"])
                    ticket["assigned_team"] = best_team["id"]
        
        return assignments

    def get_zone_for_state(self, state: str) -> str:
        """Get zone for a given state"""
        for zone, states in self.zones.items():
            if state in states:
                return zone
        return "Central"  # Default fallback

    def get_coordinates_for_state(self, state: str) -> Dict[str, float]:
        """Get realistic coordinates for Malaysian states"""
        coordinates_map = {
            "Kuala Lumpur": {"lat": 3.1390, "lng": 101.6869},
            "Selangor": {"lat": 3.0733, "lng": 101.5185},
            "Penang": {"lat": 5.4164, "lng": 100.3327},
            "Johor": {"lat": 1.4927, "lng": 103.7414},
            "Perak": {"lat": 4.5841, "lng": 101.0829},
            "Sabah": {"lat": 5.9804, "lng": 116.0753},
            "Sarawak": {"lat": 1.5533, "lng": 110.3593},
            "Pahang": {"lat": 3.8077, "lng": 103.3260},
            "Kedah": {"lat": 6.1254, "lng": 100.3678},
            "Kelantan": {"lat": 6.1256, "lng": 102.2436},
            "Terengganu": {"lat": 5.3117, "lng": 103.1324},
            "Negeri Sembilan": {"lat": 2.7297, "lng": 101.9381},
            "Melaka": {"lat": 2.1896, "lng": 102.2501},
            "Perlis": {"lat": 6.4448, "lng": 100.2048},
            "Labuan": {"lat": 5.2831, "lng": 115.2308}
        }
        
        base_coords = coordinates_map.get(state, coordinates_map["Kuala Lumpur"])
        
        # Add some random variation
        return {
            "lat": round(base_coords["lat"] + random.uniform(-0.1, 0.1), 4),
            "lng": round(base_coords["lng"] + random.uniform(-0.1, 0.1), 4)
        }

    def generate_address(self, state: str) -> str:
        """Generate realistic Malaysian address"""
        street_types = ["Jalan", "Lorong", "Taman", "Kampung", "Batu"]
        street_names = ["Ahmad", "Hassan", "Omar", "Rahman", "Ismail", "Ali", "Siti", "Aminah"]
        
        street_type = random.choice(street_types)
        street_name = random.choice(street_names)
        number = random.randint(1, 999)
        
        if state == "Kuala Lumpur":
            areas = ["City Centre", "Bangsar", "Damansara", "Mont Kiara", "KLCC"]
            area = random.choice(areas)
            postal = random.randint(50000, 59999)
        elif state == "Selangor":
            areas = ["Petaling Jaya", "Subang Jaya", "Shah Alam", "Klang", "Kajang"]
            area = random.choice(areas)
            postal = random.randint(40000, 49999)
        else:
            area = state
            postal = random.randint(10000, 99999)
        
        return f"{street_type} {street_name} {number}, {area}, {postal} {state}"

    def generate_postal_code(self, state: str) -> str:
        """Generate postal code for state"""
        postal_ranges = {
            "Kuala Lumpur": (50000, 59999),
            "Selangor": (40000, 49999),
            "Penang": (10000, 14999),
            "Johor": (80000, 89999),
            "Perak": (30000, 39999),
            "Sabah": (88000, 91999),
            "Sarawak": (93000, 99999),
            "Pahang": (25000, 29999),
            "Kedah": (5000, 9999),
            "Kelantan": (15000, 19999),
            "Terengganu": (20000, 24999),
            "Negeri Sembilan": (70000, 73999),
            "Melaka": (75000, 79999),
            "Perlis": (1000, 2999),
            "Labuan": (87000, 87999)
        }
        
        start, end = postal_ranges.get(state, (10000, 99999))
        return str(random.randint(start, end))

    def generate_landmark(self, state: str) -> str:
        """Generate landmark for area"""
        landmarks = {
            "Kuala Lumpur": ["KLCC", "Petronas Towers", "Merdeka Square", "Batu Caves"],
            "Selangor": ["KLIA", "Sunway Pyramid", "I-City", "National Zoo"],
            "Penang": ["Penang Bridge", "Kek Lok Si", "Batu Ferringhi", "George Town"],
            "Johor": ["Legoland", "Johor Bahru City", "Desaru", "Puteri Harbour"],
            "Perak": ["Ipoh Old Town", "Kellie's Castle", "Lost World", "Taiping Lake"]
        }
        
        state_landmarks = landmarks.get(state, ["City Centre", "Main Road", "Commercial Area"])
        return random.choice(state_landmarks)

    def generate_ticket_description(self, category: str, state: str) -> str:
        """Generate realistic ticket description"""
        descriptions = {
            "Network Breakdown - NTT Class 1 (Major)": [
                f"Critical network infrastructure failure affecting multiple customers in {state}. Fiber optic cable severed due to construction work.",
                f"Major network outage in {state} area. Multiple FDPs affected, causing widespread service disruption.",
                f"Emergency network breakdown in {state}. Backhaul connection lost, affecting 500+ customers."
            ],
            "Network Breakdown - NTT Class 2 (Intermediate)": [
                f"Intermediate network issue in {state}. Partial service degradation affecting specific areas.",
                f"Network performance degradation in {state}. Signal strength below acceptable levels.",
                f"Moderate network disruption in {state}. Some customers experiencing intermittent connectivity."
            ],
            "Customer - Drop Fiber": [
                f"Customer reporting intermittent fiber connection issues in {state}. ONU showing red LED, no internet connectivity.",
                f"Drop fiber damaged in {state}. Customer experiencing slow speeds and frequent disconnections.",
                f"Fiber drop cable issue in {state}. Customer unable to access internet services."
            ],
            "Customer - CPE": [
                f"Customer CPE device not connecting to network in {state}. Device appears to be faulty, needs replacement.",
                f"CPE configuration issue in {state}. Customer unable to establish connection after power outage.",
                f"Customer reporting CPE device malfunction in {state}. Device not responding to reset attempts."
            ],
            "Customer - FDP Breakdown": [
                f"FDP equipment failure in {state}. Multiple customers affected, requires immediate attention.",
                f"Field Distribution Point malfunction in {state}. Equipment overheating and causing service issues.",
                f"FDP power supply issue in {state}. Backup systems activated, need permanent fix."
            ]
        }
        
        category_descriptions = descriptions.get(category, [f"Technical issue reported in {state}. Requires field team investigation."])
        return random.choice(category_descriptions)

    def determine_priority(self, category: str) -> str:
        """Determine priority based on category"""
        high_priority = ["Network Breakdown - NTT Class 1 (Major)", "Customer - FDP Breakdown"]
        medium_priority = ["Network Breakdown - NTT Class 2 (Intermediate)", "Customer - Drop Fiber", "Customer - CPE"]
        
        if category in high_priority:
            return "high"
        elif category in medium_priority:
            return "medium"
        else:
            return "low"

    def determine_status(self, created_at: str) -> str:
        """Determine realistic status based on creation date"""
        try:
            created_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            days_old = (datetime.now() - created_dt).days
        except:
            days_old = random.randint(0, 7)  # Fallback
        
        if days_old == 0:
            return random.choice(["open", "in_progress"])
        elif days_old <= 2:
            return random.choice(["open", "in_progress", "resolved"])
        else:
            return random.choice(["resolved", "closed"])

    def estimate_duration(self, category: str, priority: str) -> int:
        """Estimate duration in minutes"""
        base_duration = {
            "Network Breakdown - NTT Class 1 (Major)": 180,
            "Network Breakdown - NTT Class 2 (Intermediate)": 120,
            "Customer - Drop Fiber": 90,
            "Customer - CPE": 60,
            "Customer - FDP Breakdown": 150
        }
        
        duration = base_duration.get(category, 90)
        
        # Adjust based on priority
        if priority == "high":
            duration = int(duration * 0.8)  # Faster for high priority
        elif priority == "low":
            duration = int(duration * 1.2)  # Slower for low priority
        
        return duration

    def generate_actual_duration(self, status: str) -> int:
        """Generate actual duration if ticket is resolved"""
        if status in ["resolved", "closed"]:
            return random.randint(45, 180)
        return None

    def generate_resolved_at(self, created_at: str, status: str) -> str:
        """Generate resolved timestamp if applicable"""
        if status in ["resolved", "closed"]:
            try:
                created_dt = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                hours_to_resolve = random.randint(1, 48)
                return (created_dt + timedelta(hours=hours_to_resolve)).isoformat()
            except:
                return datetime.now().isoformat()
        return None

    def generate_random_date(self, days_ago: int, hours_ago: int = None) -> str:
        """Generate random date within specified range"""
        if hours_ago is not None:
            # Use specific hours_ago for precise timing (today/yesterday)
            random_minutes = random.randint(0, 59)
            date = datetime.now() - timedelta(days=days_ago, hours=hours_ago, minutes=random_minutes)
        else:
            # Use random timing for older dates
            random_days = random.randint(0, days_ago)
            random_hours = random.randint(0, 23)
            random_minutes = random.randint(0, 59)
            date = datetime.now() - timedelta(days=random_days, hours=random_hours, minutes=random_minutes)
        
        return date.isoformat()

    def generate_certifications(self, skills: List[str]) -> List[str]:
        """Generate relevant certifications"""
        cert_map = {
            "fiber_optics": ["Fiber Optic Technician", "Optical Fiber Installation"],
            "network_troubleshooting": ["Network Troubleshooting", "CCNA"],
            "cpe_installation": ["Customer Premise Equipment", "CPE Installation"],
            "safety_protocols": ["OSHA Safety", "Workplace Safety"]
        }
        
        certifications = []
        for skill in skills:
            if skill in cert_map:
                certifications.extend(cert_map[skill])
        
        return list(set(certifications))  # Remove duplicates

    def generate_equipment(self) -> Dict[str, Any]:
        """Generate equipment list"""
        return {
            "tools": ["fiber_cleaver", "optical_power_meter", "fusion_splicer", "OTDR"],
            "vehicles": ["service_van"],
            "safety_gear": ["safety_glasses", "hard_hat", "gloves"],
            "testing_equipment": ["multimeter", "cable_tester", "signal_generator"]
        }

    def generate_team_notes(self) -> str:
        """Generate team member notes"""
        notes = [
            "Experienced field technician with excellent customer service skills",
            "Specializes in fiber optic installations and troubleshooting",
            "Quick response time and high customer satisfaction ratings",
            "Certified in network troubleshooting and equipment maintenance",
            "Reliable team member with strong technical expertise"
        ]
        return random.choice(notes)

    def generate_ticket_notes(self, category: str, status: str) -> List[str]:
        """Generate ticket notes"""
        notes = []
        
        if status == "in_progress":
            notes.append("Field team dispatched to location")
            notes.append("Initial assessment completed")
        
        if status in ["resolved", "closed"]:
            notes.append("Issue resolved successfully")
            notes.append("Customer notified of completion")
            notes.append("Follow-up scheduled if needed")
        
        return notes

    def generate_attachments(self, status: str) -> List[str]:
        """Generate attachment list"""
        if status in ["resolved", "closed"]:
            return ["before_photo.jpg", "after_photo.jpg", "test_results.pdf"]
        return []

    def generate_tags(self, category: str) -> List[str]:
        """Generate relevant tags"""
        tag_map = {
            "Network Breakdown": ["network", "infrastructure", "urgent"],
            "Customer": ["customer", "premise", "service"],
            "FDP": ["fdp", "distribution", "equipment"],
            "Fiber": ["fiber", "optic", "cable"],
            "CPE": ["cpe", "customer", "device"]
        }
        
        tags = []
        for key, values in tag_map.items():
            if key in category:
                tags.extend(values)
        
        return list(set(tags))

    def find_best_team_for_ticket(self, ticket: Dict, teams: List[Dict]) -> Dict:
        """Find the best team for a ticket based on various factors"""
        if not teams:
            return None
        
        # Filter teams that aren't overloaded
        available_teams = [team for team in teams if len(team["current_tickets"]) < team["max_concurrent_tickets"]]
        
        if not available_teams:
            return None
        
        # Score teams based on various factors
        best_team = None
        best_score = 0
        
        for team in available_teams:
            score = self.calculate_assignment_score(ticket, team)
            if score > best_score:
                best_score = score
                best_team = team
        
        return best_team

    def calculate_assignment_score(self, ticket: Dict, team: Dict) -> float:
        """Calculate assignment score for team-ticket matching"""
        score = 50.0  # Base score
        
        # Zone matching (same zone gets bonus)
        if ticket["location"]["zone"] == team["zone"]:
            score += 30.0
        
        # State matching (same state gets bonus)
        if ticket["location"]["state"] == team["state"]:
            score += 20.0
        
        # Skill matching
        ticket_category = ticket["category"]
        relevant_skills = []
        
        if "Fiber" in ticket_category or "CPE" in ticket_category:
            relevant_skills = ["fiber_optics", "cpe_installation"]
        elif "Network" in ticket_category:
            relevant_skills = ["network_troubleshooting"]
        elif "FDP" in ticket_category:
            relevant_skills = ["fdp_maintenance"]
        
        skill_match = sum(1 for skill in relevant_skills if skill in team["skills"])
        score += skill_match * 15.0
        
        # Productivity bonus
        score += team["productivity"]["efficiencyScore"] * 0.2
        
        # Workload penalty
        current_load = len(team["current_tickets"])
        max_load = team["max_concurrent_tickets"]
        if current_load > 0:
            load_ratio = current_load / max_load
            score -= load_ratio * 20.0
        
        return max(0, min(100, score))

    def generate_assignment_reason(self, ticket: Dict, team: Dict) -> str:
        """Generate assignment reason"""
        reasons = [
            f"Optimal match based on location in {team['zone']} zone",
            f"Team has required skills: {', '.join(team['skills'][:2])}",
            f"High productivity score ({team['productivity']['efficiencyScore']:.1f}%) and availability",
            f"Geographic proximity and technical expertise match",
            f"Best available team for {ticket['category']} in {ticket['location']['state']}"
        ]
        return random.choice(reasons)

    def generate_started_at(self, ticket: Dict) -> str:
        """Generate started timestamp"""
        if ticket["status"] in ["in_progress", "resolved", "closed"]:
            try:
                created_at = datetime.fromisoformat(ticket["created_at"].replace('Z', '+00:00'))
                delay_hours = random.randint(1, 8)
                return (created_at + timedelta(hours=delay_hours)).isoformat()
            except:
                return datetime.now().isoformat()
        return None

    def generate_completed_at(self, ticket: Dict) -> str:
        """Generate completed timestamp"""
        if ticket["status"] in ["resolved", "closed"]:
            started_at = self.generate_started_at(ticket)
            if started_at:
                try:
                    started = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
                    duration_hours = ticket.get("actual_duration", 90) / 60
                    return (started + timedelta(hours=duration_hours)).isoformat()
                except:
                    return datetime.now().isoformat()
        return None

    def generate_assignment_notes(self, ticket: Dict, team: Dict) -> str:
        """Generate assignment notes"""
        return f"Assigned to {team['name']} - {self.generate_assignment_reason(ticket, team)}"

    def generate_feedback(self, ticket: Dict) -> Dict[str, Any]:
        """Generate customer feedback"""
        if ticket["status"] in ["resolved", "closed"]:
            return {
                "customerRating": random.randint(3, 5),
                "customerComments": random.choice([
                    "Excellent service, very professional",
                    "Quick response and resolution",
                    "Technician was knowledgeable and helpful",
                    "Issue resolved promptly",
                    "Good communication throughout the process"
                ]),
                "technicalQuality": random.randint(4, 5),
                "communication": random.randint(4, 5),
                "timeliness": random.randint(3, 5),
                "overallSatisfaction": random.randint(4, 5),
                "issues": [],
                "recommendations": "None"
            }
        return {}

    def estimate_travel_time(self, ticket: Dict, team: Dict) -> int:
        """Estimate travel time in minutes"""
        # Same state = 15-30 minutes, same zone = 30-60 minutes, different zone = 60-120 minutes
        if ticket["location"]["state"] == team["state"]:
            return random.randint(15, 30)
        elif ticket["location"]["zone"] == team["zone"]:
            return random.randint(30, 60)
        else:
            return random.randint(60, 120)

    def generate_analytics_data(self, teams: List[Dict], tickets: List[Dict], assignments: List[Dict]) -> Dict[str, Any]:
        """Generate analytics data"""
        total_tickets = len(tickets)
        open_tickets = len([t for t in tickets if t["status"] == "open"])
        resolved_tickets = len([t for t in tickets if t["status"] in ["resolved", "closed"]])
        
        active_teams = len([t for t in teams if t["status"] == "available"])
        total_teams = len(teams)
        
        avg_rating = sum(t["productivity"]["customerRating"] for t in teams) / len(teams)
        total_tickets_handled = sum(t["productivity"]["ticketsCompleted"] for t in teams)
        
        return {
            "tickets": {
                "total": total_tickets,
                "open": open_tickets,
                "resolved": resolved_tickets,
                "resolution_rate": round((resolved_tickets / total_tickets * 100), 2) if total_tickets > 0 else 0
            },
            "teams": {
                "total": total_teams,
                "active": active_teams,
                "average_rating": round(avg_rating, 2),
                "total_tickets_handled": total_tickets_handled,
                "productivity_score": round(avg_rating * 20, 2)
            },
            "assignments": {
                "total": len(assignments),
                "completed": len([a for a in assignments if a["status"] == "completed"]),
                "in_progress": len([a for a in assignments if a["status"] == "in_progress"]),
                "average_score": round(sum(a["assignment_score"] for a in assignments) / len(assignments), 2) if assignments else 0
            }
        }

# Export functions for easy use
def generate_sample_data():
    """Generate complete sample dataset"""
    generator = SampleDataGenerator()
    
    print("Generating field teams...")
    teams = generator.generate_field_teams(25)
    
    print("Generating tickets...")
    tickets = generator.generate_tickets(75)
    
    print("Generating assignments...")
    assignments = generator.generate_assignments(teams, tickets)
    
    print("Generating analytics...")
    analytics = generator.generate_analytics_data(teams, tickets, assignments)
    
    return {
        "field_teams": teams,
        "tickets": tickets,
        "assignments": assignments,
        "analytics": analytics
    }

if __name__ == "__main__":
    # Generate and print sample data
    data = generate_sample_data()
    
    print(f"\nGenerated:")
    print(f"- {len(data['field_teams'])} field teams")
    print(f"- {len(data['tickets'])} tickets")
    print(f"- {len(data['assignments'])} assignments")
    print(f"- Analytics data for {len(data['field_teams'])} teams")

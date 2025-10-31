"""
Enhanced AIFF Data Generator
Generates 15,000+ tickets with comprehensive Malaysian states/zones data
Includes intelligent assignment engine and productivity metrics
"""

import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any

class EnhancedDataGenerator:
    def __init__(self):
        # Malaysian States (All 13 states + 3 federal territories)
        self.states = [
            "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
            "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak",
            "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"
        ]
        
        # Zones mapped to states
        self.zones = {
            "Central": ["Kuala Lumpur", "Selangor", "Putrajaya", "Negeri Sembilan"],
            "Northern": ["Penang", "Perak", "Kedah", "Perlis"],
            "Southern": ["Johor", "Melaka"],
            "Eastern": ["Pahang", "Terengganu", "Kelantan"],
            "Sabah": ["Sabah", "Labuan"],
            "Sarawak": ["Sarawak"]
        }
        
        # Districts within each state (simplified - major districts only)
        self.districts = {
            "Johor": ["Johor Bahru", "Muar", "Batu Pahat", "Kluang", "Pontian"],
            "Kedah": ["Alor Setar", "Sungai Petani", "Kulim", "Langkawi"],
            "Kelantan": ["Kota Bharu", "Tanah Merah", "Pasir Mas", "Tumpat"],
            "Melaka": ["Melaka City", "Alor Gajah", "Jasin"],
            "Negeri Sembilan": ["Seremban", "Port Dickson", "Nilai", "Tampin"],
            "Pahang": ["Kuantan", "Temerloh", "Bentong", "Raub"],
            "Penang": ["George Town", "Butterworth", "Bukit Mertajam", "Balik Pulau"],
            "Perak": ["Ipoh", "Taiping", "Teluk Intan", "Sitiawan"],
            "Perlis": ["Kangar", "Arau"],
            "Sabah": ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu"],
            "Sarawak": ["Kuching", "Miri", "Sibu", "Bintulu"],
            "Selangor": ["Petaling Jaya", "Shah Alam", "Klang", "Subang Jaya", "Kajang"],
            "Terengganu": ["Kuala Terengganu", "Kemaman", "Dungun"],
            "Kuala Lumpur": ["City Centre", "Bangsar", "Cheras", "Kepong"],
            "Putrajaya": ["Precinct 1", "Precinct 8", "Precinct 16"],
            "Labuan": ["Victoria"]
        }
        
        # Ticket categories
        self.ticket_categories = [
            "Network Breakdown - NTT Class 1 (Major)",
            "Network Breakdown - NTT Class 2 (Intermediate)", 
            "Network Breakdown - NTT Class 3 (Minor)",
            "Customer - Drop Fiber",
            "Customer - CPE Installation",
            "Customer - CPE Replacement",
            "Customer - ONU Issues",
            "Customer - FDP Breakdown",
            "Infrastructure - FDP Maintenance",
            "Infrastructure - Fiber Splicing",
            "Infrastructure - Cable Testing",
            "Preventive Maintenance",
            "Emergency Repair",
            "New Installation"
        ]
        
        # 4 ticket statuses as requested
        self.ticket_statuses = ["open", "in_progress", "closed", "cancelled"]
        
        self.customer_names = [
            "Ahmad Rahman", "Siti Aminah", "Fatimah Abdullah", "Mohammad Ali",
            "Nurul Huda", "Hassan Ismail", "Aisha Rahman", "Omar Hassan",
            "Khadijah Ibrahim", "Yusuf Ahmad", "Zainab Omar", "Ibrahim Ali",
            "Mariam Hassan", "Abdullah Rahman", "Aminah Yusuf", "Hassan Omar",
            "Tan Wei Ming", "Lee Mei Ling", "Wong Chun Kit", "Lim Su Yin",
            "Kumar Rajesh", "Devi Lakshmi", "Muthu Ravi", "Priya Selvam"
        ]
        
        self.company_names = [
            "ABC Sdn Bhd", "XYZ Enterprise", "Tech Solutions Malaysia",
            "Digital Works", "Network Pro", "Fiber Tech", "Connect Plus",
            "Smart Systems", "Data Link", "Internet Solutions", "TM Net"
        ]

    def generate_enhanced_teams(self, count: int = 150) -> List[Dict[str, Any]]:
        """Generate enhanced field teams across all Malaysian states"""
        teams = []
        team_counter = 1
        
        # Distribute teams across states proportionally
        for state in self.states:
            # More teams in populous states
            state_team_count = self._get_team_count_for_state(state, count)
            zone = self.get_zone_for_state(state)
            
            for j in range(state_team_count):
                team_number = f"T{team_counter:04d}"  # T0001, T0002, etc.
                team_id = f"team_{str(uuid.uuid4())[:8]}"
                
                # Generate Malaysian name
                name = self._generate_team_name()
                
                # Get district
                district = random.choice(self.districts.get(state, [state]))
                
                # Availability status
                availability = random.choices(
                    ["available", "busy", "offline", "on_break"],
                    weights=[60, 25, 10, 5],
                    k=1
                )[0]
                
                # Productivity metrics
                efficiency_score = round(random.uniform(75.0, 98.0), 2)
                customer_rating = round(random.uniform(3.5, 5.0), 2)
                tickets_completed = random.randint(50, 500)
                
                # Calculate average completion time (hours)
                avg_completion_time = round(random.uniform(1.5, 8.0), 2)
                
                team = {
                    "id": team_id,
                    "teamNumber": team_number,
                    "name": name,
                    "email": f"{name.lower().replace(' ', '.')}@aiff.com",
                    "phone": f"+601{random.randint(10000000, 99999999)}",
                    "state": state,
                    "zone": zone,
                    "district": district,
                    "location": {
                        "address": f"{district}, {state}, Malaysia",
                        "coordinates": self.get_coordinates_for_state(state)
                    },
                    "availability": {
                        "status": availability,
                        "currentCapacity": random.randint(0, 5) if availability == "busy" else 0,
                        "maxDailyCapacity": 5,  # Max 5 tickets per day as requested
                        "todayAssigned": random.randint(0, 5) if availability in ["busy", "available"] else 0,
                        "availableSlots": 5 - random.randint(0, 5) if availability == "available" else 0
                    },
                    "productivity": {
                        "efficiencyScore": efficiency_score,
                        "customerRating": customer_rating,
                        "ticketsCompleted": tickets_completed,
                        "ticketsThisMonth": random.randint(10, 40),
                        "averageCompletionTime": avg_completion_time,  # Hours
                        "totalHoursWorked": round(tickets_completed * avg_completion_time, 2),
                        "qualityScore": round(random.uniform(85.0, 98.0), 2),
                        "responseTime": round(random.uniform(0.5, 2.0), 2)  # Hours
                    },
                    "skills": random.sample([
                        "fiber_optics", "network_troubleshooting", "cpe_installation",
                        "fdp_maintenance", "fiber_splicing", "customer_service"
                    ], random.randint(2, 4)),
                    "currentTickets": [],
                    "status": "active" if availability in ["available", "busy"] else "inactive",
                    "hourlyRate": round(random.uniform(35.0, 55.0), 2),
                    "joinedDate": self.generate_random_date(days_ago=random.randint(30, 730))
                }
                
                teams.append(team)
                team_counter += 1
        
        return teams

    def generate_enhanced_tickets(self, count: int = 15000, teams: List[Dict] = None) -> List[Dict[str, Any]]:
        """Generate 15,000+ enhanced tickets with all requested fields"""
        tickets = []
        
        print(f"🎫 Generating {count} enhanced tickets...")
        
        # Time distribution
        today_count = int(count * 0.03)  # 3% today
        week_count = int(count * 0.07)  # 7% this week
        month_count = int(count * 0.15)  # 15% this month
        historical_count = count - today_count - week_count - month_count
        
        for i in range(count):
            ticket_number = f"TT_{str(i + 1).zfill(6)}"  # TT_000001 to TT_015000
            
            # Generate category and priority
            category = random.choice(self.ticket_categories)
            priority = self._determine_priority(category)
            
            # Generate state, zone, district
            state = random.choice(self.states)
            zone = self.get_zone_for_state(state)
            district = random.choice(self.districts.get(state, [state]))
            
            # Time-based creation
            if i < today_count:
                created_at = self.generate_random_date(days_ago=0, hours_ago=random.randint(0, 23))
            elif i < today_count + week_count:
                created_at = self.generate_random_date(days_ago=random.randint(1, 6))
            elif i < today_count + week_count + month_count:
                created_at = self.generate_random_date(days_ago=random.randint(7, 30))
            else:
                created_at = self.generate_random_date(days_ago=random.randint(31, 365))
            
            # Status distribution (4 states: open, in_progress, closed, cancelled)
            status = self._determine_status(created_at, priority)
            
            # Calculate timing based on status
            timing_data = self._calculate_timing(created_at, status, priority, category)
            
            # Calculate ticket aging (days since creation)
            created_dt = datetime.fromisoformat(created_at)
            ticket_aging_days = (datetime.now() - created_dt).days
            ticket_aging_hours = round((datetime.now() - created_dt).total_seconds() / 3600, 2)
            
            ticket = {
                "id": f"ticket_{str(uuid.uuid4())[:8]}",
                "ticketNumber": ticket_number,
                "title": category,
                "description": self._generate_description(category, state, district),
                "category": category,
                "priority": priority,
                "status": status,  # 4 states: open, in_progress, closed, cancelled
                
                # Location with state, zone, and district
                "location": {
                    "address": self._generate_address(district, state),
                    "coordinates": self.get_coordinates_for_state(state),
                    "state": state,
                    "zone": zone,
                    "district": district,
                    "postalCode": self._generate_postal_code(state)
                },
                
                # Timing fields
                "createdAt": created_at,
                "updatedAt": timing_data["updatedAt"],
                "startedAt": timing_data["startedAt"],  # When work started (in_progress)
                "completedAt": timing_data["completedAt"],  # When work completed (closed)
                "cancelledAt": timing_data["cancelledAt"],  # When cancelled
                
                # Aging
                "agingDays": ticket_aging_days,
                "agingHours": ticket_aging_hours,
                
                # SLA and completion metrics
                "sla": {
                    "targetCompletionHours": self._get_sla_target(priority, category),
                    "actualCompletionHours": timing_data["completionTimeHours"],
                    "slaMetStatus": timing_data["slaMetStatus"],
                    "timeToComplete": timing_data["completionTimeHours"]  # Mean time from opening to completion
                },
                
                # Customer info
                "customerInfo": {
                    "name": random.choice(self.customer_names),
                    "phone": f"+601{random.randint(10000000, 99999999)}",
                    "email": f"{random.choice(self.customer_names).lower().replace(' ', '.')}@example.com",
                    "company": random.choice(self.company_names),
                    "contactPreference": random.choice(["phone", "email", "sms"])
                },
                
                # Assignment (will be filled by assignment engine)
                "assignedTeam": None,
                "assignmentScore": None,
                "assignmentReason": None,
                
                # Estimated vs actual duration
                "estimatedDuration": self._estimate_duration(category, priority),
                "actualDuration": timing_data["actualDurationMinutes"],
                
                # Efficiency score (will be calculated after assignment)
                "efficiencyScore": None
            }
            
            tickets.append(ticket)
            
            if (i + 1) % 1000 == 0:
                print(f"  ✅ Generated {i + 1}/{count} tickets...")
        
        return tickets

    def intelligent_assignment_engine(self, tickets: List[Dict], teams: List[Dict]) -> List[Dict[str, Any]]:
        """
        Intelligent ticket assignment engine based on:
        - Availability (max 5 tickets per day per team)
        - Location (zones and districts)
        - Productivity (efficiency scores)
        - Capacity and volume
        """
        print("🤖 Starting intelligent assignment engine...")
        
        assignments = []
        team_daily_counts = {team['id']: {'today': 0, 'thisWeek': 0} for team in teams}
        
        # Sort tickets by priority and creation time
        sorted_tickets = sorted(tickets, key=lambda t: (
            {'high': 0, 'critical': 0, 'medium': 1, 'low': 2}.get(t.get('priority', 'medium'), 1),
            t['createdAt']
        ))
        
        assigned_count = 0
        
        for ticket in sorted_tickets:
            # Only assign non-cancelled tickets
            if ticket['status'] == 'cancelled':
                continue
            
            # Find best team using intelligent matching
            best_team = self._find_best_team_intelligent(
                ticket, teams, team_daily_counts
            )
            
            if best_team:
                # Calculate assignment score
                assignment_score = self._calculate_assignment_score_enhanced(ticket, best_team)
                
                # Create assignment
                assignment = {
                    "id": f"assign_{str(uuid.uuid4())[:8]}",
                    "ticketId": ticket["id"],
                    "teamId": best_team["id"],
                    "teamNumber": best_team["teamNumber"],
                    "teamName": best_team["name"],
                    "assignmentScore": round(assignment_score, 2),
                    "assignmentReason": self._generate_assignment_reason(ticket, best_team, assignment_score),
                    "status": self._get_assignment_status(ticket["status"]),
                    "assignedAt": ticket["createdAt"],
                    "startedAt": ticket.get("startedAt"),
                    "completedAt": ticket.get("completedAt"),
                    "location": {
                        "state": ticket["location"]["state"],
                        "zone": ticket["location"]["zone"],
                        "district": ticket["location"]["district"]
                    },
                    "metrics": {
                        "travelTimeEstimate": self._estimate_travel_time(ticket, best_team),
                        "workDuration": ticket.get("actualDuration"),
                        "totalTime": ticket.get("sla", {}).get("actualCompletionHours")
                    }
                }
                
                assignments.append(assignment)
                
                # Update ticket with assignment
                ticket["assignedTeam"] = best_team["id"]
                ticket["assignmentScore"] = assignment_score
                ticket["assignmentReason"] = assignment["assignmentReason"]
                
                # Calculate efficiency score (time taken to close from start)
                if ticket["status"] == "closed" and ticket.get("sla"):
                    completion_hours = ticket["sla"].get("actualCompletionHours", 0)
                    estimated_hours = ticket.get("estimatedDuration", 120) / 60
                    
                    if estimated_hours > 0:
                        # Efficiency: 100% if completed in estimated time, higher if faster, lower if slower
                        ticket["efficiencyScore"] = round(
                            max(0, min(150, (estimated_hours / completion_hours) * 100)), 
                            2
                        )
                    else:
                        ticket["efficiencyScore"] = 100.0
                
                # Update team's daily count
                ticket_date = datetime.fromisoformat(ticket["createdAt"])
                if ticket_date.date() == datetime.now().date():
                    team_daily_counts[best_team['id']]['today'] += 1
                
                assigned_count += 1
                
                if assigned_count % 1000 == 0:
                    print(f"  ✅ Assigned {assigned_count}/{len(sorted_tickets)} tickets...")
        
        print(f"✅ Assignment complete: {assigned_count} tickets assigned")
        return assignments

    def _find_best_team_intelligent(self, ticket: Dict, teams: List[Dict], daily_counts: Dict) -> Dict:
        """Find best team using intelligent algorithm"""
        # Filter teams by:
        # 1. Availability status (available or busy with capacity)
        # 2. Not exceeded daily limit (5 tickets per day)
        # 3. Preferably same zone/state
        
        ticket_date = datetime.fromisoformat(ticket["createdAt"])
        is_today = ticket_date.date() == datetime.now().date()
        
        eligible_teams = []
        for team in teams:
            # Check daily capacity
            if is_today and daily_counts[team['id']]['today'] >= 5:
                continue
            
            # Check availability
            if team['availability']['status'] in ['available', 'busy']:
                if team['availability']['availableSlots'] > 0 or not is_today:
                    eligible_teams.append(team)
        
        if not eligible_teams:
            # Fallback: any team
            eligible_teams = teams
        
        # Score and rank teams
        team_scores = []
        for team in eligible_teams:
            score = self._calculate_assignment_score_enhanced(ticket, team)
            team_scores.append((team, score))
        
        # Sort by score (highest first)
        team_scores.sort(key=lambda x: x[1], reverse=True)
        
        return team_scores[0][0] if team_scores else None

    def _calculate_assignment_score_enhanced(self, ticket: Dict, team: Dict) -> float:
        """Enhanced assignment scoring algorithm"""
        score = 0.0
        
        # 1. Location match (40 points max)
        if ticket["location"]["district"] == team["district"]:
            score += 40.0  # Perfect district match
        elif ticket["location"]["state"] == team["state"]:
            score += 30.0  # Same state
        elif ticket["location"]["zone"] == team["zone"]:
            score += 20.0  # Same zone
        else:
            score += 5.0  # Different zone
        
        # 2. Productivity/Efficiency (30 points max)
        efficiency_normalized = team["productivity"]["efficiencyScore"] / 100.0
        score += efficiency_normalized * 30.0
        
        # 3. Availability (20 points max)
        availability_map = {"available": 20, "busy": 10, "on_break": 5, "offline": 0}
        score += availability_map.get(team["availability"]["status"], 0)
        
        # 4. Capacity (10 points max)
        available_slots = team["availability"]["availableSlots"]
        capacity_score = (available_slots / 5.0) * 10.0
        score += capacity_score
        
        return min(100.0, max(0.0, score))

    def _generate_assignment_reason(self, ticket: Dict, team: Dict, score: float) -> str:
        """Generate human-readable assignment reason"""
        reasons = []
        
        if ticket["location"]["district"] == team["district"]:
            reasons.append(f"same district ({team['district']})")
        elif ticket["location"]["state"] == team["state"]:
            reasons.append(f"same state ({team['state']})")
        else:
            reasons.append(f"zone coverage ({team['zone']})")
        
        if team["productivity"]["efficiencyScore"] > 90:
            reasons.append("high efficiency")
        
        if team["availability"]["status"] == "available":
            reasons.append("immediately available")
        
        return f"Best match: {', '.join(reasons)} | Score: {score:.1f}/100"

    def _get_assignment_status(self, ticket_status: str) -> str:
        """Map ticket status to assignment status"""
        status_map = {
            "open": "assigned",
            "in_progress": "in_progress",
            "closed": "completed",
            "cancelled": "cancelled"
        }
        return status_map.get(ticket_status, "assigned")

    def _get_team_count_for_state(self, state: str, total_teams: int) -> int:
        """Distribute teams proportionally by state population/size"""
        # Major states get more teams
        major_states = ["Selangor", "Johor", "Kuala Lumpur", "Sabah", "Sarawak", "Perak"]
        medium_states = ["Penang", "Pahang", "Kedah", "Negeri Sembilan"]
        
        if state in major_states:
            return random.randint(15, 25)
        elif state in medium_states:
            return random.randint(8, 15)
        else:
            return random.randint(3, 8)

    def _generate_team_name(self) -> str:
        """Generate Malaysian team member name"""
        first_names = [
            "Ahmad", "Ali", "Hassan", "Ibrahim", "Omar", "Yusuf", "Abdullah",
            "Siti", "Fatimah", "Aisha", "Nurul", "Aminah", "Mariam", "Khadijah",
            "Tan", "Lee", "Wong", "Lim", "Chong", "Ng",
            "Kumar", "Raj", "Muthu", "Ravi", "Devi"
        ]
        last_names = [
            "Rahman", "Hassan", "Ali", "Ibrahim", "Omar", "Ahmad", "Yusuf",
            "Ismail", "Abdullah", "Aminah", "Fatimah", "Zainab",
            "Wei Ming", "Mei Ling", "Chun Kit", "Su Yin",
            "Rajesh", "Selvam", "Kumar"
        ]
        
        return f"{random.choice(first_names)} {random.choice(last_names)}"

    def _determine_status(self, created_at: str, priority: str) -> str:
        """Determine realistic status based on age and priority"""
        try:
            created_dt = datetime.fromisoformat(created_at)
            hours_old = (datetime.now() - created_dt).total_seconds() / 3600
        except:
            hours_old = 24
        
        # Status distribution weights based on age
        if hours_old < 2:  # Very recent
            return random.choices(
                ["open", "in_progress", "closed", "cancelled"],
                weights=[60, 30, 5, 5],
                k=1
            )[0]
        elif hours_old < 24:  # Today
            return random.choices(
                ["open", "in_progress", "closed", "cancelled"],
                weights=[30, 40, 25, 5],
                k=1
            )[0]
        elif hours_old < 168:  # This week
            return random.choices(
                ["open", "in_progress", "closed", "cancelled"],
                weights=[10, 25, 60, 5],
                k=1
            )[0]
        else:  # Older
            return random.choices(
                ["open", "in_progress", "closed", "cancelled"],
                weights=[2, 5, 88, 5],
                k=1
            )[0]

    def _calculate_timing(self, created_at: str, status: str, priority: str, category: str) -> Dict:
        """Calculate all timing-related fields"""
        created_dt = datetime.fromisoformat(created_at)
        
        timing = {
            "updatedAt": created_at,
            "startedAt": None,
            "completedAt": None,
            "cancelledAt": None,
            "completionTimeHours": None,
            "actualDurationMinutes": None,
            "slaMetStatus": None
        }
        
        if status == "cancelled":
            # Cancelled tickets
            cancel_hours = random.randint(1, 48)
            timing["cancelledAt"] = (created_dt + timedelta(hours=cancel_hours)).isoformat()
            timing["updatedAt"] = timing["cancelledAt"]
            return timing
        
        if status in ["in_progress", "closed"]:
            # Started tickets
            start_delay = random.randint(10, 180)  # 10 min to 3 hours to start
            timing["startedAt"] = (created_dt + timedelta(minutes=start_delay)).isoformat()
            timing["updatedAt"] = timing["startedAt"]
        
        if status == "closed":
            # Completed tickets - calculate completion time
            work_duration = self._estimate_duration(category, priority)
            work_duration += random.randint(-30, 60)  # Variation
            
            started_dt = datetime.fromisoformat(timing["startedAt"])
            timing["completedAt"] = (started_dt + timedelta(minutes=work_duration)).isoformat()
            timing["actualDurationMinutes"] = work_duration
            timing["updatedAt"] = timing["completedAt"]
            
            # Calculate total time from creation to completion (Mean Time to Complete)
            completed_dt = datetime.fromisoformat(timing["completedAt"])
            timing["completionTimeHours"] = round((completed_dt - created_dt).total_seconds() / 3600, 2)
            
            # Check SLA compliance
            sla_target = self._get_sla_target(priority, category)
            timing["slaMetStatus"] = "met" if timing["completionTimeHours"] <= sla_target else "missed"
        
        return timing

    def _get_sla_target(self, priority: str, category: str) -> float:
        """Get SLA target hours based on priority and category"""
        sla_map = {
            "critical": 2.0,
            "high": 4.0,
            "medium": 8.0,
            "low": 24.0
        }
        
        base_sla = sla_map.get(priority, 8.0)
        
        # Critical categories get tighter SLA
        if "NTT Class 1" in category or "Major" in category:
            base_sla *= 0.5
        
        return base_sla

    def _determine_priority(self, category: str) -> str:
        """Determine priority from category"""
        if "Class 1" in category or "Major" in category or "Emergency" in category:
            return random.choice(["high", "critical"])
        elif "Class 2" in category or "Intermediate" in category:
            return "medium"
        elif "Class 3" in category or "Minor" in category or "Preventive" in category:
            return "low"
        else:
            return random.choice(["low", "medium", "medium"])

    def _estimate_duration(self, category: str, priority: str) -> int:
        """Estimate duration in minutes"""
        base_durations = {
            "Network Breakdown - NTT Class 1 (Major)": 240,
            "Network Breakdown - NTT Class 2 (Intermediate)": 180,
            "Network Breakdown - NTT Class 3 (Minor)": 90,
            "Customer - Drop Fiber": 120,
            "Customer - CPE Installation": 90,
            "Customer - CPE Replacement": 60,
            "Customer - ONU Issues": 75,
            "Customer - FDP Breakdown": 180,
            "Infrastructure - FDP Maintenance": 150,
            "Infrastructure - Fiber Splicing": 200,
            "Infrastructure - Cable Testing": 120,
            "Preventive Maintenance": 90,
            "Emergency Repair": 150,
            "New Installation": 180
        }
        
        return base_durations.get(category, 120)

    def _estimate_travel_time(self, ticket: Dict, team: Dict) -> int:
        """Estimate travel time in minutes"""
        if ticket["location"]["district"] == team["district"]:
            return random.randint(10, 30)
        elif ticket["location"]["state"] == team["state"]:
            return random.randint(30, 90)
        elif ticket["location"]["zone"] == team["zone"]:
            return random.randint(60, 180)
        else:
            return random.randint(120, 360)

    def _generate_description(self, category: str, state: str, district: str) -> str:
        """Generate ticket description"""
        templates = {
            "Network": f"Network issue in {district}, {state}. Requires immediate technical attention.",
            "Customer": f"Customer-reported issue in {district}, {state}. Service restoration needed.",
            "Infrastructure": f"Infrastructure maintenance required in {district}, {state}.",
            "Emergency": f"Emergency repair needed in {district}, {state}. High priority."
        }
        
        for key, template in templates.items():
            if key in category:
                return template
        
        return f"Technical issue in {district}, {state}. Field team dispatch required."

    def _generate_address(self, district: str, state: str) -> str:
        """Generate realistic address"""
        street_types = ["Jalan", "Lorong", "Taman", "Kampung"]
        street_names = ["Ahmad", "Hassan", "Rahman", "Merdeka", "Utama"]
        
        num = random.randint(1, 999)
        street = f"{random.choice(street_types)} {random.choice(street_names)} {num}"
        postal = self._generate_postal_code(state)
        
        return f"{street}, {district}, {postal} {state}"

    def _generate_postal_code(self, state: str) -> str:
        """Generate postal code for state"""
        postal_ranges = {
            "Kuala Lumpur": (50000, 60000),
            "Selangor": (40000, 48999),
            "Penang": (10000, 14999),
            "Johor": (79000, 82999),
            "Kedah": (5000, 9999),
            "Kelantan": (15000, 19999),
            "Melaka": (75000, 78999),
            "Negeri Sembilan": (70000, 73999),
            "Pahang": (25000, 28999),
            "Perak": (30000, 36999),
            "Perlis": (1000, 2999),
            "Sabah": (88000, 91999),
            "Sarawak": (93000, 98999),
            "Terengganu": (20000, 24999),
            "Putrajaya": (62000, 62999),
            "Labuan": (87000, 87999)
        }
        
        start, end = postal_ranges.get(state, (10000, 99999))
        return str(random.randint(start, end))

    def get_zone_for_state(self, state: str) -> str:
        """Get zone for a given state"""
        for zone, states in self.zones.items():
            if state in states:
                return zone
        return "Central"

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
            "Putrajaya": {"lat": 2.9264, "lng": 101.6964},
            "Labuan": {"lat": 5.2831, "lng": 115.2308}
        }
        
        base = coordinates_map.get(state, {"lat": 3.1390, "lng": 101.6869})
        return {
            "lat": round(base["lat"] + random.uniform(-0.2, 0.2), 4),
            "lng": round(base["lng"] + random.uniform(-0.2, 0.2), 4)
        }

    def generate_random_date(self, days_ago: int, hours_ago: int = None) -> str:
        """Generate random date"""
        if hours_ago is not None:
            date = datetime.now() - timedelta(days=days_ago, hours=hours_ago, minutes=random.randint(0, 59))
        else:
            date = datetime.now() - timedelta(
                days=random.randint(0, days_ago),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
        return date.isoformat()


def generate_enhanced_dataset(num_tickets=15000, num_teams=150):
    """Generate complete enhanced dataset"""
    print("="*60)
    print("ENHANCED AIFF DATA GENERATOR")
    print("="*60)
    
    generator = EnhancedDataGenerator()
    
    print(f"\n👥 Generating {num_teams} field teams across Malaysian states...")
    teams = generator.generate_enhanced_teams(num_teams)
    print(f"✅ Generated {len(teams)} teams")
    
    print(f"\n🎫 Generating {num_tickets} enhanced tickets...")
    tickets = generator.generate_enhanced_tickets(num_tickets, teams)
    print(f"✅ Generated {len(tickets)} tickets")
    
    print(f"\n🤖 Running intelligent assignment engine...")
    assignments = generator.intelligent_assignment_engine(tickets, teams)
    print(f"✅ Created {len(assignments)} assignments")
    
    # Calculate summary stats
    states_count = len(set(t['state'] for t in teams))
    zones_count = len(set(t['zone'] for t in teams))
    districts_count = len(set(t['district'] for t in teams))
    
    print("\n" + "="*60)
    print("DATASET SUMMARY")
    print("="*60)
    print(f"📊 Teams: {len(teams)}")
    print(f"   • States covered: {states_count}")
    print(f"   • Zones covered: {zones_count}")
    print(f"   • Districts covered: {districts_count}")
    print(f"\n🎫 Tickets: {len(tickets)}")
    
    # Status breakdown
    statuses = {}
    for ticket in tickets:
        status = ticket['status']
        statuses[status] = statuses.get(status, 0) + 1
    
    print(f"\n📋 Status Distribution:")
    for status, count in sorted(statuses.items()):
        pct = (count / len(tickets)) * 100
        print(f"   • {status.upper()}: {count} ({pct:.1f}%)")
    
    print(f"\n🔗 Assignments: {len(assignments)}")
    print("="*60)
    
    return {
        "field_teams": teams,
        "tickets": tickets,
        "assignments": assignments
    }


if __name__ == "__main__":
    # Test generation
    data = generate_enhanced_dataset(num_tickets=100, num_teams=20)
    print("\n✅ Test generation successful!")


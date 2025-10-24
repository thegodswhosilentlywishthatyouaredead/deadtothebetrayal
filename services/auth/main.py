image.png
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth"}

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
async def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_credentials.username).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/auth/teams")
async def get_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).filter(Team.is_active == True).all()
    
    # Enhance teams with performance data
    enhanced_teams = []
    for team in teams:
        # Generate realistic performance data based on team ID for consistency
        import random
        random.seed(team.id)  # Use team ID as seed for consistent data
        
        tickets_completed = random.randint(15, 65)
        customer_rating = round(random.uniform(4.0, 5.0), 2)
        response_time = random.randint(15, 45)
        completion_rate = round(random.uniform(85.0, 100.0), 1)
        efficiency = round(random.uniform(75.0, 95.0), 1)
        status = random.choice(["available", "busy", "offline"])
        
        enhanced_team = {
            "id": team.id,
            "name": team.name,
            "zone": team.zone,
            "is_active": team.is_active,
            "description": team.description,
            "productivity": {
                "ticketsCompleted": tickets_completed,
                "customerRating": customer_rating,
                "responseTime": response_time,
                "completionRate": completion_rate,
                "efficiency": efficiency
            },
            "status": status,
            "created_at": team.created_at.isoformat() if team.created_at else None,
            "updated_at": team.updated_at.isoformat() if team.updated_at else None
        }
        enhanced_teams.append(enhanced_team)
    
    return {"teams": enhanced_teams}

@app.post("/auth/teams", response_model=TeamResponse)
async def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    db_team = Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@app.get("/auth/teams/analytics/productivity")
async def get_teams_productivity(db: Session = Depends(get_db)):
    """Get teams productivity analytics"""
    teams = db.query(Team).filter(Team.is_active == True).all()
    
    # Generate mock productivity data for each team
    productivity_data = []
    for team in teams:
        productivity_data.append({
            "teamId": team.id,
            "teamName": team.name,
            "zone": team.zone,
            "productivity": {
                "customerRating": round(4.0 + (team.id % 10) * 0.1, 1),
                "efficiencyScore": round(80.0 + (team.id % 15), 1),
                "ticketsCompleted": 5 + (team.id % 20),
                "averageCompletionTime": round(1.5 + (team.id % 5) * 0.2, 1),
                "totalHoursWorked": round(10.0 + (team.id % 30), 1),
                "overtimeHours": round((team.id % 10) * 0.5, 1),
                "qualityScore": round(85.0 + (team.id % 13), 1)
            }
        })
    
    return {"teams": productivity_data}

@app.get("/auth/teams/analytics/zones")
async def get_teams_zones(db: Session = Depends(get_db)):
    """Get teams zone analytics"""
    teams = db.query(Team).filter(Team.is_active == True).all()
    
    # Group teams by zone
    zones = {}
    for team in teams:
        zone = team.zone or "Unknown Zone"
        if zone not in zones:
            zones[zone] = {
                "zoneName": zone,
                "zone": zone,
                "totalTeams": 0,
                "activeTeams": 0,
                "openTickets": 0,
                "closedTickets": 0,
                "productivity": 0.0,
                "efficiency": 0.0,
                "teams": []
            }
        
        # Generate realistic data for each team
        import random
        random.seed(team.id)
        
        tickets_completed = random.randint(15, 65)
        open_tickets = random.randint(2, 12)
        closed_tickets = tickets_completed
        productivity = round(random.uniform(4.0, 5.0), 1)
        efficiency = round(random.uniform(75.0, 95.0), 1)
        
        zones[zone]["totalTeams"] += 1
        zones[zone]["activeTeams"] += 1
        zones[zone]["openTickets"] += open_tickets
        zones[zone]["closedTickets"] += closed_tickets
        zones[zone]["productivity"] += productivity
        zones[zone]["efficiency"] += efficiency
        
        # Add team details
        zones[zone]["teams"].append({
            "id": team.id,
            "name": team.name,
            "zone": zone,
            "ticketsCompleted": tickets_completed,
            "openTickets": open_tickets,
            "closedTickets": closed_tickets,
            "productivity": productivity,
            "customerRating": round(random.uniform(4.0, 5.0), 2),
            "responseTime": random.randint(15, 45),
            "completionRate": round(random.uniform(85.0, 100.0), 1),
            "status": random.choice(["available", "busy", "offline"])
        })
    
    # Calculate averages
    for zone_data in zones.values():
        if zone_data["totalTeams"] > 0:
            zone_data["productivity"] = round(zone_data["productivity"] / zone_data["totalTeams"], 1)
            zone_data["efficiency"] = round(zone_data["efficiency"] / zone_data["totalTeams"], 1)
    
    return {"zones": list(zones.values())}

# Live Tracking Endpoints
@app.get("/auth/teams/live-tracking")
async def get_live_tracking_data(db: Session = Depends(get_db)):
    """Get live tracking data for all teams"""
    teams = db.query(Team).filter(Team.is_active == True).all()
    
    live_data = []
    for team in teams:
        # Generate realistic live tracking data
        import random
        import math
        random.seed(team.id + int(datetime.now().timestamp() / 300))  # Change every 5 minutes
        
        # Base location around Malaysia
        base_lat = 3.1390 + (random.random() - 0.5) * 0.5
        base_lon = 101.6869 + (random.random() - 0.5) * 0.5
        
        # Simulate small movement
        movement_lat = (random.random() - 0.5) * 0.001
        movement_lon = (random.random() - 0.5) * 0.001
        
        live_data.append({
            "id": team.id,
            "name": team.name,
            "zone": team.zone,
            "status": random.choice(["active", "busy", "inactive"]),
            "currentLocation": {
                "latitude": base_lat + movement_lat,
                "longitude": base_lon + movement_lon,
                "address": f"Live Location - {team.zone or 'Unknown Zone'}"
            },
            "batteryLevel": max(0, min(100, random.randint(60, 100))),
            "signalStrength": max(0, min(100, random.randint(70, 100))),
            "speed": random.randint(10, 60),  # km/h
            "heading": random.randint(0, 360),  # degrees
            "isMoving": random.random() > 0.4,
            "lastSeen": datetime.now().isoformat(),
            "rating": round(random.uniform(4.0, 5.0), 1),
            "productivityScore": round(random.uniform(75.0, 95.0), 1),
            "efficiencyScore": round(random.uniform(70.0, 90.0), 1),
            "ticketsCompleted": random.randint(15, 65),
            "responseTime": round(random.uniform(15.0, 45.0), 1)
        })
    
    return {
        "teams": live_data,
        "lastUpdate": datetime.now().isoformat(),
        "totalTeams": len(live_data),
        "activeTeams": len([t for t in live_data if t["status"] == "active"]),
        "busyTeams": len([t for t in live_data if t["status"] == "busy"])
    }

@app.get("/auth/teams/{team_id}/live-tracking")
async def get_team_live_tracking(team_id: int, db: Session = Depends(get_db)):
    """Get live tracking data for a specific team"""
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    import random
    random.seed(team.id + int(datetime.now().timestamp() / 60))  # Change every minute
    
    # Generate live data for this specific team
    base_lat = 3.1390 + (random.random() - 0.5) * 0.5
    base_lon = 101.6869 + (random.random() - 0.5) * 0.5
    
    return {
        "id": team.id,
        "name": team.name,
        "zone": team.zone,
        "status": random.choice(["active", "busy", "inactive"]),
        "currentLocation": {
            "latitude": base_lat,
            "longitude": base_lon,
            "address": f"Live Location - {team.zone or 'Unknown Zone'}"
        },
        "batteryLevel": max(0, min(100, random.randint(60, 100))),
        "signalStrength": max(0, min(100, random.randint(70, 100))),
        "speed": random.randint(10, 60),
        "heading": random.randint(0, 360),
        "isMoving": random.random() > 0.4,
        "lastSeen": datetime.now().isoformat(),
        "rating": round(random.uniform(4.0, 5.0), 1),
        "productivityScore": round(random.uniform(75.0, 95.0), 1),
        "efficiencyScore": round(random.uniform(70.0, 90.0), 1),
        "ticketsCompleted": random.randint(15, 65),
        "responseTime": round(random.uniform(15.0, 45.0), 1)
    }

@app.post("/auth/teams/{team_id}/update-location")
async def update_team_location(
    team_id: int, 
    location_data: dict, 
    db: Session = Depends(get_db)
):
    """Update team location and status"""
    team = db.query(Team).filter(Team.id == team_id, Team.is_active == True).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Update team location and status
    if "latitude" in location_data:
        team.current_latitude = location_data["latitude"]
    if "longitude" in location_data:
        team.current_longitude = location_data["longitude"]
    if "address" in location_data:
        team.current_address = location_data["address"]
    if "status" in location_data:
        team.status = location_data["status"]
    if "battery_level" in location_data:
        team.battery_level = location_data["battery_level"]
    if "signal_strength" in location_data:
        team.signal_strength = location_data["signal_strength"]
    if "speed" in location_data:
        team.speed = location_data["speed"]
    if "heading" in location_data:
        team.heading = location_data["heading"]
    if "is_moving" in location_data:
        team.is_moving = location_data["is_moving"]
    
    team.last_seen = datetime.now()
    team.updated_at = datetime.now()
    
    db.commit()
    db.refresh(team)
    
    return {
        "message": "Team location updated successfully",
        "team_id": team.id,
        "updated_at": team.updated_at.isoformat()
    }

@app.get("/auth/live-tracking/routes")
async def get_live_routes(db: Session = Depends(get_db)):
    """Get live tracking routes between teams and tickets"""
    # This would typically query the LiveTrackingRoute table
    # For now, generate sample route data
    import random
    random.seed(int(datetime.now().timestamp() / 300))  # Change every 5 minutes
    
    teams = db.query(Team).filter(Team.is_active == True).limit(5).all()
    routes = []
    
    for i, team in enumerate(teams):
        if team.current_latitude and team.current_longitude:
            # Generate a route to a random ticket location
            ticket_lat = 3.1390 + (random.random() - 0.5) * 0.3
            ticket_lon = 101.6869 + (random.random() - 0.5) * 0.3
            
            # Calculate distance (simplified)
            distance = math.sqrt(
                (ticket_lat - team.current_latitude) ** 2 + 
                (ticket_lon - team.current_longitude) ** 2
            ) * 111  # Rough conversion to km
            
            routes.append({
                "id": i + 1,
                "teamId": team.id,
                "teamName": team.name,
                "ticketId": random.randint(1000, 9999),
                "ticketTitle": f"Ticket {random.randint(1000, 9999)}",
                "from": {
                    "latitude": team.current_latitude,
                    "longitude": team.current_longitude
                },
                "to": {
                    "latitude": ticket_lat,
                    "longitude": ticket_lon
                },
                "distance": round(distance, 1),
                "eta": random.randint(15, 75),  # minutes
                "status": random.choice(["en_route", "arrived", "completed"]),
                "startedAt": datetime.now().isoformat(),
                "estimatedArrival": (datetime.now() + timedelta(minutes=random.randint(15, 75))).isoformat()
            })
    
    return {
        "routes": routes,
        "totalRoutes": len(routes),
        "lastUpdate": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

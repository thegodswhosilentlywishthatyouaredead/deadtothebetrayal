from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
import logging

from models import Base, User, Team
from schemas import UserCreate, UserResponse, UserLogin, Token, TeamCreate, TeamResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Auth Service", version="1.0.0")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Security
SECRET_KEY = os.getenv("JWT_SECRET", "supersecretlocal")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

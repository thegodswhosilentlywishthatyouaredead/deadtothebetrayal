from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

from models import Base, User, Team
from schemas import UserCreate, UserResponse, UserLogin, Token, TeamCreate, TeamResponse

app = FastAPI(title="Auth Service", version="1.0.0")

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://aiff:aiffpass@localhost:5432/aiff_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

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

def create_access_token(data: dict, expires_delta: timedelta = None):
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
            "updated_at": team.updated_at.isoformat() if team.updated_at else None,
            # Additional fields for KPI calculations
            "tickets_completed": tickets_completed,
            "rating": customer_rating,
            "productivity_score": completion_rate,
            "efficiency_score": efficiency,
            "response_time_avg": response_time,
            "current_latitude": team.current_latitude,
            "current_longitude": team.current_longitude,
            "battery_level": team.battery_level,
            "signal_strength": team.signal_strength,
            "speed": team.speed,
            "heading": team.heading,
            "is_moving": team.is_moving,
            "last_seen": team.last_seen.isoformat() if team.last_seen else None
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SERVICE_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
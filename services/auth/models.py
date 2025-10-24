from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    zone = Column(String(50))
    is_active = Column(Boolean, default=True)
    
    # Live tracking fields
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    current_address = Column(String(255))
    status = Column(String(20), default='active')  # active, busy, inactive
    battery_level = Column(Integer, default=100)
    signal_strength = Column(Integer, default=100)
    speed = Column(Float, default=0.0)  # km/h
    heading = Column(Float, default=0.0)  # degrees
    is_moving = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    
    # Performance metrics
    rating = Column(Float, default=4.5)
    productivity_score = Column(Float, default=85.0)
    efficiency_score = Column(Float, default=80.0)
    tickets_completed = Column(Integer, default=0)
    response_time_avg = Column(Float, default=0.0)  # minutes
    
    # Additional metadata
    skills = Column(JSON, default=list)
    equipment = Column(JSON, default=list)
    availability = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LiveTrackingRoute(Base):
    __tablename__ = "live_tracking_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, nullable=False)
    ticket_id = Column(Integer, nullable=False)
    
    # Route information
    from_latitude = Column(Float, nullable=False)
    from_longitude = Column(Float, nullable=False)
    to_latitude = Column(Float, nullable=False)
    to_longitude = Column(Float, nullable=False)
    
    # Route metrics
    distance_km = Column(Float, default=0.0)
    estimated_duration_minutes = Column(Integer, default=0)
    status = Column(String(20), default='en_route')  # en_route, arrived, completed, cancelled
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    estimated_arrival = Column(DateTime(timezone=True))
    arrived_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

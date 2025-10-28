from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()

class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class TicketPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class TicketCategory(str, enum.Enum):
    FIBER_INSTALLATION = "FIBER_INSTALLATION"
    MAINTENANCE = "MAINTENANCE"
    REPAIR = "REPAIR"
    INSPECTION = "INSPECTION"
    EMERGENCY = "EMERGENCY"

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(TicketStatus), default=TicketStatus.OPEN)
    priority = Column(Enum(TicketPriority), default=TicketPriority.MEDIUM)
    category = Column(Enum(TicketCategory), nullable=False)
    
    # Location
    location = Column(String(200))
    zone = Column(String(50))
    coordinates = Column(String(100))  # lat,lng format
    
    # Assignment
    assigned_team_id = Column(Integer, ForeignKey("teams.id"))
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # SLA
    sla_hours = Column(Integer, default=24)
    estimated_duration = Column(Float)  # in hours
    
    # Customer info
    customer_name = Column(String(100))
    customer_contact = Column(String(100))
    customer_email = Column(String(255))
    
    # Relationships
    assignments = relationship("Assignment", back_populates="ticket")
    comments = relationship("Comment", back_populates="ticket")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"))
    
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), default="assigned")
    
    # Relationships
    ticket = relationship("Ticket", back_populates="assignments")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ticket = relationship("Ticket", back_populates="comments")

# Reference tables (these would be populated by auth service)
class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    zone = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

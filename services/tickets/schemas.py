from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import TicketStatus, TicketPriority, TicketCategory

class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TicketPriority = TicketPriority.MEDIUM
    category: TicketCategory
    location: Optional[str] = None
    zone: Optional[str] = None
    coordinates: Optional[str] = None
    due_date: Optional[datetime] = None
    sla_hours: int = 24
    estimated_duration: Optional[float] = None
    customer_name: Optional[str] = None
    customer_contact: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None
    location: Optional[str] = None
    zone: Optional[str] = None
    coordinates: Optional[str] = None
    assigned_team_id: Optional[int] = None
    assigned_user_id: Optional[int] = None
    due_date: Optional[datetime] = None
    sla_hours: Optional[int] = None
    estimated_duration: Optional[float] = None
    customer_name: Optional[str] = None
    customer_contact: Optional[str] = None

class TicketResponse(TicketBase):
    id: int
    ticket_number: str
    status: TicketStatus
    assigned_team_id: Optional[int] = None
    assigned_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AssignmentBase(BaseModel):
    ticket_id: int
    team_id: int
    assigned_by: Optional[int] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: int
    assigned_at: datetime
    status: str
    
    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    ticket_id: int
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TicketWithDetails(TicketResponse):
    assignments: List[AssignmentResponse] = []
    comments: List[CommentResponse] = []

from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from datetime import datetime, timezone
from ..db.session import Base

class TaskStatus:
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, index=True) # uuid
    user_id = Column(Integer, nullable=False, index=True)
    params = Column(JSON, nullable=True)
    status = Column(String, default=TaskStatus.PENDING)
    progress = Column(Integer, default=0)
    result_location = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    complexity_metric = Column(Integer, default=0)
    estimated_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
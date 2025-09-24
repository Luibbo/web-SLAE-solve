from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    user_id: int

class TaskCreate(TaskBase):
    params: dict = Field(default_factory=dict)

class TaskOut(TaskBase):
    id: str
    status: str
    progress: int
    complexity_metric: int
    estimated_seconds: int
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
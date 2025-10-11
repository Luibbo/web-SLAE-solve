from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.utils.utility import read_matrix_from_file

class TaskBase(BaseModel):
    pass

class TaskCreate(TaskBase):
    params: dict = Field(default_factory=dict,
                         example={"n": 3, "values": [[1,2,3],[4,5,6],[7,8,9]]})

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
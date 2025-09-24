import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.task import Task, TaskStatus
from .models.user import User
from .db.session import engine, Base
#from .api import api_router

app = FastAPI()

Base.metadata.create_all(engine) 




origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)
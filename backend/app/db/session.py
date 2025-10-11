from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL
import os

Base = declarative_base()
engine = create_engine(DATABASE_URL)

if os.getenv("RUN_MIGRATIONS", "false").lower() == "true":
    Base.metadata.create_all(engine)
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

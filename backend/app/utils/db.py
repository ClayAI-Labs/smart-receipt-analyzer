from sqlmodel import Session
from app.db_engine import engine

def get_session():
    return Session(engine)

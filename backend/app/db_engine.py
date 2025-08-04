import os
from sqlmodel import create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Use a connection pool for production
engine = create_engine(
    DATABASE_URL, 
    echo=False,                  # Set to True only for debugging
    pool_size=10,                # Tweak as needed (10 is common for small apps)
    max_overflow=20,             # Allows bursts (optional)
    pool_timeout=30,             # Timeout for getting a connection (in seconds)
    pool_recycle=1800,           # Recycle connections every 30 min to avoid stale connections
)

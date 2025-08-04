from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.auth_routes import router as auth_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ✅ Dev or Production toggle
IS_DEV = os.getenv("IS_DEV", "false").lower() == "true"

# ✅ Conditional CORS config
if IS_DEV:
    # For local testing only
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Strict production access via regex (Netlify only)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https:\/\/scanlyai\.netlify\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ✅ Health check for uptime tools
@app.get("/healthz")
def health():
    return {"status": "ok"}

# ✅ Render root fallback
@app.get("/")
async def root():
    return {"status": "ScanlyAI backend is live."}

app.include_router(router)
app.include_router(auth_router)

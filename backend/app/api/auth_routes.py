from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.core.auth import (
    create_user, authenticate_user, create_access_token, get_user_by_email
)
from app.core.models import User
from app.core.dependencies import get_current_user
from app.utils.db import get_session
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "created_at": str(current_user.created_at)
    }

@router.post("/register")
def register(user: UserRegister, session: Session = Depends(get_session)):
    if get_user_by_email(session, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_obj = create_user(session, user.email, user.password)
    return {"id": str(user_obj.id), "email": user_obj.email}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user_obj = authenticate_user(session, form_data.username, form_data.password)
    if not user_obj:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user_obj.id)})
    return {"access_token": token, "token_type": "bearer"}
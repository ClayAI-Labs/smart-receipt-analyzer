from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date, datetime, timezone
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    receipts: List["Receipt"] = Relationship(back_populates="user")

class Item(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    receipt_id: uuid.UUID = Field(foreign_key="receipt.id")
    name: str
    quantity: int
    price: float

    receipt: Optional["Receipt"] = Relationship(back_populates="items")

class Receipt(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    filename: str
    merchant: str
    date: Optional[date]
    total: float
    raw_ocr_text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    items: List[Item] = Relationship(back_populates="receipt")
    user: Optional[User] = Relationship(back_populates="receipts")
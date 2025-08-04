from pydantic import BaseModel
from typing import List
from datetime import date

class ItemData(BaseModel):
    name: str
    quantity: int
    price: float

class ReceiptData(BaseModel):
    merchant: str
    date: date
    items: List[ItemData]
    total: float

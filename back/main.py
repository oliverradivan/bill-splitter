from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List

import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bill Calculator API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalculationRequest(BaseModel):
    bill_amount: float = Field(gt=0, description="Bill must be greater than 0")
    tip_percentage: float = Field(ge=0, description="Tip percentage")
    people_count: int = Field(gt=0, description="People count must be at least 1")

class CalculationResponse(CalculationRequest):
    id: int
    total_tip: float
    grand_total: float
    amount_per_person: float

    class Config:
        orm_mode = True

@app.post("/api/v1/calculate", response_model=CalculationResponse)
def calculate_and_save(req: CalculationRequest, db: Session = Depends(get_db)):
    total_tip = round(req.bill_amount * (req.tip_percentage / 100), 2)
    grand_total = round(req.bill_amount + total_tip, 2)
    amount_per_person = round(grand_total / req.people_count, 2)

    db_item = models.Bill(
        bill_amount=req.bill_amount,
        tip_percentage=req.tip_percentage,
        people_count=req.people_count,
        total_tip=total_tip,
        grand_total=grand_total,
        amount_per_person=amount_per_person
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/v1/history", response_model=List[CalculationResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(models.Bill).order_by(models.Bill.created_at.desc()).all()
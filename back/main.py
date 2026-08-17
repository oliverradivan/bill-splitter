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


#simple calc
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





# Itemized calc
class PersonInput(BaseModel):
    name: str
    individual_amount: float = Field(ge=0)

class ItemizedCalculationRequest(BaseModel):
    people: List[PersonInput]
    shared_amount: float = Field(ge=0)
    tip_percentage: float = Field(ge=0)

class PersonResult(BaseModel):
    name: str
    individual_amount: float
    shared_share: float
    tip_share: float
    total_to_pay: float

class ItemizedCalculationResponse(BaseModel):
    id: int
    people_results: List[PersonResult]
    grand_total: float
    total_tip: float
    shared_total: float

    class Config:
        orm_mode = True

@app.post("/api/v1/itemized-calculate", response_model=ItemizedCalculationResponse)
def calculate_and_save_itemized(req: ItemizedCalculationRequest, db: Session = Depends(get_db)):
    if not req.people:
        raise HTTPException(status_code=400, detail="At least one person is required")

    # bill_subtotal = everyone's individual food + the shared amount (pre-tip)
    subtotal_individual = sum(p.individual_amount for p in req.people)
    bill_subtotal = round(subtotal_individual + req.shared_amount, 2)
    total_tip = round(bill_subtotal * (req.tip_percentage / 100), 2)
    grand_total = round(bill_subtotal + total_tip, 2)

    shared_per_person = round(req.shared_amount / len(req.people), 2)

    people_results = []
    running_total = 0.0
    for i, p in enumerate(req.people):
        food_total = p.individual_amount + shared_per_person
        tip_share = round((food_total / bill_subtotal) * total_tip, 2) if bill_subtotal > 0 else 0
        total_to_pay = round(food_total + tip_share, 2)

        is_last = i == len(req.people) - 1
        if is_last:
            total_to_pay = round(grand_total - running_total, 2)
        else:
            running_total += total_to_pay

        people_results.append({
            "name": p.name or "Unnamed",
            "individual_amount": p.individual_amount,
            "shared_share": shared_per_person,
            "tip_share": tip_share,
            "total_to_pay": total_to_pay
        })

    db_item = models.ItemizedBill(
        people=people_results,
        shared_amount=req.shared_amount,
        tip_percentage=req.tip_percentage,
        subtotal=bill_subtotal,
        total_tip=total_tip,
        grand_total=grand_total
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return {
        "id": db_item.id,
        "people_results": people_results,
        "grand_total": grand_total,
        "total_tip": total_tip,
        "shared_total": bill_subtotal
    }

@app.get("/api/v1/itemized-history", response_model=List[ItemizedCalculationResponse])
def get_itemized_history(db: Session = Depends(get_db)):
    results = db.query(models.ItemizedBill).order_by(models.ItemizedBill.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "people_results": r.people,
            "grand_total": r.grand_total,
            "total_tip": r.total_tip,
            "shared_total": r.subtotal
        }
        for r in results
    ]
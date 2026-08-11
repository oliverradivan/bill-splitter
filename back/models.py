from sqlalchemy import Column, Integer, Float, DateTime, JSON
from datetime import datetime
from database import Base

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_amount = Column(Float, nullable=False)
    tip_percentage = Column(Float, nullable=False)
    people_count = Column(Integer, nullable=False)
    total_tip = Column(Float, nullable=False)
    grand_total = Column(Float, nullable=False)
    amount_per_person = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ItemizedBill(Base):
    __tablename__ = "itemized_bills"

    id = Column(Integer, primary_key=True, index=True)
    people = Column(JSON, nullable=False)        
    shared_amount = Column(Float, nullable=False)
    tip_percentage = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    total_tip = Column(Float, nullable=False)
    grand_total = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
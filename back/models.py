from sqlalchemy import Column, Integer, Float, DateTime, JSON
from datetime import datetime
from database import Base


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
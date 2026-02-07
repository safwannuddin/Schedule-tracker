"""Week model."""
from datetime import date
from sqlalchemy import Column, Date, Integer
from sqlalchemy.orm import relationship

from app.db import Base


class Week(Base):
    __tablename__ = "weeks"

    id = Column(Integer, primary_key=True, index=True)
    week_start_date = Column(Date, unique=True, nullable=False, index=True)

    items = relationship("WeeklyItem", back_populates="week", order_by="WeeklyItem.order_index", cascade="all, delete-orphan")

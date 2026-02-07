"""DailyCheck model - cell in the grid."""
from datetime import date
from sqlalchemy import Column, Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db import Base


class DailyCheck(Base):
    __tablename__ = "daily_checks"

    id = Column(Integer, primary_key=True, index=True)
    weekly_item_id = Column(Integer, ForeignKey("weekly_items.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Integer, nullable=False, default=0)  # 0=not done, 1=done, 2=partial
    minutes = Column(Integer, nullable=True)
    note = Column(String(500), nullable=True)

    __table_args__ = (UniqueConstraint("weekly_item_id", "date", name="uq_weekly_item_date"),)

    weekly_item = relationship("WeeklyItem", back_populates="checks")

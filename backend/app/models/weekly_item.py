"""WeeklyItem model - row in the grid."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class WeeklyItem(Base):
    __tablename__ = "weekly_items"

    id = Column(Integer, primary_key=True, index=True)
    week_id = Column(Integer, ForeignKey("weeks.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True, default="")
    order_index = Column(Integer, nullable=False, default=0)

    week = relationship("Week", back_populates="items")
    checks = relationship("DailyCheck", back_populates="weekly_item", cascade="all, delete-orphan")

"""WeeklyItem schemas."""
from pydantic import BaseModel


class WeeklyItemBase(BaseModel):
    name: str
    category: str | None = ""
    order_index: int = 0


class WeeklyItemCreate(WeeklyItemBase):
    pass


class WeeklyItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    order_index: int | None = None


class WeeklyItemResponse(WeeklyItemBase):
    id: int
    week_id: int

    class Config:
        from_attributes = True

"""DailyCheck schemas."""
from datetime import date
from pydantic import BaseModel


class DailyCheckBase(BaseModel):
    weekly_item_id: int
    date: date
    status: int = 0  # 0=not done, 1=done, 2=partial
    minutes: int | None = None
    note: str | None = None


class DailyCheckUpdate(BaseModel):
    weekly_item_id: int
    date: date
    status: int = 0
    minutes: int | None = None
    note: str | None = None


class DailyCheckResponse(DailyCheckBase):
    id: int

    class Config:
        from_attributes = True

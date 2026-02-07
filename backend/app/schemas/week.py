"""Week schemas."""
from datetime import date
from pydantic import BaseModel


class WeekBase(BaseModel):
    week_start_date: date


class WeekCreate(WeekBase):
    pass


class WeekResponse(WeekBase):
    id: int

    class Config:
        from_attributes = True

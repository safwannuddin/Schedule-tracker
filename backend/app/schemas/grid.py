"""Grid response schema for GET /weeks/{week_id}/grid."""
from datetime import date
from pydantic import BaseModel


class GridCheck(BaseModel):
    id: int | None
    date: date
    status: int
    minutes: int | None
    note: str | None

    class Config:
        from_attributes = True


class GridItem(BaseModel):
    id: int
    name: str
    category: str | None
    order_index: int
    checks: list[GridCheck]

    class Config:
        from_attributes = True


class WeekGridResponse(BaseModel):
    week: dict  # id, week_start_date
    items: list[GridItem]

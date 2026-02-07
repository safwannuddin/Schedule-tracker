"""Week router."""
from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Week, WeeklyItem, DailyCheck
from app.schemas import WeekCreate, WeekResponse
from app.schemas.grid import WeekGridResponse, GridItem, GridCheck

router = APIRouter(prefix="/weeks", tags=["weeks"])


def _week_dates(week_start: date) -> list[date]:
    """Return the 7 dates (Mon–Sun) for a week given its start date."""
    return [week_start + timedelta(days=i) for i in range(7)]


@router.post("", response_model=WeekResponse)
def create_week(body: WeekCreate, db: Annotated[Session, Depends(get_db)]):
    """Create a new week. week_start_date must be a Monday."""
    if body.week_start_date.weekday() != 0:
        raise HTTPException(400, "week_start_date must be a Monday")
    existing = db.query(Week).filter(Week.week_start_date == body.week_start_date).first()
    if existing:
        raise HTTPException(409, "Week with this start date already exists")
    week = Week(week_start_date=body.week_start_date)
    db.add(week)
    db.commit()
    db.refresh(week)
    return week


@router.get("", response_model=list[WeekResponse])
def list_weeks(
    db: Annotated[Session, Depends(get_db)],
    date_param: Annotated[date | None, Query(alias="date")] = None,
):
    """List weeks. If date=YYYY-MM-DD, return the week containing that date (or empty)."""
    if date_param is None:
        weeks = db.query(Week).order_by(Week.week_start_date.desc()).all()
        return weeks
    # Find Monday of the week containing date_param
    weekday = date_param.weekday()
    monday = date_param - timedelta(days=weekday)
    week = db.query(Week).filter(Week.week_start_date == monday).first()
    if not week:
        return []
    return [week]


@router.get("/{week_id}", response_model=WeekResponse)
def get_week(week_id: int, db: Annotated[Session, Depends(get_db)]):
    """Get a single week by id."""
    week = db.query(Week).filter(Week.id == week_id).first()
    if not week:
        raise HTTPException(404, "Week not found")
    return week


@router.get("/{week_id}/grid", response_model=WeekGridResponse)
def get_week_grid(week_id: int, db: Annotated[Session, Depends(get_db)]):
    """
    Return week + items, each item with exactly 7 checks (one per day).
    Missing days are filled as empty cells.
    """
    week = db.query(Week).filter(Week.id == week_id).first()
    if not week:
        raise HTTPException(404, "Week not found")

    days = _week_dates(week.week_start_date)
    check_by_key: dict[tuple[int, date], DailyCheck] = {}
    for item in week.items:
        for c in item.checks:
            if c.date in days:
                check_by_key[(item.id, c.date)] = c

    grid_items: list[GridItem] = []
    for item in week.items:
        checks: list[GridCheck] = []
        for d in days:
            cell = check_by_key.get((item.id, d))
            if cell:
                checks.append(
                    GridCheck(
                        id=cell.id,
                        date=d,
                        status=cell.status,
                        minutes=cell.minutes,
                        note=cell.note,
                    )
                )
            else:
                checks.append(
                    GridCheck(id=None, date=d, status=0, minutes=None, note=None)
                )
        grid_items.append(
            GridItem(
                id=item.id,
                name=item.name,
                category=item.category,
                order_index=item.order_index,
                checks=checks,
            )
        )

    return WeekGridResponse(
        week={"id": week.id, "week_start_date": week.week_start_date.isoformat()},
        items=grid_items,
    )

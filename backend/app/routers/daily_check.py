"""DailyCheck router."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import DailyCheck, WeeklyItem
from app.schemas import DailyCheckUpdate, DailyCheckResponse

router = APIRouter(prefix="/daily-checks", tags=["daily-checks"])


@router.put("", response_model=DailyCheckResponse)
def upsert_daily_check(
    body: DailyCheckUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Create or update a daily check for the given weekly_item_id and date."""
    item = db.query(WeeklyItem).filter(WeeklyItem.id == body.weekly_item_id).first()
    if not item:
        raise HTTPException(404, "Weekly item not found")
    check = (
        db.query(DailyCheck)
        .filter(
            DailyCheck.weekly_item_id == body.weekly_item_id,
            DailyCheck.date == body.date,
        )
        .first()
    )
    if check:
        check.status = body.status
        check.minutes = body.minutes
        check.note = body.note
        db.commit()
        db.refresh(check)
        return check
    check = DailyCheck(
        weekly_item_id=body.weekly_item_id,
        date=body.date,
        status=body.status,
        minutes=body.minutes,
        note=body.note,
    )
    db.add(check)
    db.commit()
    db.refresh(check)
    return check

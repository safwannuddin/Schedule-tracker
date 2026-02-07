"""WeeklyItem router."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Week, WeeklyItem
from app.schemas import WeeklyItemCreate, WeeklyItemUpdate, WeeklyItemResponse

router = APIRouter(tags=["weekly-items"])


@router.post("/weeks/{week_id}/items", response_model=WeeklyItemResponse)
def create_weekly_item(
    week_id: int,
    body: WeeklyItemCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Add a row (weekly item) to a week."""
    week = db.query(Week).filter(Week.id == week_id).first()
    if not week:
        raise HTTPException(404, "Week not found")
    max_order = (
        db.query(WeeklyItem)
        .filter(WeeklyItem.week_id == week_id)
        .count()
    )
    item = WeeklyItem(
        week_id=week_id,
        name=body.name,
        category=body.category or "",
        order_index=body.order_index if body.order_index is not None else max_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/weekly-items/{item_id}", response_model=WeeklyItemResponse)
def update_weekly_item(
    item_id: int,
    body: WeeklyItemUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    """Update a weekly item (rename, category, order)."""
    item = db.query(WeeklyItem).filter(WeeklyItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Weekly item not found")
    if body.name is not None:
        item.name = body.name
    if body.category is not None:
        item.category = body.category
    if body.order_index is not None:
        item.order_index = body.order_index
    db.commit()
    db.refresh(item)
    return item


@router.delete("/weekly-items/{item_id}", status_code=204)
def delete_weekly_item(
    item_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a weekly item."""
    item = db.query(WeeklyItem).filter(WeeklyItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Weekly item not found")
    db.delete(item)
    db.commit()
    return None

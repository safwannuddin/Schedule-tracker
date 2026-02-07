"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine, Base
from app.routers import week, weekly_item, daily_check


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (for dev; use Alembic in production)."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Weekly Execution Tracker",
    description="Personal weekly grid-based execution tracker",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(week.router)
app.include_router(weekly_item.router)
app.include_router(daily_check.router)


@app.get("/health")
def health():
    return {"status": "ok"}

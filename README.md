# Weekly Execution Tracker

A personal weekly grid-based checklist to track daily execution for technical, career, and personal habits.

## Stack

- **Backend:** FastAPI, SQLAlchemy, Pydantic, PostgreSQL (SQLite for local dev)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query

## Quick start

### Backend (local)

```bash
cd backend
pip install -r requirements.txt
# Optional: copy .env.example to .env and set DATABASE_URL
uvicorn app.main:app --reload --port 8000
```

Database file (SQLite): `./schedule_tracker.db` (created automatically).

### Frontend (local)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to the backend at port 8000.

### Docker (backend only)

```bash
cd backend
docker build -t weekly-tracker-api .
docker run -p 8000:8000 -e DATABASE_URL=sqlite:///./schedule_tracker.db weekly-tracker-api
```

For PostgreSQL, set `DATABASE_URL=postgresql://user:pass@host:5432/dbname` and ensure the DB exists.

## Features

- **Week grid:** 7 columns (Mon–Sun), one row per habit/item.
- **Cell states:** Not done (0), Done (1), Partial (2); click to cycle.
- **Optional:** minutes spent and short note per cell (double-click cell).
- **Edit week:** Add/rename/delete/reorder rows (drag-and-drop or arrows).
- **Progress:** Row progress and total week progress.
- **History:** All past weeks are kept; each week has its own rows.

## API

- `POST /weeks` – create week (body: `{ "week_start_date": "YYYY-MM-DD" }`, must be Monday)
- `GET /weeks?date=YYYY-MM-DD` – list weeks, or week containing date
- `GET /weeks/{id}` – get week
- `GET /weeks/{id}/grid` – full grid (week + items with 7 checks each)
- `POST /weeks/{id}/items` – add row
- `PUT /weekly-items/{id}` – update row
- `DELETE /weekly-items/{id}` – delete row
- `PUT /daily-checks` – create/update cell (body: `weekly_item_id`, `date`, `status`, optional `minutes`, `note`)

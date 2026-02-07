import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getWeeks, getWeekGrid, createWeek } from '../api/weekApi';
import { WeekGrid } from '../components/WeekGrid';
import { getWeekStart, toISODate } from '../lib/dateUtils';

export function WeekView() {
  const { weekId } = useParams<{ weekId: string }>();
  const navigate = useNavigate();
  const id = weekId ? parseInt(weekId, 10) : null;

  const { data: grid, isLoading, error } = useQuery({
    queryKey: ['weekGrid', id],
    queryFn: () => getWeekGrid(id!),
    enabled: id != null && !Number.isNaN(id),
  });

  const { data: weeks = [] } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => getWeeks(),
  });

  const goToWeek = (targetId: number) => {
    navigate(`/week/${targetId}`);
  };

  const goToPrevNext = (delta: number) => {
    if (!grid) return;
    const idx = weeks.findIndex((w) => w.id === grid.week.id);
    if (idx < 0) return;
    const next = weeks[idx + delta];
    if (next) goToWeek(next.id);
  };

  const jumpToCurrent = async () => {
    const today = new Date();
    const monday = getWeekStart(today);
    const mondayStr = toISODate(monday);
    const existing = weeks.find((w) => w.week_start_date === mondayStr);
    if (existing) {
      goToWeek(existing.id);
      return;
    }
    try {
      const created = await createWeek(mondayStr);
      goToWeek(created.id);
    } catch (e) {
      const list = await getWeeks();
      const w = list.find((x) => x.week_start_date === mondayStr);
      if (w) goToWeek(w.id);
    }
  };

  if (id == null || Number.isNaN(id)) {
    return (
      <div className="min-h-screen bg-stone-100 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-stone-600">No week selected.</p>
          <button
            type="button"
            onClick={jumpToCurrent}
            className="mt-4 rounded-lg bg-stone-800 px-4 py-2 text-white hover:bg-stone-700"
          >
            Go to current week
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 p-6 flex items-center justify-center">
        <div className="text-stone-500">Loading…</div>
      </div>
    );
  }

  if (error || !grid) {
    return (
      <div className="min-h-screen bg-stone-100 p-6">
        <div className="mx-auto max-w-5xl text-red-600">
          {error instanceof Error ? error.message : 'Failed to load week'}
        </div>
      </div>
    );
  }

  const currentIdx = weeks.findIndex((w) => w.id === grid.week.id);
  const hasPrev = currentIdx >= 0 && currentIdx < weeks.length - 1;
  const hasNext = currentIdx > 0;

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-stone-500 hover:text-stone-700 text-sm"
            >
              ← Weeks
            </Link>
            <span className="text-stone-400">|</span>
            <button
              type="button"
              onClick={jumpToCurrent}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              Current week
            </button>
            <button
              type="button"
              onClick={() => goToPrevNext(1)}
              disabled={!hasNext}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => goToPrevNext(-1)}
              disabled={!hasPrev}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
          <Link
            to={`/week/${grid.week.id}/edit`}
            className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700"
          >
            Edit week
          </Link>
        </div>
        <WeekGrid data={grid} />
      </div>
    </div>
  );
}

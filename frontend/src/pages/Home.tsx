import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getWeeks, createWeek } from '../api/weekApi';
import { getWeekStart, toISODate } from '../lib/dateUtils';

export function Home() {
  const navigate = useNavigate();
  const { data: weeks = [], isLoading } = useQuery({
    queryKey: ['weeks'],
    queryFn: () => getWeeks(),
  });

  const openCurrent = async () => {
    const monday = getWeekStart(new Date());
    const mondayStr = toISODate(monday);
    let week = weeks.find((w) => w.week_start_date === mondayStr);
    if (!week) {
      try {
        week = await createWeek(mondayStr);
      } catch {
        const list = await getWeeks();
        week = list.find((w) => w.week_start_date === mondayStr) ?? undefined;
      }
    }
    if (week) navigate(`/week/${week.id}`);
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">
          Weekly Execution Tracker
        </h1>
        <p className="text-stone-600 text-sm mb-6">
          Track daily execution for technical, career and personal habits.
        </p>
        <button
          type="button"
          onClick={openCurrent}
          className="mb-6 rounded-lg bg-stone-800 px-4 py-2 text-white hover:bg-stone-700"
        >
          Open current week
        </button>
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <h2 className="px-4 py-3 text-sm font-medium text-stone-500 border-b border-stone-200">
            Past weeks
          </h2>
          {isLoading ? (
            <div className="p-4 text-stone-500 text-sm">Loading…</div>
          ) : weeks.length === 0 ? (
            <div className="p-4 text-stone-500 text-sm">
              No weeks yet. Open current week to create one.
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {weeks.map((w) => {
                const start = new Date(w.week_start_date);
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                const label = `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} – ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getFullYear()}`;
                return (
                  <li key={w.id}>
                    <Link
                      to={`/week/${w.id}`}
                      className="block px-4 py-3 text-stone-800 hover:bg-stone-50"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

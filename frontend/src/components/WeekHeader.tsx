import { weekRangeLabel, weekDates } from '../lib/dateUtils';

interface WeekHeaderProps {
  weekStart: string;
}

export function WeekHeader({ weekStart }: WeekHeaderProps) {
  const dates = weekDates(weekStart);

  return (
    <div className="grid grid-cols-8 gap-0 border-b border-stone-200 bg-stone-50/80">
      <div className="sticky left-0 z-10 border-r border-stone-200 bg-stone-50/95 p-3 font-medium text-stone-500">
        Item
      </div>
      {dates.map((d) => {
        const date = new Date(d);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        return (
          <div
            key={d}
            className="flex flex-col items-center border-r border-stone-200 p-2 last:border-r-0"
          >
            <span className="text-xs font-medium text-stone-500">{dayName}</span>
            <span className="text-sm text-stone-700">{dayNum}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WeekHeaderTitle({ weekStart }: WeekHeaderProps) {
  return (
    <h1 className="text-lg font-semibold text-stone-800">
      {weekRangeLabel(weekStart)}
    </h1>
  );
}

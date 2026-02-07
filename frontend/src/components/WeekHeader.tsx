interface WeekHeaderProps {
  weekStart: string;
}

export function WeekHeader(_props: WeekHeaderProps) {
  return (
    <div className="grid grid-cols-8 gap-0 border-b border-stone-200 bg-stone-50/80">
      <div className="sticky left-0 z-10 border-r border-stone-200 bg-stone-50/95 p-3 font-medium text-stone-500">
        Item
      </div>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <div
          key={n}
          className="flex flex-col items-center justify-center border-r border-stone-200 p-2 last:border-r-0"
        >
          <span className="text-sm font-medium text-stone-700">Day {n}</span>
        </div>
      ))}
    </div>
  );
}

export function WeekHeaderTitle(_props: WeekHeaderProps) {
  return (
    <h2 className="text-base font-semibold text-stone-800">Week</h2>
  );
}

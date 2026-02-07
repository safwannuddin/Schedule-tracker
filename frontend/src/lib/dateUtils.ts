/** Get Monday of the week containing d */
export function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** YYYY-MM-DD for API (local date, not UTC) */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Mon, Tue, ... */
export function shortDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/** Format range e.g. "4 Feb – 10 Feb 2025" */
export function weekRangeLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const y = start.getFullYear();
  const sameYear = end.getFullYear() === y;
  return `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} – ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short' })}${sameYear ? ` ${y}` : ` ${end.getFullYear()}`}`;
}

/** 7 dates (Mon–Sun) from week_start_date string */
export function weekDates(weekStart: string): string[] {
  const start = new Date(weekStart);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toISODate(d));
  }
  return out;
}

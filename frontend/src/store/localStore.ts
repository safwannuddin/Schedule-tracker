/**
 * All data lives in localStorage. No backend.
 * Same shapes as the old API so the rest of the app stays unchanged.
 */
import type { Week, GridItem, GridCheck, WeekGridResponse } from '../api/types';
import type { WeeklyItemCreate, WeeklyItemUpdate, DailyCheckUpdate } from '../api/types';
import { weekDates } from '../lib/dateUtils';

const STORAGE_KEY = 'schedule_tracker';

interface WeeklyItem {
  id: number;
  week_id: number;
  name: string;
  category: string | null;
  order_index: number;
}

interface DailyCheck {
  id: number;
  weekly_item_id: number;
  date: string;
  status: number;
  minutes: number | null;
  note: string | null;
}

interface Data {
  weeks: Week[];
  weeklyItems: WeeklyItem[];
  dailyChecks: DailyCheck[];
}

function nextId(existing: { id: number }[]): number {
  if (existing.length === 0) return 1;
  return Math.max(...existing.map((x) => x.id)) + 1;
}

function load(): Data {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Data;
      return {
        weeks: d.weeks ?? [],
        weeklyItems: d.weeklyItems ?? [],
        dailyChecks: d.dailyChecks ?? [],
      };
    }
  } catch {
    // ignore
  }
  return { weeks: [], weeklyItems: [], dailyChecks: [] };
}

function save(data: Data): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Get Monday (YYYY-MM-DD) of the week containing this date string, in local date */
function mondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00'); // parse as local noon to avoid UTC shift
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const m = new Date(d);
  m.setDate(diff);
  return toISODate(m);
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// --- Week APIs ---

export function createWeek(week_start_date: string): Week {
  const data = load();
  const monday = mondayOf(week_start_date);
  const existing = data.weeks.find((w) => w.week_start_date === monday);
  if (existing) throw new Error('Week with this start date already exists');
  const id = nextId(data.weeks);
  const week: Week = { id, week_start_date: monday };
  data.weeks.push(week);
  data.weeks.sort((a, b) => (b.week_start_date > a.week_start_date ? 1 : -1));
  save(data);
  return week;
}

export function getWeeks(date?: string): Week[] {
  const data = load();
  if (!date) return data.weeks;
  const monday = mondayOf(date);
  const w = data.weeks.find((x) => x.week_start_date === monday);
  return w ? [w] : [];
}

export function getWeek(weekId: number): Week | undefined {
  return load().weeks.find((w) => w.id === weekId);
}

export function getWeekGrid(weekId: number): WeekGridResponse | undefined {
  const data = load();
  const week = data.weeks.find((w) => w.id === weekId);
  if (!week) return undefined;
  const days = weekDates(week.week_start_date);
  const items = data.weeklyItems
    .filter((i) => i.week_id === weekId)
    .sort((a, b) => a.order_index - b.order_index);
  const checkByKey = new Map<string, DailyCheck>();
  for (const c of data.dailyChecks) {
    if (days.includes(c.date)) checkByKey.set(`${c.weekly_item_id}:${c.date}`, c);
  }
  const gridItems: GridItem[] = items.map((item) => {
    const checks: GridCheck[] = days.map((date) => {
      const cell = checkByKey.get(`${item.id}:${date}`);
      if (cell)
        return {
          id: cell.id,
          date,
          status: cell.status,
          minutes: cell.minutes,
          note: cell.note,
        };
      return { id: null, date, status: 0, minutes: null, note: null };
    });
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      order_index: item.order_index,
      checks,
    };
  });
  return { week, items: gridItems };
}

// --- Item APIs ---

export function createItem(weekId: number, body: WeeklyItemCreate): GridItem {
  const data = load();
  const maxOrder = data.weeklyItems.filter((i) => i.week_id === weekId).length;
  const item: WeeklyItem = {
    id: nextId(data.weeklyItems),
    week_id: weekId,
    name: body.name ?? '',
    category: body.category ?? null,
    order_index: body.order_index ?? maxOrder,
  };
  data.weeklyItems.push(item);
  save(data);
  const week = getWeekGrid(weekId);
  return week!.items.find((i) => i.id === item.id)!;
}

export function updateItem(
  itemId: number,
  body: WeeklyItemUpdate
): GridItem {
  const data = load();
  const item = data.weeklyItems.find((i) => i.id === itemId);
  if (!item) throw new Error('Weekly item not found');
  if (body.name != null) item.name = body.name;
  if (body.category != null) item.category = body.category;
  if (body.order_index != null) item.order_index = body.order_index;
  save(data);
  const week = getWeekGrid(item.week_id);
  return week!.items.find((i) => i.id === itemId)!;
}

export function deleteItem(itemId: number): void {
  const data = load();
  const idx = data.weeklyItems.findIndex((i) => i.id === itemId);
  if (idx === -1) throw new Error('Weekly item not found');
  data.weeklyItems.splice(idx, 1);
  data.dailyChecks = data.dailyChecks.filter((c) => c.weekly_item_id !== itemId);
  save(data);
}

// --- Daily check API ---

export function upsertCheck(body: DailyCheckUpdate): GridCheck & { id: number } {
  const data = load();
  let cell = data.dailyChecks.find(
    (c) => c.weekly_item_id === body.weekly_item_id && c.date === body.date
  );
  if (cell) {
    cell.status = body.status;
    cell.minutes = body.minutes ?? null;
    cell.note = body.note ?? null;
  } else {
    cell = {
      id: nextId(data.dailyChecks),
      weekly_item_id: body.weekly_item_id,
      date: body.date,
      status: body.status,
      minutes: body.minutes ?? null,
      note: body.note ?? null,
    };
    data.dailyChecks.push(cell);
  }
  save(data);
  return {
    id: cell.id,
    date: cell.date,
    status: cell.status,
    minutes: cell.minutes,
    note: cell.note,
  };
}

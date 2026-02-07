export interface Week {
  id: number;
  week_start_date: string;
}

export interface GridCheck {
  id: number | null;
  date: string;
  status: number;
  minutes: number | null;
  note: string | null;
}

export interface GridItem {
  id: number;
  name: string;
  category: string | null;
  order_index: number;
  checks: GridCheck[];
}

export interface WeekGridResponse {
  week: Week;
  items: GridItem[];
}

export interface WeeklyItemCreate {
  name: string;
  category?: string;
  order_index?: number;
}

export interface WeeklyItemUpdate {
  name?: string;
  category?: string;
  order_index?: number;
}

export interface DailyCheckUpdate {
  weekly_item_id: number;
  date: string;
  status: number;
  minutes?: number | null;
  note?: string | null;
}

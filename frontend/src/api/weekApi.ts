import { api } from './client';
import type { Week, WeekGridResponse } from './types';

export async function createWeek(week_start_date: string): Promise<Week> {
  return api<Week>('/weeks', {
    method: 'POST',
    body: JSON.stringify({ week_start_date }),
  });
}

export async function getWeeks(date?: string): Promise<Week[]> {
  const q = date ? `?date=${date}` : '';
  return api<Week[]>(`/weeks${q}`);
}

export async function getWeek(weekId: number): Promise<Week> {
  return api<Week>(`/weeks/${weekId}`);
}

export async function getWeekGrid(weekId: number): Promise<WeekGridResponse> {
  return api<WeekGridResponse>(`/weeks/${weekId}/grid`);
}

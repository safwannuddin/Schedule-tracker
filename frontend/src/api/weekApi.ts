import * as store from '../store/localStore';
import type { Week, WeekGridResponse } from './types';

export async function createWeek(week_start_date: string): Promise<Week> {
  return Promise.resolve(store.createWeek(week_start_date));
}

export async function getWeeks(date?: string): Promise<Week[]> {
  return Promise.resolve(store.getWeeks(date));
}

export async function getWeek(weekId: number): Promise<Week> {
  const w = store.getWeek(weekId);
  if (!w) throw new Error('Week not found');
  return Promise.resolve(w);
}

export async function getWeekGrid(weekId: number): Promise<WeekGridResponse> {
  const g = store.getWeekGrid(weekId);
  if (!g) throw new Error('Week not found');
  return Promise.resolve(g);
}

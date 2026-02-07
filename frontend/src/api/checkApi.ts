import { api } from './client';
import type { DailyCheckUpdate, GridCheck } from './types';

export async function upsertCheck(body: DailyCheckUpdate): Promise<GridCheck & { id: number }> {
  return api<GridCheck & { id: number }>('/daily-checks', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

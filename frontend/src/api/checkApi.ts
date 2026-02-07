import * as store from '../store/localStore';
import type { DailyCheckUpdate, GridCheck } from './types';

export async function upsertCheck(
  body: DailyCheckUpdate
): Promise<GridCheck & { id: number }> {
  return Promise.resolve(store.upsertCheck(body));
}

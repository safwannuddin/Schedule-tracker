import * as store from '../store/localStore';
import type { GridItem, WeeklyItemCreate, WeeklyItemUpdate } from './types';

export async function createItem(
  weekId: number,
  body: WeeklyItemCreate
): Promise<GridItem> {
  return Promise.resolve(store.createItem(weekId, body));
}

export async function updateItem(
  itemId: number,
  body: WeeklyItemUpdate
): Promise<GridItem> {
  return Promise.resolve(store.updateItem(itemId, body));
}

export async function deleteItem(itemId: number): Promise<void> {
  store.deleteItem(itemId);
  return Promise.resolve();
}

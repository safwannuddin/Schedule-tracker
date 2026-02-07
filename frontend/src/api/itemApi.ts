import { api } from './client';
import type { GridItem, WeeklyItemCreate, WeeklyItemUpdate } from './types';

export async function createItem(
  weekId: number,
  body: WeeklyItemCreate
): Promise<GridItem> {
  return api<GridItem>(`/weeks/${weekId}/items`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateItem(
  itemId: number,
  body: WeeklyItemUpdate
): Promise<GridItem> {
  return api<GridItem>(`/weekly-items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteItem(itemId: number): Promise<void> {
  return api<void>(`/weekly-items/${itemId}`, { method: 'DELETE' });
}

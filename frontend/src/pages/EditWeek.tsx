import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getWeekGrid } from '../api/weekApi';
import { createItem, updateItem, deleteItem } from '../api/itemApi';
import type { GridItem } from '../api/types';

export function EditWeek() {
  const { weekId } = useParams<{ weekId: string }>();
  const id = weekId ? parseInt(weekId, 10) : null;
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');

  const { data: grid, isLoading } = useQuery({
    queryKey: ['weekGrid', id],
    queryFn: () => getWeekGrid(id!),
    enabled: id != null && !Number.isNaN(id),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      createItem(id!, { name: name.trim(), order_index: (grid?.items.length ?? 0) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekGrid', id!] });
      setNewName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, name }: { itemId: number; name: string }) =>
      updateItem(itemId, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekGrid', id!] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekGrid', id!] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { itemId: number; order_index: number }[]) => {
      await Promise.all(updates.map((u) => updateItem(u.itemId, { order_index: u.order_index })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekGrid', id!] }),
  });

  const move = (_itemId: number, currentIndex: number, delta: number) => {
    const list = [...(grid?.items ?? [])].sort((a, b) => a.order_index - b.order_index);
    const newIndex = Math.max(0, Math.min(list.length - 1, currentIndex + delta));
    if (newIndex === currentIndex) return;
    const reordered = [...list];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, removed);
    const updates = reordered
      .map((item, i) => (item.order_index !== i ? { itemId: item.id, order_index: i } : null))
      .filter((u): u is { itemId: number; order_index: number } => u != null);
    if (updates.length) reorderMutation.mutate(updates);
  };

  if (id == null || Number.isNaN(id)) {
    return (
      <div className="min-h-screen bg-stone-100 p-6">
        <p className="text-stone-600">Invalid week.</p>
        <Link to="/" className="mt-2 inline-block text-stone-600 underline">Back</Link>
      </div>
    );
  }

  if (isLoading || !grid) {
    return (
      <div className="min-h-screen bg-stone-100 p-6 flex items-center justify-center">
        <div className="text-stone-500">Loading…</div>
      </div>
    );
  }

  const items = [...grid.items].sort((a, b) => a.order_index - b.order_index);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over == null || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const reordered = arrayMove(items, oldIndex, newIndex);
    const updates = reordered
      .map((item, i) => (item.order_index !== i ? { itemId: item.id, order_index: i } : null))
      .filter((u): u is { itemId: number; order_index: number } => u != null);
    if (updates.length) reorderMutation.mutate(updates);
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to={`/week/${id}`}
            className="text-stone-500 hover:text-stone-700 text-sm"
          >
            ← Back to week
          </Link>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-stone-800 mb-4">
            Edit week: {new Date(grid.week.week_start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </h1>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  createMutation.mutate(newName.trim());
                }
              }}
              placeholder="New row name"
              className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
              disabled={!newName.trim() || createMutation.isPending}
              className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
            >
              Add row
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    index={index}
                    totalItems={items.length}
                    onMove={move}
                    onRename={(name) => updateMutation.mutate({ itemId: item.id, name })}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          {items.length === 0 && (
            <p className="text-sm text-stone-500 py-4">No rows yet. Add one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface SortableRowProps {
  item: GridItem;
  index: number;
  totalItems: number;
  onMove: (itemId: number, index: number, delta: number) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function SortableRow({ item, index, totalItems, onMove, onRename, onDelete, isDeleting }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        isDragging ? 'border-stone-300 bg-white shadow-md' : 'border-stone-200 bg-stone-50/50'
      }`}
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-600 p-1 -ml-1"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h2zM15 2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V4a2 2 0 012-2h2z" />
        </svg>
      </button>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onMove(item.id, index, -1)}
          disabled={index === 0}
          className="text-stone-400 hover:text-stone-600 disabled:opacity-30 text-lg leading-none"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(item.id, index, 1)}
          disabled={index === totalItems - 1}
          className="text-stone-400 hover:text-stone-600 disabled:opacity-30 text-lg leading-none"
          aria-label="Move down"
        >
          ↓
        </button>
      </div>
      <input
        type="text"
        defaultValue={item.name}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== item.name) onRename(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="flex-1 rounded border border-transparent bg-transparent px-2 py-1 text-sm hover:border-stone-200 focus:border-stone-300 focus:outline-none"
      />
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Delete"
      >
        Delete
      </button>
    </li>
  );
}

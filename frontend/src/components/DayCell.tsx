import { useState } from 'react';
import type { GridCheck } from '../api/types';

const statusColors: Record<number, string> = {
  0: 'bg-stone-100 hover:bg-stone-200 border-stone-200',
  1: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800',
  2: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800',
};

interface DayCellProps {
  check: GridCheck;
  weeklyItemId: number;
  dayNumber: number;
  onUpdate: (payload: { date: string; status: number; minutes?: number | null; note?: string | null }) => void;
}

export function DayCell({ check, weeklyItemId: _wid, dayNumber, onUpdate }: DayCellProps) {
  const [open, setOpen] = useState(false);
  const nextStatus = (check.status + 1) % 3;
  const style = statusColors[check.status] ?? statusColors[0];

  const handleClick = () => {
    onUpdate({
      date: check.date,
      status: nextStatus,
      minutes: check.minutes,
      note: check.note,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onDoubleClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className={`min-h-[44px] w-full rounded-lg border text-left text-sm transition-colors ${style} px-2 py-1.5`}
        title="Click to cycle status, double-click to edit note/minutes"
      >
        <span className="block truncate">
          {check.minutes != null && check.minutes > 0 && (
            <span className="font-medium">{check.minutes}m </span>
          )}
          {check.note && (
            <span className="text-stone-600 truncate">{check.note}</span>
          )}
        </span>
      </button>
      {open && (
        <CellEditPopover
          check={check}
          dayNumber={dayNumber}
          onSave={(minutes, note) => {
            onUpdate({
              date: check.date,
              status: check.status,
              minutes: minutes ?? check.minutes,
              note: note ?? check.note,
            });
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface CellEditPopoverProps {
  check: GridCheck;
  dayNumber: number;
  onSave: (minutes: number | null, note: string | null) => void;
  onClose: () => void;
}

function CellEditPopover({ check, dayNumber, onSave, onClose }: CellEditPopoverProps) {
  const [minutes, setMinutes] = useState<string>(
    check.minutes != null ? String(check.minutes) : ''
  );
  const [note, setNote] = useState(check.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = minutes.trim() === '' ? null : parseInt(minutes, 10);
    const n = note.trim() || null;
    onSave(Number.isNaN(m as number) ? null : m, n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-medium text-stone-800">
          Day {dayNumber}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">
              Minutes
            </label>
            <input
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="e.g. 30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-500">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              placeholder="Short note"
              maxLength={200}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-stone-800 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

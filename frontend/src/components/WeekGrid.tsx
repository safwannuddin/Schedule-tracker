import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DayCell } from './DayCell';
import { WeekHeader, WeekHeaderTitle } from './WeekHeader';
import type { GridItem, WeekGridResponse } from '../api/types';
import { upsertCheck } from '../api/checkApi';

interface WeekGridProps {
  data: WeekGridResponse;
}

function rowProgress(item: GridItem): number {
  let score = 0;
  for (const c of item.checks) {
    if (c.status === 1) score += 1;
    else if (c.status === 2) score += 0.5;
  }
  return score / 7;
}

function weekProgress(items: GridItem[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((acc, item) => acc + rowProgress(item), 0);
  return total / items.length;
}

export function WeekGrid({ data }: WeekGridProps) {
  const queryClient = useQueryClient();
  const weekId = data.week.id;

  const mutation = useMutation({
    mutationFn: upsertCheck,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['weekGrid', weekId] });
      const prev = queryClient.getQueryData<WeekGridResponse>(['weekGrid', weekId]);
      if (!prev) return { prev };
      const next: WeekGridResponse = {
        ...prev,
        items: prev.items.map((item) => {
          if (item.id !== payload.weekly_item_id) return item;
          return {
            ...item,
            checks: item.checks.map((c) =>
              c.date === payload.date
                ? {
                    ...c,
                    status: payload.status,
                    minutes: payload.minutes ?? c.minutes,
                    note: payload.note ?? c.note,
                  }
                : c
            ),
          };
        }),
      };
      queryClient.setQueryData(['weekGrid', weekId], next);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['weekGrid', weekId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['weekGrid', weekId] });
    },
  });

  const totalProgress = weekProgress(data.items);

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/80 px-4 py-3">
        <WeekHeaderTitle weekStart={data.week.week_start_date} />
        <div className="text-sm text-stone-500">
          Week progress:{' '}
          <span className="font-medium text-stone-700">
            {Math.round(totalProgress * 100)}%
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <WeekHeader weekStart={data.week.week_start_date} />
        <div className="divide-y divide-stone-100">
          {data.items.map((item) => {
            const progress = rowProgress(item);
            return (
              <div
                key={item.id}
                className="grid grid-cols-8 gap-0 border-b border-stone-100 last:border-b-0"
              >
                <div className="sticky left-0 z-10 flex items-center gap-2 border-r border-stone-200 bg-white px-3 py-2">
                  <span className="truncate font-medium text-stone-800">
                    {item.name}
                  </span>
                  <span
                    className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                    title="Progress"
                  >
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                {item.checks.map((check) => (
                  <div
                    key={check.date}
                    className="border-r border-stone-100 p-1.5 last:border-r-0"
                  >
                    <DayCell
                      check={check}
                      weeklyItemId={item.id}
                      onUpdate={(payload) =>
                        mutation.mutate({
                          weekly_item_id: item.id,
                          date: payload.date,
                          status: payload.status,
                          minutes: payload.minutes,
                          note: payload.note,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


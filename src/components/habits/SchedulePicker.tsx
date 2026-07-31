'use client';

import { ScheduleType } from '@/types';
import { cn } from '@/lib/utils';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface ScheduleValue {
  scheduleType: ScheduleType;
  scheduleDays: number[];
  timesPerWeek: number;
}

interface SchedulePickerProps {
  value: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
}

const OPTIONS: { v: ScheduleType; l: string }[] = [
  { v: 'daily', l: 'Daily' },
  { v: 'weekdays', l: 'Weekdays' },
  { v: 'weekend', l: 'Weekends' },
  { v: 'custom', l: 'Pick days' },
  { v: 'timesPerWeek', l: 'N×/week' },
];

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const { scheduleType, scheduleDays, timesPerWeek } = value;

  const toggleDay = (i: number) => {
    onChange({
      ...value,
      scheduleDays: scheduleDays.includes(i)
        ? scheduleDays.filter(d => d !== i)
        : [...scheduleDays, i].sort(),
    });
  };

  return (
    <div className="space-y-3">
      {/* Schedule type */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {OPTIONS.map(opt => (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange({ ...value, scheduleType: opt.v })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              scheduleType === opt.v
                ? 'bg-[#4F6BED] text-white'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {opt.l}
          </button>
        ))}
      </div>

      {/* Custom day picker */}
      {scheduleType === 'custom' && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
            Select days
          </label>
          <div className="flex gap-1.5">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                  scheduleDays.includes(i)
                    ? 'bg-[#4F6BED] text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Times per week picker */}
      {scheduleType === 'timesPerWeek' && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Times per week
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ ...value, timesPerWeek: n })}
                className={cn(
                  'w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                  timesPerWeek === n
                    ? 'bg-[#4F6BED] text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

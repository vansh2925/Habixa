'use client';

import { cn } from '@/lib/utils';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export function MoodPicker({ value, onChange }: { value?: number; onChange: (mood: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {MOODS.map(m => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          title={m.label}
          className={cn(
            'text-lg leading-none transition-all duration-150 hover:scale-110',
            value === m.value ? 'scale-110' : 'opacity-40 grayscale hover:opacity-70'
          )}
        >
          {m.emoji}
        </button>
      ))}
    </div>
  );
}

export function moodEmoji(mood?: number): string | null {
  if (!mood) return null;
  return MOODS.find(m => m.value === mood)?.emoji ?? null;
}

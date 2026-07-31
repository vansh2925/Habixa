import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendPush } from '@/lib/push';
import { isHabitScheduledOnDate, countScheduledDaysInMonth } from '@/lib/schedule';
import { getDaysInMonth } from '@/lib/date-utils';

// Vercel Cron calls this endpoint. It computes each user's "left today" and
// sends a push to their subscriptions if the reminder time has passed today.
export async function GET(request: Request) {
  // Vercel Cron sends a CRON_SECRET header — validate it if configured.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = createServiceClient();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const nowHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // All reminders that are enabled and due (time passed, not sent today)
    const { data: reminders, error: remErr } = await supabase
      .from('reminders')
      .select('*')
      .eq('enabled', true)
      .or(`last_sent_date.is.null,last_sent_date.lt.${todayStr}`)
      .lt('time', nowHM); // due: reminder time already passed

    if (remErr) throw remErr;
    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0 });
    }

    // Load all subscriptions + habits + entries in one pass
    const { data: subs } = await supabase.from('push_subscriptions').select('*');
    const { data: habits } = await supabase.from('habits').select('*');
    const { data: entries } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('date', todayStr);

    let sent = 0;
    let skipped = 0;
    const staleIds: string[] = [];

    for (const reminder of reminders) {
      const userId = reminder.user_id;
      const userSubs = (subs || []).filter(s => s.user_id === userId);
      if (userSubs.length === 0) { skipped++; continue; }

      const userHabits = (habits || []).filter(h => h.user_id === userId && h.is_active);
      const today = new Date();
      const scheduled = userHabits.filter(h => isHabitScheduledOnDate(h, today));
      const doneIds = new Set(
        (entries || []).filter(e => e.user_id === userId && e.completed).map(e => e.habit_id)
      );
      const left = scheduled.filter(h => !doneIds.has(h.id));

      // Build message
      let title: string;
      let body: string;
      if (left.length === 0) {
        title = 'All done today! 🎉';
        body = `You crushed all ${scheduled.length} scheduled habits. Enjoy your evening.`;
      } else {
        title = `${left.length} habit${left.length > 1 ? 's' : ''} left today`;
        body = left.slice(0, 4).map(h => h.name).join(', ') + (left.length > 4 ? ` +${left.length - 4} more` : '');
      }

      for (const sub of userSubs) {
        const result = await sendPush(sub, { title, body, url: '/' });
        if (result.ok) sent++;
        if (result.gone) staleIds.push(sub.id);
      }

      // Mark reminder as sent today (avoid re-sending)
      await supabase
        .from('reminders')
        .update({ last_sent_date: todayStr })
        .eq('user_id', userId);
    }

    // Clean up expired subscriptions
    if (staleIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', staleIds);
    }

    return NextResponse.json({ sent, skipped, cleaned: staleIds.length });
  } catch (e) {
    console.error('Cron reminder error:', e);
    return NextResponse.json({ error: 'Reminder cron failed' }, { status: 500 });
  }
}

import webpush from 'web-push';

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
}

// Lazy-init web-push with VAPID keys (server-side only)
let configured = false;
export function getWebPush() {
  if (!configured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.');
    }
    webpush.setVapidDetails(
      'mailto:vanshdobariya2925@gmail.com',
      publicKey,
      privateKey
    );
    configured = true;
  }
  return webpush;
}

// Send a push to a single subscription. Returns true if sent, false if gone (expired).
export async function sendPush(
  sub: Pick<PushSubscriptionRecord, 'endpoint' | 'keys_p256dh' | 'keys_auth'>,
  payload: { title: string; body: string; url?: string }
): Promise<{ ok: boolean; gone: boolean }> {
  try {
    await getWebPush().sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true, gone: false };
  } catch (err: unknown) {
    const code = (err as { statusCode?: number })?.statusCode;
    // 404/410 means the subscription is gone — clean it up
    if (code === 404 || code === 410) return { ok: false, gone: true };
    console.error('sendPush error:', code, err);
    return { ok: false, gone: false };
  }
}

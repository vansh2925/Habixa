'use client';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Register the service worker (idempotent)
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.error('SW registration failed:', e);
    return null;
  }
}

// Is push fully supported in this browser?
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await registerServiceWorker();
  if (!reg) return null;
  return await reg.pushManager.getSubscription();
}

// Request permission and subscribe. Returns the subscription or null.
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const reg = await registerServiceWorker();
  if (!reg) return null;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.error('VAPID public key not set');
    return null;
  }

  return await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

// Convert base64url VAPID key to Uint8Array (what PushManager expects)
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Persist the subscription to Supabase for the current user
export async function saveSubscription(sub: PushSubscription): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const subData = sub.toJSON() as {
    endpoint: string;
    keys?: { p256dh: string; auth: string };
  };

  // Remove old subscription for this endpoint first (idempotent upsert-ish)
  await supabase.from('push_subscriptions').delete().eq('endpoint', subData.endpoint);

  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: user.id,
    endpoint: subData.endpoint,
    keys_p256dh: subData.keys?.p256dh ?? '',
    keys_auth: subData.keys?.auth ?? '',
  });

  if (error) {
    console.error('saveSubscription error:', error);
    return false;
  }
  return true;
}

// Unsubscribe and remove from Supabase
export async function unsubscribeFromPush(): Promise<boolean> {
  const reg = await registerServiceWorker();
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    // Remove from Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      } catch { /* ignore */ }
    }
  }
  return true;
}

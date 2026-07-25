import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return NextResponse.json({
    urlSet: !!(url && !url.includes('your-project')),
    keySet: !!(key && !key.includes('your-anon')),
    urlHost: url ? new URL(url).hostname : 'not-set',
  });
}

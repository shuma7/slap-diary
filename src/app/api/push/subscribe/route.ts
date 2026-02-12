import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase-server';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('購読登録に失敗:', error);
      return NextResponse.json({ error: '登録に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('購読登録エラー:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

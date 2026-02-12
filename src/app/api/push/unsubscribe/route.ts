import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase-server';

export async function POST(request: Request) {
  try {
    const { endpoint } = await request.json();

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('購読解除に失敗:', error);
      return NextResponse.json({ error: '解除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('購読解除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

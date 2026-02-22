import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import webpush from 'web-push';
import { createServerSupabaseClient } from '@/utils/supabase-server';

export async function GET(request: Request) {
  // VAPID設定（ランタイムで初期化）
  webpush.setVapidDetails(
    'mailto:slapdiary@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  // Vercel Cron Jobの認証チェック
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // CRON_SECRETが未設定の場合はスキップ（開発中）
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = createServerSupabaseClient();

    // 最近7日分の日記を取得
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: diaries, error: diaryError } = await supabase
      .from('diaries')
      .select('*')
      .gte('date', dateStr)
      .order('date', { ascending: true });

    if (diaryError) {
      console.error('日記の取得に失敗:', diaryError);
      return NextResponse.json({ error: '日記の取得に失敗' }, { status: 500 });
    }

    if (!diaries || diaries.length === 0) {
      return NextResponse.json({ message: '日記がありません' });
    }

    // Gemini APIでレポート生成
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const diaryText = diaries.map(d => {
      const moodText = d.mood ? `気分:${d.mood}/5` : '';
      const condText = d.condition ? `体調:${d.condition}/5` : '';
      const meta = [moodText, condText].filter(Boolean).join(' ');
      return `【${d.date}】${meta}\n${d.content}`;
    }).join('\n\n');

    const prompt = `あなたは優しくて気の利く日記アシスタントです。
以下はユーザーの最近1週間の日記です。この日記を読んで、ユーザーに寄り添った短いモーニングメッセージを作成してください。

ルール:
- 100文字以内で簡潔に
- 昨日や最近の出来事に触れつつ、今日も良い一日になるよう励ます
- 絵文字を1-2個使って親しみやすく
- 体調や気分の変化があれば気遣う

日記:
${diaryText}`;

    const result = await model.generateContent(prompt);
    const report = result.response.text();

    // プッシュ通知を送信
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      console.error('購読者の取得に失敗:', subError);
      return NextResponse.json({ error: '購読者の取得に失敗', detail: String(subError.message) }, { status: 500 });
    }

    const payload = JSON.stringify({
      title: 'slapDiary - おはようレポート',
      body: report,
      icon: '/diaryicon-192x192.png',
    });

    const sendResults = await Promise.allSettled(
      (subscriptions || []).map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          },
          payload
        )
      )
    );

    // 失敗した購読を削除（期限切れなど）
    for (let i = 0; i < sendResults.length; i++) {
      if (sendResults[i].status === 'rejected') {
        const sub = subscriptions![i];
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint);
      }
    }

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      report,
      notificationsSent: successCount,
      totalSubscriptions: subscriptions?.length || 0,
    });
  } catch (error) {
    console.error('デイリーレポートエラー:', error);
    return NextResponse.json({ error: 'レポート生成に失敗', detail: String(error) }, { status: 500 });
  }
}

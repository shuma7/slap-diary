import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 環境変数から Supabase の接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase クライアントのインスタンスを作成
// Database 型を指定することで、型安全なクエリが可能になる
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

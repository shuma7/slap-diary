/**
 * Diary Entry の型定義
 * 仕様書の SQL テーブル定義に基づく
 */
export interface Diary {
  id: number;
  created_at: string; // ISO 8601 形式の日時文字列
  date: string; // YYYY-MM-DD 形式の日付文字列
  content: string; // 本文（必須）
  mood: number | null; // 気分 (1-5)、NULL の場合は「一言メモ」扱い
  condition: number | null; // 体調 (1-5)、NULL の場合は「一言メモ」扱い
  updated_at: string | null; // 最終更新日時
}

/**
 * 新規作成時の型定義（id, created_at, updated_at は自動生成）
 */
export interface DiaryInsert {
  date?: string; // デフォルトは今日
  content: string;
  mood?: number | null;
  condition?: number | null;
}

/**
 * 更新時の型定義（すべてオプショナル）
 */
export interface DiaryUpdate {
  date?: string;
  content?: string;
  mood?: number | null;
  condition?: number | null;
}

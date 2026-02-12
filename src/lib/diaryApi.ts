import { supabase } from "@/utils/supabase";
import type { Diary, DiaryInsert, DiaryUpdate } from "@/types/diary";

/**
 * すべての日記エントリーを取得（新しい順）
 */
export async function getAllDiaries(): Promise<Diary[]> {
  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("日記の取得に失敗しました:", error);
    throw error;
  }

  return data || [];
}

/**
 * 新しい日記エントリーを作成
 */
export async function createDiary(entry: DiaryInsert): Promise<Diary> {
  const { data, error } = await supabase
    .from("diaries")
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error("日記の作成に失敗しました:", error);
    throw error;
  }

  return data;
}

/**
 * 日記エントリーを更新
 */
export async function updateDiary(
  id: number,
  updates: DiaryUpdate
): Promise<Diary> {
  const { data, error } = await supabase
    .from("diaries")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("日記の更新に失敗しました:", error);
    throw error;
  }

  return data;
}

/**
 * 日記エントリーを削除
 */
export async function deleteDiary(id: number): Promise<void> {
  const { error } = await supabase.from("diaries").delete().eq("id", id);

  if (error) {
    console.error("日記の削除に失敗しました:", error);
    throw error;
  }
}

/**
 * 日記をキーワードで検索
 */
export async function searchDiaries(keyword: string): Promise<Diary[]> {
  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .ilike("content", `%${keyword}%`)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("検索に失敗しました:", error);
    throw error;
  }

  return data || [];
}

/**
 * 「あの日」機能: 今日と同じ月日の過去エントリーを取得
 */
export async function getOnThisDay(): Promise<Diary[]> {
  const today = new Date();
  const month = today.getMonth() + 1; // 1-12
  const day = today.getDate(); // 1-31

  // SQL の EXTRACT 関数を使って月と日が一致するものを取得
  // 今年のデータは除外
  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .lt("date", `${today.getFullYear()}-01-01`) // 今年より前
    .order("date", { ascending: false });

  if (error) {
    console.error("「あの日」データの取得に失敗しました:", error);
    throw error;
  }

  // クライアント側で月日でフィルタリング
  const filtered = (data || []).filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() + 1 === month && entryDate.getDate() === day
    );
  });

  return filtered;
}

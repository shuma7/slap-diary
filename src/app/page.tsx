"use client";

import { useState, useEffect } from "react";
import { BookText, MessageSquare } from "lucide-react";
import DiaryEntryForm from "@/components/DiaryEntryForm";
import QuickMemoModal from "@/components/QuickMemoModal";
import Timeline from "@/components/Timeline";
import OnThisDay from "@/components/OnThisDay";
import { getAllDiaries, getOnThisDay } from "@/lib/diaryApi";
import type { Diary } from "@/types/diary";

export default function Home() {
  // 状態管理
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [entries, setEntries] = useState<Diary[]>([]);
  const [onThisDayEntries, setOnThisDayEntries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);

  // 初回読み込み時にデータを取得
  useEffect(() => {
    loadEntries();
    loadOnThisDayEntries();
  }, []);

  // Supabase からデータを取得
  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await getAllDiaries();
      setEntries(data);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
      alert("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 「あの日」のデータを取得
  const loadOnThisDayEntries = async () => {
    try {
      const data = await getOnThisDay();
      setOnThisDayEntries(data);
    } catch (error) {
      console.error("「あの日」データの取得に失敗しました:", error);
      // エラーが発生しても続行（表示しないだけ）
    }
  };

  // 新しいエントリーを追加（コールバック関数）
  const handleEntryAdded = (newEntry: Diary) => {
    setEntries([newEntry, ...entries]);
  };

  // エントリーを削除（コールバック関数）
  const handleEntryDeleted = (id: number) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-100">slapDiary</h1>
          <p className="text-sm text-gray-400">日記</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowEntryForm(!showEntryForm)}
            className={`flex-1 flex items-center justify-center gap-2 ${
              showEntryForm
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-semibold py-3 px-4 rounded-lg transition-colors`}
          >
            <BookText size={20} />
            <span>{showEntryForm ? "フォームを閉じる" : "日記"}</span>
          </button>
          <button
            onClick={() => setShowMemoModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <MessageSquare size={20} />
            <span>メモ</span>
          </button>
        </div>

        {/* 投稿フォーム（トグル表示） */}
        {showEntryForm && (
          <DiaryEntryForm
            onEntryAdded={handleEntryAdded}
            onClose={() => setShowEntryForm(false)}
          />
        )}

        {/* あの日（過去の今日） */}
        {!loading && <OnThisDay entries={onThisDayEntries} />}

        {/* タイムライン */}
        {loading ? (
          <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
            <div className="text-center text-gray-400 py-8">
              読み込み中...
            </div>
          </div>
        ) : (
          <Timeline entries={entries} onEntryDeleted={handleEntryDeleted} />
        )}

        {/* 一言メモモーダル */}
        <QuickMemoModal
          isOpen={showMemoModal}
          onClose={() => setShowMemoModal(false)}
          onEntryAdded={handleEntryAdded}
        />
      </main>
    </div>
  );
}

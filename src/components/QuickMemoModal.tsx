"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createDiary } from "@/lib/diaryApi";
import type { Diary } from "@/types/diary";

interface QuickMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryAdded: (entry: Diary) => void;
}

/**
 * 一言メモモーダル
 * 本文のみを素早く入力するためのシンプルなモーダル
 */
export default function QuickMemoModal({
  isOpen,
  onClose,
  onEntryAdded,
}: QuickMemoModalProps) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || saving) return;

    try {
      setSaving(true);

      // Supabase にデータを保存（気分・体調は null）
      const newEntry = await createDiary({
        content: content.trim(),
        mood: null,
        condition: null,
      });

      // 親コンポーネントに通知
      onEntryAdded(newEntry);

      // 送信後、フォームをリセットして閉じる
      setContent("");
      onClose();
    } catch (error) {
      console.error("保存に失敗しました:", error);
      alert("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  // モーダルが閉じている場合は何も表示しない
  if (!isOpen) return null;

  return (
    // 背景オーバーレイ（クリックで閉じる）
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* モーダル本体（クリックイベントの伝播を止める） */}
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">メモ</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今の気持ちを一言..."
            autoFocus
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />

          {/* ボタン */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!content.trim() || saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {saving ? "保存中..." : "記録"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

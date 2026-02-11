"use client";

import { useState, useEffect, useRef } from "react";
import { Smile, Heart } from "lucide-react";
import { createDiary, updateDiary } from "@/lib/diaryApi";
import type { Diary } from "@/types/diary";

interface DiaryEntryFormProps {
  onEntryAdded: (entry: Diary) => void;
  onClose: () => void;
}

/**
 * しっかり記録フォーム
 * 体調、気分、本文を入力できる詳細なフォーム
 * 日時は自動で記録される
 */
export default function DiaryEntryForm({ onEntryAdded, onClose }: DiaryEntryFormProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [condition, setCondition] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 自動保存処理
  const autoSave = async () => {
    if (!content.trim()) return;

    try {
      setSaving(true);

      if (currentEntryId) {
        // 既存のエントリーを更新
        await updateDiary(currentEntryId, {
          content: content.trim(),
          mood,
          condition,
        });
      } else {
        // 新規エントリーを作成（タイムラインには追加しない）
        const newEntry = await createDiary({
          content: content.trim(),
          mood,
          condition,
        });
        setCurrentEntryId(newEntry.id);
        // onEntryAdded は呼ばない（明示的な保存時のみタイムラインに追加）
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("自動保存に失敗しました:", error);
    } finally {
      setSaving(false);
    }
  };

  // 入力変更時の自動保存（Debounce: 2秒）
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    if (content.trim()) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, mood, condition]);

  // フォーム送信処理（即座に保存して閉じる）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || saving) return;

    // タイマーをクリア
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    try {
      setSaving(true);

      if (currentEntryId) {
        // 既存エントリーの最終更新
        const updatedEntry = await updateDiary(currentEntryId, {
          content: content.trim(),
          mood,
          condition,
        });
        onEntryAdded(updatedEntry);
      } else {
        // 新規作成
        const newEntry = await createDiary({
          content: content.trim(),
          mood,
          condition,
        });
        onEntryAdded(newEntry);
      }

      // フォームをリセット
      setContent("");
      setMood(null);
      setCondition(null);
      setCurrentEntryId(null);
      setLastSaved(null);

      // フォームを閉じる
      onClose();
    } catch (error) {
      console.error("保存に失敗しました:", error);
      alert("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-100">日記</h2>
        {lastSaved && (
          <span className="text-xs text-gray-500">
            {saving ? "保存中..." : `${lastSaved.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 保存済み`}
          </span>
        )}
      </div>

      {/* 体調選択 */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Heart size={16} className="text-emerald-400" />
          体調（任意）
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                setCondition(condition === level ? null : level)
              }
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                condition === level
                  ? "border-emerald-500 bg-emerald-900/50 text-emerald-300 font-semibold"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          1: とても悪い　→　5: とても良い
        </p>
      </div>

      {/* 気分選択 */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Smile size={16} className="text-blue-400" />
          気分（任意）
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setMood(mood === level ? null : level)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                mood === level
                  ? "border-blue-500 bg-blue-900/50 text-blue-300 font-semibold"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          1: とても悪い　→　5: とても良い
        </p>
      </div>

      {/* 本文入力 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          日記 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日はどんな日でしたか？"
          required
          rows={6}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!content.trim() || saving}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {saving ? "保存中..." : "記録する"}
      </button>
    </form>
  );
}

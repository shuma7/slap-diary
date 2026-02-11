"use client";

import { Smile, Heart, Calendar, Trash2 } from "lucide-react";
import { deleteDiary } from "@/lib/diaryApi";
import type { Diary } from "@/types/diary";

interface TimelineProps {
  entries: Diary[];
  onEntryDeleted: (id: number) => void;
}

// 気分を単語に変換
const getMoodText = (value: number): string => {
  const moodMap: { [key: number]: string } = {
    1: "とても悪い",
    2: "悪い",
    3: "普通",
    4: "良い",
    5: "とても良い",
  };
  return moodMap[value] || "不明";
};

// 体調を単語に変換
const getConditionText = (value: number): string => {
  const conditionMap: { [key: number]: string } = {
    1: "とても悪い",
    2: "悪い",
    3: "普通",
    4: "良い",
    5: "とても良い",
  };
  return conditionMap[value] || "不明";
};

/**
 * タイムライン表示コンポーネント
 * 日記エントリーのリストを新しい順に表示
 */
export default function Timeline({ entries, onEntryDeleted }: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          タイムライン
        </h2>
        <div className="text-center text-gray-500 py-8">
          まだ記録がありません
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        タイムライン
      </h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            onDelete={onEntryDeleted}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * タイムラインの個別エントリー
 */
function TimelineEntry({
  entry,
  onDelete,
}: {
  entry: Diary;
  onDelete: (id: number) => void;
}) {
  // 気分・体調がある場合は「日記」、ない場合は「メモ」
  const isQuickMemo = entry.mood === null && entry.condition === null;

  // 日付と時刻をフォーマット
  const createdDate = new Date(entry.created_at);
  const formattedDate = createdDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const formattedTime = createdDate.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 削除処理
  const handleDelete = async () => {
    if (!confirm("この記録を削除しますか？")) return;

    try {
      await deleteDiary(entry.id);
      onDelete(entry.id);
    } catch (error) {
      console.error("削除に失敗しました:", error);
      alert("削除に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${
        isQuickMemo
          ? "bg-gray-700/50 border-emerald-500"
          : "bg-gray-700/50 border-blue-500"
      }`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={14} />
          <span>
            {formattedDate} {formattedTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isQuickMemo
                ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
                : "bg-blue-900/50 text-blue-300 border border-blue-700"
            }`}
          >
            {isQuickMemo ? "メモ" : "日記"}
          </span>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-900/50 rounded transition-colors"
            title="削除"
          >
            <Trash2 size={16} className="text-gray-500 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* 気分・体調（本文の上に表示） */}
      {!isQuickMemo && (
        <div className="flex gap-4 text-sm mb-3">
          {entry.condition !== null && (
            <div className="flex items-center gap-1 text-gray-400">
              <Heart size={16} className="text-emerald-400" />
              <span>体調:</span>
              <span className="font-semibold text-emerald-300">
                {getConditionText(entry.condition)}
              </span>
            </div>
          )}
          {entry.mood !== null && (
            <div className="flex items-center gap-1 text-gray-400">
              <Smile size={16} className="text-blue-400" />
              <span>気分:</span>
              <span className="font-semibold text-blue-300">
                {getMoodText(entry.mood)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 本文 */}
      <p className="text-gray-200 whitespace-pre-wrap">{entry.content}</p>
    </div>
  );
}

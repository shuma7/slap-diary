"use client";

import { Smile, Heart, Calendar, Clock } from "lucide-react";
import type { Diary } from "@/types/diary";

interface OnThisDayProps {
  entries: Diary[];
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
 * 「あの日」表示コンポーネント
 * 過去の同じ月日に書いた日記を表示
 */
export default function OnThisDay({ entries }: OnThisDayProps) {
  // 今日の日付を取得
  const today = new Date();
  const todayFormatted = today.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
  });

  if (entries.length === 0) {
    return null; // データがない場合は何も表示しない
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg shadow-sm p-6 border border-purple-700/50">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-purple-300" />
        <h2 className="text-lg font-semibold text-purple-200">
          あの日（{todayFormatted}）
        </h2>
      </div>
      <p className="text-sm text-purple-300 mb-4">
        過去の今日、あなたはこんなことを書いていました
      </p>
      <div className="space-y-4">
        {entries.map((entry) => (
          <OnThisDayEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

/**
 * 「あの日」の個別エントリー
 */
function OnThisDayEntry({ entry }: { entry: Diary }) {
  // 気分・体調がある場合は「日記」、ない場合は「メモ」
  const isQuickMemo = entry.mood === null && entry.condition === null;

  // 日付と時刻をフォーマット
  const createdDate = new Date(entry.created_at);
  const yearAgo = new Date().getFullYear() - createdDate.getFullYear();
  const formattedDate = createdDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="p-4 rounded-lg bg-gray-800/70 border border-purple-500/30">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar size={14} />
          <span>{formattedDate}</span>
          <span className="text-purple-300 font-semibold">
            （{yearAgo}年前）
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isQuickMemo
              ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
              : "bg-blue-900/50 text-blue-300 border border-blue-700"
          }`}
        >
          {isQuickMemo ? "メモ" : "日記"}
        </span>
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

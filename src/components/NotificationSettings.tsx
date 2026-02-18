"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Send } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supported, setSupported] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setSupported(false);
        setLoading(false);
        return;
      }

      setSupported(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("通知状態の確認に失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    try {
      setLoading(true);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("通知の許可が必要です。ブラウザの設定を確認してください。");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        throw new Error("サーバーへの登録に失敗");
      }
    } catch (error) {
      console.error("通知の登録に失敗:", error);
      alert("通知の登録に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error("通知の解除に失敗:", error);
      alert("通知の解除に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const sendDebugReport = async () => {
    try {
      setDebugLoading(true);
      setDebugResult(null);
      const res = await fetch("/api/daily-report");
      const json = await res.json();
      if (json.report) {
        setDebugResult(json.report);
      } else {
        setDebugResult(JSON.stringify(json));
      }
    } catch (error) {
      setDebugResult(`エラー: ${error}`);
    } finally {
      setDebugLoading(false);
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={sendDebugReport}
          disabled={debugLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-900/50 text-purple-300 border border-purple-700 hover:bg-purple-900/70 disabled:opacity-50"
          title="デバッグ: レポートを今すぐ送信"
        >
          <Send size={16} />
          <span>{debugLoading ? "送信中..." : "テスト送信"}</span>
        </button>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSubscribed
              ? "bg-amber-900/50 text-amber-300 border border-amber-700 hover:bg-amber-900/70"
              : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
          } disabled:opacity-50`}
          title={isSubscribed ? "毎朝7:00のレポート通知をOFF" : "毎朝7:00のレポート通知をON"}
        >
          {isSubscribed ? <Bell size={16} /> : <BellOff size={16} />}
          <span>
            {loading
              ? "処理中..."
              : isSubscribed
              ? "朝のレポート ON"
              : "朝のレポート OFF"}
          </span>
        </button>
      </div>
      {debugResult && (
        <div className="max-w-xs text-xs text-purple-300 bg-purple-900/30 border border-purple-700 rounded-lg px-3 py-2 text-right">
          {debugResult}
        </div>
      )}
    </div>
  );
}

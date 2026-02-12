// プッシュ通知を受信した時の処理
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/diaryicon-192x192.png',
    badge: '/diaryicon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'slapdiary-daily-report',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'slapDiary', options)
  );
});

// 通知をクリックした時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 既存のウィンドウがあればフォーカス
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // なければ新しいウィンドウを開く
      return clients.openWindow('/');
    })
  );
});

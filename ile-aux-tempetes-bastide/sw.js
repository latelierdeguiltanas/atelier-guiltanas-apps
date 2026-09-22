self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url;
  if (!target) return;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windows) {
    for (const client of windows) {
      if ('focus' in client) {
        client.navigate(target);
        return client.focus();
      }
    }
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});

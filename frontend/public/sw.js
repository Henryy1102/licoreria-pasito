self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  const title = data.title || "Notificación";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo.jpeg",
    badge: data.badge || "/logo.jpeg",
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

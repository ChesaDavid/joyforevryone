self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.notification.title;
    event.waitUntil(
        self.registration.showNotification(title, {
            body: data.body,
            icon: '',
            data: data.url
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});
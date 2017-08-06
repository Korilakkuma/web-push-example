'use strict';

self.addEventListener('install', (event) => {
    event.waitUntil(skipWaiting());
}, false);

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
}, false);

self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const data  = event.data.json();
    const title = data.title;
    const body  = data.body;
    const icon  = data.icon;
    const url   = data.url;

    event.waitUntil(
        self.registration.showNotification(title, { body, icon, data: { url } })
    );
}, false);

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const url          = notification.data.url;

    event.waitUntil(self.clients.openWindow(url));
}, false);

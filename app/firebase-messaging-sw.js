/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// Handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCJ5qm_sCzkUfFGC8WcTGbjfviBz_SyNAg",
  authDomain: "teens-bible-94271.firebaseapp.com",
  projectId: "teens-bible-94271",
  storageBucket: "teens-bible-94271.firebasestorage.app",
  messagingSenderId: "226355097233",
  appId: "1:226355097233:web:838afede878c9915225930"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Teenz Bible';
  const notificationOptions = {
    body: payload.notification?.body || 'Time to read your Bible!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'reading-reminder',
    renotify: true,
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

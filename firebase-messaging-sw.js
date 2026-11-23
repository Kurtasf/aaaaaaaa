
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "tool-borrowing-system-f5a20.firebaseapp.com",
  projectId: "tool-borrowing-system-f5a20",
  storageBucket: "tool-borrowing-system-f5a20.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Tool Borrowing System";

  const options = {
    body: payload.notification?.body || "May bagong login sa website mo.",
    icon: "/favicon.ico"
  };

  self.registration.showNotification(title, options);
});


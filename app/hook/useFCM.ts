import { useEffect, useState } from "react";
import { messaging } from "@/app/firebase/config";

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!messaging || typeof window === "undefined") return;

    if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
        if (perm === "granted") {
          getToken();
        }
      });
    } else if (Notification.permission === "granted") {
      setPermission("granted");
      getToken();
    } else {
      setPermission(Notification.permission);
    }

    async function getToken() {
      try {
        if(!messaging) return;
        const { getToken } = await import("firebase/messaging");
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
        });
        setToken(currentToken);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      }
    }
  }, []);

  return { token, permission, error };
}
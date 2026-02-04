const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const pushService = {
  async getPublicKey() {
    const response = await fetch(`${API_URL}/api/push/vapid-public-key`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "No se pudo obtener la clave pública");
    }
    const data = await response.json();
    return data.publicKey;
  },

  async subscribe() {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker no soportado");
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Permiso de notificaciones denegado");
    }

    const publicKey = await this.getPublicKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al suscribir push");
    }

    return subscription;
  },

  async unsubscribe() {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service Worker no soportado");
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/api/push/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Error al desuscribir push");
    }
  },
};

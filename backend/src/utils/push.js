import webPush from "web-push";
import PushSubscription from "../models/PushSubscription.js";
import User from "../models/Users.js";

const configureWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@licoreria.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  return true;
};

const buildPayload = ({ titulo, mensaje, icono, url }) =>
  JSON.stringify({
    title: titulo || "Notificación",
    body: mensaje || "",
    icon: "/logo.jpeg",
    badge: "/logo.jpeg",
    data: {
      url: url || "/",
      icono: icono || "🔔",
    },
  });

export const sendPushToUser = async (userId, payload) => {
  if (!configureWebPush()) return;

  const subs = await PushSubscription.find({ usuario: userId });
  if (!subs.length) return;

  const body = buildPayload(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(sub.subscription, body);
      } catch (error) {
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    })
  );
};

export const sendPushToAdmins = async (payload) => {
  if (!configureWebPush()) return;

  const admins = await User.find({ rol: "admin" }).select("_id");
  if (!admins.length) return;

  const adminIds = admins.map((a) => a._id);
  const subs = await PushSubscription.find({ usuario: { $in: adminIds } });
  if (!subs.length) return;

  const body = buildPayload(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(sub.subscription, body);
      } catch (error) {
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    })
  );
};

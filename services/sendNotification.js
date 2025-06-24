const admin = require("../config/firebaseAdmin");

async function sendNotification(fcmToken, title, body) {
  if (!fcmToken) {
    console.warn("No FCM token provided, notification skipped.");
    return;
  }

  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
    android: {
      priority: "high",
    },
    apns: {
      headers: {
        "apns-priority": "10",
      },
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

module.exports = sendNotification;

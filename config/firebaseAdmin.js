var admin = require("firebase-admin");
require("dotenv").config();

var serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;

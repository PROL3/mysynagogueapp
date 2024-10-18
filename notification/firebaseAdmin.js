const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Update the path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
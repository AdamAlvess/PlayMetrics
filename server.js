const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

// Configuration Firebase avec variables d'environnement
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.database();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "Html")));
app.use(express.static(path.join(__dirname, "Css")));
app.use(express.static(path.join(__dirname, "Js")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Html", "home.html"));
});

app.get("/metrics/:userID", (req, res) => {
  const { userID } = req.params;
  db.ref(`sensor-data/${userID}`).once("value", snapshot => {
    res.json(snapshot.val());
  });
});

app.post("/start-training", (req, res) => {
  const { userID } = req.body;
  db.ref(`play/${userID}`).set(true);
  res.send(`🏋️ Entraînement lancé pour ${userID}`);
});

app.post("/stop-training", (req, res) => {
  const { userID } = req.body;
  db.ref(`play/${userID}`).set(false);
  res.send(`🛑 Entraînement arrêté pour ${userID}`);
});

const TEST_USER_ID = "testUser1";
function initTestUser(userID) {
  db.ref(`sensor-data/${userID}`).once("value", snapshot => {
    if (!snapshot.exists()) {
      db.ref(`sensor-data/${userID}`).set({ accel: 0, chutes: 0, pompes: 0, tractions: 0 });
    }
  });
  db.ref(`play/${userID}`).once("value", snapshot => {
    if (!snapshot.exists()) {
      db.ref(`play/${userID}`).set(false);
    }
  });
}
initTestUser(TEST_USER_ID);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = require("./playmetrics-24a7b-firebase-adminsdk-tsmcf-3265079754.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playmetrics-24a7b-default-rtdb.europe-west1.firebasedatabase.app/",
});

const db = admin.database();
const app = express();

app.use(cors());
app.use(express.json()); // important si tu veux lire req.body

// 🌐 Exposer le dossier avec tes fichiers HTML
const path = require("path");
app.use(express.static(path.join(__dirname, "Html")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Html", "home.html"));
});

// Endpoint pour obtenir les données d'un utilisateur spécifique
app.get("/metrics/:userID", (req, res) => {
  const { userID } = req.params;
  db.ref(`sensor-data/${userID}`).once("value", snapshot => {
    const data = snapshot.val();
    console.log(`📦 Données reçues pour ${userID}:`, data);
    res.json(data);
  });
});

// Endpoint pour démarrer l'entraînement
app.post("/start-training", (req, res) => {
  const { userID } = req.body;
  db.ref(`play/${userID}`).set(true);
  res.send(`🏋️ Entraînement lancé pour ${userID}`);
});

// Endpoint pour arrêter l'entraînement
app.post("/stop-training", (req, res) => {
  const { userID } = req.body;
  db.ref(`play/${userID}`).set(false);
  res.send(`🛑 Entraînement arrêté pour ${userID}`);
});

// --- 🔧 Initialisation utilisateur de test ---
const TEST_USER_ID = "testUser1";

function initTestUser(userID) {
  db.ref(`sensor-data/${userID}`).once("value", snapshot => {
    if (!snapshot.exists()) {
      db.ref(`sensor-data/${userID}`).set({
        accel: 0,
        chutes: 0,
        pompes: 0,
        tractions: 0
      }, err => {
        if (!err) console.log(`✅ sensor-data/${userID} initialisé`);
      });
    }
  });

  db.ref(`play/${userID}`).once("value", snapshot => {
    if (!snapshot.exists()) {
      db.ref(`play/${userID}`).set(false, err => {
        if (!err) console.log(`✅ play/${userID} initialisé`);
      });
    }
  });
}

initTestUser(TEST_USER_ID);

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

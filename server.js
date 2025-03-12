const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require("./playmetrics-24a7b-firebase-adminsdk-tsmcf-3265079754.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playmetrics-24a7b-default-rtdb.europe-west1.firebasedatabase.app/",
});

const db = admin.database();
const app = express();

app.use(cors());

// 🔥 Sert les fichiers statiques dans le dossier 'Html' + 'Css' + 'Js'
app.use(express.static(path.join(__dirname, "Html")));
app.use("/Css", express.static(path.join(__dirname, "Css")));
app.use("/Js", express.static(path.join(__dirname, "Js")));

// 📄 Route principale qui sert la page home.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Html", "home.html"));
});

// 📡 Route API
app.get("/metrics", (req, res) => {
  db.ref("sensor-data").once("value", (snapshot) => {
    const data = snapshot.val();
    console.log("📦 Données reçues de Firebase :", data);
    res.json(data);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

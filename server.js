const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const admin = require("firebase-admin");

// 🔥 Configuration Firebase avec variables d'environnement
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

const db = new sqlite3.Database("./users.db");
const app = express();

// Création de la table des utilisateurs
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`);

// Configuration des sessions
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Mettre `true` en HTTPS
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Html")));
app.use(express.static(path.join(__dirname, "Css")));
app.use(express.static(path.join(__dirname, "Js")));

// Middleware pour vérifier l'authentification
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  next();
}

// 🚀 Redirection automatique vers login si non connecté
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/home.html");
  } else {
    res.redirect("/login.html");
  }
});

// 🚀 Route d'inscription
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
    if (err) {
      return res.status(400).send("❌ Nom d'utilisateur déjà pris.");
    }
    res.redirect("/login.html");
  });
});

// 🚀 Route de connexion
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) {
      return res.status(400).send("❌ Utilisateur non trouvé.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("❌ Mot de passe incorrect.");
    }

    req.session.user = user;
    res.redirect("/home.html");
  });
});

// 🚀 Route de déconnexion
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// 🚀 Pages sécurisées
app.get("/home.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "Html", "home.html"));
});

app.get("/contact.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "Html", "contact.html"));
});

// 🚀 Ajout du nom de l'utilisateur à la navigation
app.get("/user-info", (req, res) => {
  if (!req.session.user) {
    return res.json({ loggedIn: false });
  }
  res.json({ loggedIn: true, username: req.session.user.username });
});

// 🚀 Route pour fournir la config Firebase au frontend
app.get("/firebase-config", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});

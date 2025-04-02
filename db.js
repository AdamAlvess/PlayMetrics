const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: '195.7.117.146',
  user: 'admi1',
  password: 'ydays',
  database: 'users'
});

db.connect(err => {
  if (err) {
    console.error("❌ Erreur de connexion MySQL :", err);
    return;
  }
  console.log("✅ Connecté à MySQL !");
});

module.exports = db;

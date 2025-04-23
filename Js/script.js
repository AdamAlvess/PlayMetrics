async function init() {
  const response = await fetch('/firebase-config');
  const firebaseConfig = await response.json();
  
  if (firebaseConfig) {
    firebase.initializeApp(firebaseConfig);

    // 🔐 Récupération des infos de l'utilisateur connecté
    const userResponse = await fetch('/user-info');
    const userData = await userResponse.json();

    if (!userData.loggedIn) {
      console.error("Utilisateur non connecté !");
      return;
    }

    const userId = userData.username; // On récupère le nom d'utilisateur (doit correspondre à la clé Firebase)

    // 🔥 Récupération des données Firebase pour cet utilisateur
    const db = firebase.database();
    const userSensorDataRef = db.ref(`sensor-data/player${userId}`);

    userSensorDataRef.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("🔥 Données reçues de l'utilisateur :", data);

      document.getElementById("accel").textContent = data?.accel ?? "--";
      document.getElementById("tractions").textContent = data?.tractions ?? "--";
      document.getElementById("pompes").textContent = data?.pompes ?? "--";
      document.getElementById("chutes").textContent = data?.chutes ?? "--";
    });

    // Affichage du nom de l'utilisateur dans le header
    document.getElementById("username-display").textContent = `Bienvenue, player${userId} !`;

  } else {
    console.error("Firebase config invalide ou non récupérée.");
  }
}

init();


// === Gestion du menu burger ===
document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.getElementById('menuButton');
  const popup = document.getElementById('popup');

  menuButton.addEventListener('click', function () {
    popup.classList.toggle('show');
  });

  window.addEventListener('click', function (event) {
    if (!event.target.matches('#menuButton')) {
      if (popup.classList.contains('show')) {
        popup.classList.remove('show');
      }
    }
  });
});

// === Changement d'unité (vitesse) ===
document.getElementById("unitSelect")?.addEventListener("change", function () {
  const unit = this.value;
  document.getElementById("speedValue").innerText = `0 ${unit}`;
});

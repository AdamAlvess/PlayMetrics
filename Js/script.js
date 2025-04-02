async function init() {
  const response = await fetch('/firebase-config');
  const firebaseConfig = await response.json();
  console.log(firebaseConfig);  // Vérifie la config reçue dans la console
  
  if (firebaseConfig) {
    firebase.initializeApp(firebaseConfig);

    // Récupération des infos utilisateur (nom d'utilisateur ou ID)
    const userResponse = await fetch('/user-info');
    const userData = await userResponse.json();

    if (!userData.loggedIn) {
      console.error("Utilisateur non connecté !");
      return;
    }

    const userId = userData.username;  // Tu utilises ici le nom d'utilisateur comme ID
    
    // Utilisation de l'ID pour accéder aux données spécifiques de l'utilisateur
    const db = firebase.database();
    const userSensorDataRef = db.ref(`sensor-data/testUser${userId}`);  // Utilise l'ID de l'utilisateur pour récupérer ses données

    userSensorDataRef.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("🔥 Données reçues de l'utilisateur :", data);

      document.getElementById("accel").textContent = data?.accel ?? "--";
      document.getElementById("tractions").textContent = data?.tractions ?? "--";
      document.getElementById("pompes").textContent = data?.pompes ?? "--";
      document.getElementById("chutes").textContent = data?.chutes ?? "--";
    });
  } else {
    console.error("Firebase config invalide ou non récupéré");
  }
}

init();
  

// popup de navigation
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menuButton');
    const popup = document.getElementById('popup');

    menuButton.addEventListener('click', function() {
        popup.classList.toggle('show');
    });

    window.addEventListener('click', function(event) {
        if (!event.target.matches('#menuButton')) {
            if (popup.classList.contains('show')) {
                popup.classList.remove('show');
            }
        }
    });
});

// Changement d'unité
document.getElementById("unitSelect").addEventListener("change", function() {
    const unit = this.value;
    document.getElementById("speedValue").innerText = `0 ${unit}`;
});

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

async function init() {
  const response = await fetch('/firebase-config');
  const firebaseConfig = await response.json();
  firebase.initializeApp(firebaseConfig);

  const db = firebase.database();
  const sensorDataRef = db.ref("sensor-data");

  sensorDataRef.on("value", (snapshot) => {
    const data = snapshot.val();
    console.log("🔥 Données reçues :", data);

    document.getElementById("accel").textContent = data?.accel ?? "--";
    document.getElementById("tractions").textContent = data?.tractions ?? "--";
    document.getElementById("pompes").textContent = data?.pompes ?? "--";
    document.getElementById("chutes").textContent = data?.chutes ?? "--";
  });
}
  
init();
  
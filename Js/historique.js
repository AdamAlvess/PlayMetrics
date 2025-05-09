async function loadHistorique() {
  const response = await fetch('/firebase-config');
  const config = await response.json();

  firebase.initializeApp(config);

  const userRes = await fetch('/user-info');
  const userData = await userRes.json();

  if (!userData.loggedIn) {
    window.location.href = "/login.html";
    return;
  }

  document.getElementById("username-display").textContent = `👤 ${userData.username}`;

  const userId = userData.id;
  const db = firebase.database();
  const objectifsRef = db.ref(`objectifs/player${userId}`);
  const seancesRef = db.ref(`sensor-data/player${userId}`);

  // === Charger les objectifs existants ===
  objectifsRef.once("value", snap => {
    const objectifs = snap.val() || {};
    document.getElementById("obj-tractions").value = objectifs.tractions || "";
    document.getElementById("obj-pompes").value = objectifs.pompes || "";
    document.getElementById("obj-chutes").value = objectifs.chutes || "";
    document.getElementById("obj-squat").value = objectifs.squat || "";
  });

  // === Charger les données de séances ===
  seancesRef.once("value", (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById("historique-container");

    if (!data) {
      container.innerHTML = "<p>Aucune séance enregistrée.</p>";
      return;
    }

    const keys = Object.keys(data).filter(k => k.startsWith("seance")).sort((a, b) => {
      const na = parseInt(a.replace("seance", ""));
      const nb = parseInt(b.replace("seance", ""));
      return na - nb;
    });

    // === Construction du tableau ===
    let html = `
      <table class="historique-table">
        <thead>
          <tr>
            <th>Séance</th>
            <th>Squat</th>
            <th>Tractions</th>
            <th>Pompes</th>
            <th>Chutes</th>
          </tr>
        </thead>
        <tbody>
    `;

    keys.forEach(key => {
      const entry = data[key];
      html += `
        <tr>
          <td>${parseInt(key.replace("seance", ""))}</td>
          <td>${entry.squat ?? '--'}</td>
          <td>${entry.tractions ?? '--'}</td>
          <td>${entry.pompes ?? '--'}</td>
          <td>${entry.chutes ?? '--'}</td>
        </tr>
      `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
  });

  // === Gestion du formulaire d’objectifs ===
  document.getElementById("objectif-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const newObj = {
      tractions: parseInt(document.getElementById("obj-tractions").value),
      pompes: parseInt(document.getElementById("obj-pompes").value),
      chutes: parseInt(document.getElementById("obj-chutes").value),
      squat: parseInt(document.getElementById("obj-squat").value)
    };
    objectifsRef.set(newObj).then(() => {
      alert("🎯 Objectifs mis à jour ! Refresh la page pour voir les modifs");
      location.reload();
    });
  });

  // === Gestion du bouton de suppression ===
  const deleteBtn = document.getElementById("delete-sessions-btn");
  const confirmationPopup = document.getElementById("confirmation-popup");
  const confirmDeleteBtn = document.getElementById("confirm-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");

  deleteBtn.addEventListener("click", () => {
    confirmationPopup.style.display = "block";
  });

  cancelDeleteBtn.addEventListener("click", () => {
    confirmationPopup.style.display = "none";
  });

  confirmDeleteBtn.addEventListener("click", () => {
    // Supprimer les données de Firebase
    seancesRef.remove().then(() => {
      alert("Toutes les séances ont été supprimées.");
      location.reload();
    }).catch((error) => {
      alert("Erreur lors de la suppression des séances : " + error.message);
    });
    confirmationPopup.style.display = "none";
  });
}

loadHistorique();

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

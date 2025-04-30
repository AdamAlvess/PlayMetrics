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
      document.getElementById("obj-accel").value = objectifs.accel || "";
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
              <th>Accélérations</th>
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
            <td>${entry.accel ?? '--'}</td>
            <td>${entry.tractions ?? '--'}</td>
            <td>${entry.pompes ?? '--'}</td>
            <td>${entry.chutes ?? '--'}</td>
          </tr>
        `;
      });
  
      html += "</tbody></table>";
      container.innerHTML = html;
  
      // === Charger les objectifs et générer les graphes ===
      objectifsRef.once("value", (snap) => {
        const objectifs = snap.val() || {};
        const labels = keys.map(k => `Séance ${parseInt(k.replace("seance", ""))}`);
  
        const extract = (key) => keys.map(k => data[k][key] ?? 0);
  
        const drawChart = (canvasId, label, dataset, objectif) => {
          const ctx = document.getElementById(canvasId).getContext("2d");
          new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: label,
                  data: dataset,
                  borderColor: 'blue',
                  fill: false
                },
                {
                  label: 'Objectif',
                  data: new Array(dataset.length).fill(objectif ?? 0),
                  borderColor: 'red',
                  borderDash: [5, 5],
                  fill: false
                }
              ]
            },
            options: {
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: 'white'
                    }
                  }
                },
                layout: {
                  padding: 10
                },
                scales: {
                  x: {
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    }
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255,255,255,0.1)'
                    }
                  }
                },
                backgroundColor: '#2c3e50'
              }              
              
          });
        };
  
        drawChart("chart-tractions", "Tractions", extract("tractions"), objectifs.tractions);
        drawChart("chart-pompes", "Pompes", extract("pompes"), objectifs.pompes);
        drawChart("chart-chutes", "Chutes", extract("chutes"), objectifs.chutes);
        drawChart("chart-accel", "Accélérations", extract("accel"), objectifs.accel);
      });
    });
  
    // === Gestion du formulaire d’objectifs ===
    document.getElementById("objectif-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const newObj = {
        tractions: parseInt(document.getElementById("obj-tractions").value),
        pompes: parseInt(document.getElementById("obj-pompes").value),
        chutes: parseInt(document.getElementById("obj-chutes").value),
        accel: parseInt(document.getElementById("obj-accel").value)
      };
      objectifsRef.set(newObj).then(() => {
        alert("🎯 Objectifs mis à jour !");
        location.reload(); // recharge toute la page

      });
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
  
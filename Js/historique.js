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
    const ref = db.ref(`sensor-data/player${userId}`);
  
    ref.once("value", (snapshot) => {
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
    });
  }
  
  loadHistorique();
  
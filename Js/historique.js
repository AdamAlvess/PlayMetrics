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
  
      let html = "<ul>";
      keys.forEach(key => {
        const entry = data[key];
        html += `
          <li>
            <strong>Séance ${parseInt(key.replace("seance", ""))} :</strong>
            Accélérations : ${entry.accel ?? '--'}, 
            Tractions : ${entry.tractions ?? '--'}, 
            Pompes : ${entry.pompes ?? '--'}, 
            Chutes : ${entry.chutes ?? '--'}
          </li>
        `;
      });
      html += "</ul>";
  
      container.innerHTML = html;
    });
  }
  
  loadHistorique();
  
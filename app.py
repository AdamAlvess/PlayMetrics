from flask import Flask, render_template, send_from_directory, jsonify, request
import requests

app = Flask(__name__)

# Adresse de votre serveur cloud (API Flask hébergée)
CLOUD_SERVER_URL = "http://15.188.57.159/api/sensors"

# URL de l'API hébergée

@app.route('/')
def index():
    try:
        # Récupérer les données de l'API
        response = requests.get(CLOUD_SERVER_URL)
        response.raise_for_status()
        data = response.json()  # Charger les données JSON
    except requests.exceptions.RequestException as e:
        data = {"error": str(e)}

    # Passer les données au template
    return render_template('home.html', data=data)


# Route pour récupérer toutes les données des capteurs depuis le serveur cloud
@app.route('/get-sensor-data', methods=['GET'])
def get_sensor_data():
    """
    Récupère les données brutes des capteurs depuis l'API cloud.
    """
    try:
        # Requête GET vers le serveur cloud
        response = requests.get(CLOUD_SERVER_URL)
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "success": True,
                "data": data
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"Erreur du serveur cloud : {response.status_code}"
            }), response.status_code
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erreur lors de la requête : {str(e)}"
        }), 500

# Route pour récupérer des données filtrées par type de capteur
@app.route('/get-sensor-data/<sensor_type>', methods=['GET'])
def get_filtered_data(sensor_type):
    """
    Récupère les données filtrées par type de capteur.
    """
    try:
        # Requête GET vers le serveur cloud
        response = requests.get(CLOUD_SERVER_URL)
        if response.status_code == 200:
            all_data = response.json()
            # Filtrer les données par type de capteur
            filtered_data = [d for d in all_data if d.get("sensor_type") == sensor_type]
            return jsonify({
                "success": True,
                "data": filtered_data
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": f"Erreur du serveur cloud : {response.status_code}"
            }), response.status_code
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erreur lors de la requête : {str(e)}"
        }), 500
        
@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/home')
def home():
    return render_template('home.html')


# Route pour afficher les données dans une page HTML
@app.route('/display-sensors', methods=['GET'])
def display_sensors():
    """
    Affiche toutes les données des capteurs sur une page HTML.
    """
    try:
        # Requête GET vers le serveur cloud
        response = requests.get(CLOUD_SERVER_URL)
        if response.status_code == 200:
            data = response.json()
            return render_template('sensors.html', data=data)
        else:
            return render_template('error.html', message=f"Erreur du serveur cloud : {response.status_code}")
    except Exception as e:
        return render_template('error.html', message=f"Erreur lors de la requête : {str(e)}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
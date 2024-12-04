from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from config import Config
from models import db, SensorData

app = Flask(__name__)
app.config.from_object(Config)

# Initialiser la base de données
db.init_app(app)

# Modèle pour stocker les logs des requêtes
class RequestLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sensor_type = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Créer les tables si elles n'existent pas
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return "Bienvenue sur l'API de stockage des données des capteurs !"

# Route pour recevoir les données des capteurs (via POST)
@app.route('/api/sensors', methods=['POST'])
def receive_sensor_data():
    if request.method == 'POST':
        # Récupérer les données envoyées en JSON
        data = request.get_json()
        
        # Vérifier que les données JSON sont valides et contiennent les champs nécessaires
        if not data:
            return jsonify({"error": "No data provided"}), 400
        if 'sensor_type' not in data or 'value' not in data:
            return jsonify({"error": "Invalid data format. 'sensor_type' and 'value' are required."}), 400

        sensor_type = data.get('sensor_type')
        value = data.get('value')
        unit = data.get('unit')  # Récupère l'unité optionnelle

        # Validation supplémentaire pour s'assurer que la valeur est numérique
        try:
            value = float(value)
        except ValueError:
            return jsonify({"error": "'value' must be a number"}), 400

        # Créer une nouvelle entrée dans la base de données pour les données du capteur
        new_data = SensorData(
            sensor_type=sensor_type,
            value=value,
            unit=unit,  # Ajoute l'unité
            timestamp=datetime.utcnow()
        )

        # Créer une nouvelle entrée dans la base de données pour enregistrer le log de la requête
        request_log = RequestLog(
            sensor_type=sensor_type,
            value=value,
            unit=unit,
            timestamp=datetime.utcnow()
        )

        # Ajouter et valider dans la base de données
        try:
            db.session.add(new_data)
            db.session.add(request_log)  # Ajouter le log de la requête
            db.session.commit()
            return jsonify({"message": "Data received and logged successfully"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to store data", "details": str(e)}), 500

# Route pour récupérer toutes les données des capteurs (via GET)
@app.route('/api/sensors', methods=['GET'])
def get_sensor_data():
    try:
        # Récupérer toutes les données des capteurs
        all_data = SensorData.query.all()
        result = [
            {
                "id": data.id,
                "sensor_type": data.sensor_type,
                "value": data.value,
                "unit": data.unit,  # Inclure l'unité dans la réponse
                "timestamp": data.timestamp.isoformat()
            } for data in all_data
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve data", "details": str(e)}), 500

# Route pour récupérer les logs des requêtes (optionnel)
@app.route('/api/sensor-logs', methods=['GET'])
def get_request_logs():
    try:
        # Récupérer tous les logs des requêtes
        all_logs = RequestLog.query.all()
        log_result = [
            {
                "id": log.id,
                "sensor_type": log.sensor_type,
                "value": log.value,
                "unit": log.unit,
                "timestamp": log.timestamp.isoformat()
            } for log in all_logs
        ]
        return jsonify(log_result), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve request logs", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

import requests
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# Configuration pour la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///backend_logs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modèle pour stocker les logs des requêtes envoyées à l'API principale
class BackendRequestLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)  # Exemple : 'GET', 'POST'
    endpoint = db.Column(db.String(100), nullable=False)  # Exemple : '/api/sensors'
    status_code = db.Column(db.Integer, nullable=False)
    response_time = db.Column(db.Float, nullable=False)  # Temps de réponse en secondes
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Créer les tables dans la base de données si elles n'existent pas
with app.app_context():
    db.create_all()

# URL de l'API principale
API_URL = "http://127.0.0.1:5000/api/sensors"

# Route pour récupérer les données de l'API principale
@app.route('/backend/get-sensors', methods=['GET'])
def get_sensors():
    try:
        # Envoi de la requête GET à l'API principale
        start_time = datetime.utcnow()
        response = requests.get(API_URL)
        response_time = (datetime.utcnow() - start_time).total_seconds()

        # Enregistrer le log de la requête dans la base de données
        request_log = BackendRequestLog(
            action='GET',
            endpoint='/api/sensors',
            status_code=response.status_code,
            response_time=response_time
        )
        db.session.add(request_log)
        db.session.commit()

        # Vérification et retour de la réponse
        if response.status_code == 200:
            return jsonify({"message": "Data retrieved successfully", "data": response.json()}), 200
        else:
            return jsonify({"error": "Failed to retrieve data", "details": response.text}), response.status_code
    except Exception as e:
        return jsonify({"error": "An error occurred while retrieving data", "details": str(e)}), 500

# Route pour envoyer de nouvelles données à l'API principale
@app.route('/backend/post-sensor', methods=['POST'])
def post_sensor():
    try:
        # Récupérer les données envoyées dans la requête POST
        data = request.get_json()
        if not data or 'sensor_type' not in data or 'value' not in data:
            return jsonify({"error": "Invalid data format. 'sensor_type' and 'value' are required."}), 400

        # Envoi de la requête POST à l'API principale
        start_time = datetime.utcnow()
        response = requests.post(API_URL, json=data)
        response_time = (datetime.utcnow() - start_time).total_seconds()

        # Enregistrer le log de la requête dans la base de données
        request_log = BackendRequestLog(
            action='POST',
            endpoint='/api/sensors',
            status_code=response.status_code,
            response_time=response_time
        )
        db.session.add(request_log)
        db.session.commit()

        # Vérification et retour de la réponse
        if response.status_code == 201:
            return jsonify({"message": "Data sent successfully", "data": response.json()}), 201
        else:
            return jsonify({"error": "Failed to send data", "details": response.text}), response.status_code
    except Exception as e:
        return jsonify({"error": "An error occurred while sending data", "details": str(e)}), 500

# Route pour afficher les logs des requêtes envoyées par le backend
@app.route('/backend/logs', methods=['GET'])
def get_backend_logs():
    try:
        # Récupérer tous les logs de la base de données
        logs = BackendRequestLog.query.all()
        log_result = [
            {
                "id": log.id,
                "action": log.action,
                "endpoint": log.endpoint,
                "status_code": log.status_code,
                "response_time": log.response_time,
                "timestamp": log.timestamp.isoformat()
            } for log in logs
        ]
        return jsonify({"message": "Logs retrieved successfully", "logs": log_result}), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve logs", "details": str(e)}), 500

# Route pour afficher toutes les routes disponibles (utile pour le débogage)
@app.route('/backend/routes', methods=['GET'])
def list_routes():
    try:
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                "endpoint": rule.endpoint,
                "methods": list(rule.methods),
                "rule": str(rule)
            })
        return jsonify({"message": "Routes retrieved successfully", "routes": routes}), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve routes", "details": str(e)}), 500

# Gestionnaire pour les erreurs 404 (route non trouvée)
@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "Route not found", "details": str(e)}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
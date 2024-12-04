# 1. Utiliser une image de base avec Python 3.9
FROM python:3.9

# 2. Définir le répertoire de travail dans le conteneur
WORKDIR /app

# 3. Copier le fichier requirements.txt dans le conteneur
COPY requirements.txt requirements.txt

# 4. Installer les dépendances depuis requirements.txt
RUN pip install -r requirements.txt

# 5. Copier tous les fichiers de l'application dans le conteneur
COPY . .

# 6. Exposer le port sur lequel l'application va tourner
EXPOSE 5000

# 7. Définir la commande pour lancer l'application
CMD ["python", "app.py"]

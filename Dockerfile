# Utiliser une image officielle Node.js comme base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package.json ./

# Installer les dépendances
RUN npm install --only=production

# Copier le reste du projet
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 3000

# Définir la commande pour démarrer l'application
CMD ["npm", "start"]

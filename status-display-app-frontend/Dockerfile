# 1. Build-Stage: Erstelle die Angular-App
FROM node:alpine AS build

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json, um nur relevante Schritte zu invalidieren
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest des Codes und führe den Build aus
COPY . .
# Führe den Build aus
RUN npm run build -- --configuration production

# 2. Runtime-Stage: Nutze Nginx zur Auslieferung
FROM nginx:alpine

# Kopiere die gebauten Dateien aus der Build-Stage in den Webroot von Nginx
COPY --from=build /usr/src/app/dist/status-display-app/browser /usr/share/nginx/html

# Exponiere Port 80 für die Auslieferung
EXPOSE 80

# Standard-Befehl: Starte Nginx
CMD ["nginx", "-g", "daemon off;"]

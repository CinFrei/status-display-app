const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Authentifizierung mit dem Dienstkonto
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json', // Pfad zur JSON-Datei
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'], // Nur lesender Zugriff
});

app.get('/api/calendar', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const response = await calendar.events.list({
      calendarId: process.env.CALENDAR_ID, // Dein Kalender
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Logge die gesamte Antwort
    console.log('API Response:', response.data);

    // Rückgabe der Event-Liste
    res.json(response.data.items || []); // Leere Liste, falls keine Events vorhanden sind
  } catch (error) {
    // Logge den Fehler
    console.error('Fehler beim Abrufen der Kalenderdaten:', error);

    // Sende Fehlermeldung an den Client
    res.status(500).send('Fehler beim Abrufen der Kalenderdaten');
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});

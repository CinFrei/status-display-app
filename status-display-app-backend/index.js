const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

// Authentifizierung mit dem Dienstkonto
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json', // Pfad zur JSON-Datei
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'], // Nur lesender Zugriff
});

function getTimeRange() {
  const now = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(now.getDate() + 14);

  return {
    timeMin: now.toISOString(),
    timeMax: twoWeeksLater.toISOString()
  };
}

app.get('/api/calendar', async (req, res) => {
  const { timeMin, timeMax } = getTimeRange();

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarIds = [
      process.env.CALENDAR_ID, // Primary
      process.env.BIRTHSDAYS_CALENDAR_ID, // Birthdays
      'de.german#holiday@group.v.calendar.google.com', // Hollidays
      process.env.MOON_CALENDAR_ID // Moonphase
    ];

    const allEvents = [];
    for (const id of calendarIds) {
      const response = await calendar.events.list({
        calendarId: id,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });
      allEvents.push(...(response.data.items || []));
    }

    // Nach Datum sortieren
    allEvents.sort((a, b) =>
      new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date)
    );

    res.json(allEvents);
  } catch (error) {
    console.error('Fehler beim Abrufen der Kalenderdaten:', error);
    res.status(500).send('Fehler beim Abrufen der Kalenderdaten');
  }
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf http://localhost:${PORT}`);
});

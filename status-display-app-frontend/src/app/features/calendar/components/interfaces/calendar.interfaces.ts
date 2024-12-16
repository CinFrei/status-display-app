export interface CalendarEvent {
  created: string; // Datum der Erstellung
  creator: Creator; // Creator-Objekt
  description: string; // Event-Beschreibung
  end: EventDate; // Enddatum
  etag: string; // ETag für das Event
  eventType: string; // Typ des Events
  htmlLink: string; // Link zum Event
  iCalUID: string; // iCal-UID
  id: string; // Event-ID
  kind: string; // Event-Typ
  organizer: Creator; // Organizer-Objekt
  sequence: number; // Versionsnummer des Events
  start: EventDate; // Startdatum
  status: string; // Status des Events
  summary: string; // Zusammenfassung des Events
  transparency: string; // Transparenz des Events
  updated: string; // Letzte Aktualisierung
  visibility: string; // Sichtbarkeit des Events
}

export interface Creator {
  email: string; // Email des Erstellers
  displayName: string; // Name des Erstellers
  self: boolean; // Ob der Ersteller der Benutzer selbst ist
}

export interface EventDate {
  date: string; // Datum des Events (z.B. "2024-12-15")
  dateTime?: string; // (Optional) Datum und Uhrzeit des Events im ISO-Format
}


export interface TransformedEvent {
  day: string;
  date: string;
  title: string;
  time: string;
  icon: string;
}

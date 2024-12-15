export interface CalendarEvent {
  start: {
    date: string | undefined; dateTime?: string
  };
  summary: string;
  calendarId: string; // ID des Kalenders, aus dem das Event stammt
}

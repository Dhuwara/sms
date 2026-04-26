import { google } from 'googleapis';

export const createGoogleMeetLink = async ({ title, date, time, durationMinutes = 60 }) => {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!credentialsJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is not set');

  const credentials = JSON.parse(credentialsJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  const event = {
    summary: title,
    start: { dateTime: startDateTime.toISOString(), timeZone: 'Asia/Kolkata' },
    end: { dateTime: endDateTime.toISOString(), timeZone: 'Asia/Kolkata' },
    conferenceData: {
      createRequest: {
        requestId: `sms-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });

  const meetLink = response.data.hangoutLink;
  if (!meetLink) throw new Error('Google did not return a Meet link — ensure Calendar API is enabled');

  return meetLink;
};

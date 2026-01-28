import { google } from 'googleapis';
import path from 'path';
import fs from 'fs/promises';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  
  // This triggers a local server flow (might not work headless on Pi without forwarding)
  // For initial setup, run this locally on Mac.
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists details of upcoming events for the rest of the day.
 */
export async function getTodaysEvents() {
  try {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = res.data.items || [];

    return events.map((event: any) => {
        const isAllDay = !!event.start.date;
        const startTime = isAllDay ? null : new Date(event.start.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        const endTime = isAllDay ? null : new Date(event.end.dateTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

        return {
            title: event.summary,
            location: event.location,
            isAllDay,
            startTime,
            endTime,
        };
    });
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return [];
  }
}

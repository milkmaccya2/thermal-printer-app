
import { getTodaysEvents } from '../src/utils/googleCalendar';

async function main() {
  console.log('🔑 Starting Google Authentication Flow...');
  console.log('This script will attempt to connect to Google Calendar.');
  console.log('If this is the first time, a browser window should open asking you to log in.');
  console.log('If you are in a headless environment, look for a URL in the console output.');
  
  try {
    const events = await getTodaysEvents();
    console.log('-----------------------------------');
    console.log('✅ Authentication successful!');
    console.log(`📅 Found ${events.length} events for today.`);
    console.log('🔑 Token has been saved to "token.json".');
    console.log('-----------------------------------');
  } catch (error) {
    console.error('❌ Authentication failed:', error);
  }
}

main();

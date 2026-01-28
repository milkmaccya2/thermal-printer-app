
import { getTodaysEvents } from './src/utils/googleCalendar';

async function test() {
  try {
    console.log('Fetching events...');
    const events = await getTodaysEvents();
    console.log('Events:', JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();

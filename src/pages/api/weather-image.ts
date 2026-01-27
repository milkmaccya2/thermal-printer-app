
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async () => {
  // Script writes to public/images/weather-today.png
  // We read from there to get the latest runtime version
  const filePath = path.join(process.cwd(), 'public', 'images', 'weather-today.png');
  
  try {
    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      }
    });
  } catch (e) {
    return new Response('Weather image not found', { status: 404 });
  }
}

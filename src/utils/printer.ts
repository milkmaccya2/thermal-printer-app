import { ditherGrayscale } from './ditheringCore';

/**
 * Applies Floyd-Steinberg dithering to a grayscale image.
 * Uses Int16Array to handle error propagation without clamping too early.
 * 
 * @param input Raw grayscale buffer
 * @param width Image width
 * @param height Image height
 * @returns Dithered 1-bit pixel array (0=black, 255=white)
 */
export function applyFloydSteinberg(input: Buffer, width: number, height: number): Uint8Array {
    return ditherGrayscale(new Uint8Array(input), width, height);
}

/**
 * Converts 1-bit pixel array to ESC/POS Raster Format (GS v 0).
 * 
 * @param pixels 1-bit pixel array (0=black, 255=white)
 * @param width Image width
 * @param height Image height
 * @returns Buffer containing ESC/POS command and raster data
 */
export function createEscPosRaster(pixels: Uint8Array, width: number, height: number): Buffer {
    // Command: GS v 0 m xL xH yL yH d1...dk
    const widthBytes = Math.ceil(width / 8);
    const header = Buffer.from([
        0x1d, 0x76, 0x30, 0x00, 
        widthBytes & 0xff, (widthBytes >> 8) & 0xff,
        height & 0xff, (height >> 8) & 0xff
    ]);
    
    // Pack pixels into bytes
    const rasterBuffer = Buffer.alloc(widthBytes * height);
    rasterBuffer.fill(0);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // For thermal printers, bit 1 usually means "burn" (black).
            // Our pixels: 0=black, 255=white.
            if (pixels[y * width + x] === 0) {
                const byteIndex = y * widthBytes + Math.floor(x / 8);
                const bitIndex = 7 - (x % 8);
                rasterBuffer[byteIndex] |= (1 << bitIndex);
            }
        }
    }

    return Buffer.concat([header, rasterBuffer]);
}

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
    // Copy input to Int16Array to prevent overflow/wrapping during error distribution
    // 0-255 range, but error propagation can make values go outside temporarily
    const pixels = new Int16Array(input);
    const output = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const oldVal = pixels[idx];
            
            // Threshold pixel (0 or 255)
            // Pure black < 128 < Pure white
            const newVal = oldVal < 128 ? 0 : 255;
            
            // In our logic for thermal printer: 
            // We want 1-bit output where 0 and 255 are kept as is for now.
            // We'll map them to bits later (0 -> 1(print), 255 -> 0(empty))
            pixels[idx] = newVal;
            output[idx] = newVal;
            
            const error = oldVal - newVal;
            
            // Distribute error to neighbors
            // (7, 3, 5, 1) / 16
            if (x + 1 < width) pixels[idx + 1] += (error * 7) >> 4;
            if (y + 1 < height && x - 1 >= 0) pixels[idx + width - 1] += (error * 3) >> 4;
            if (y + 1 < height) pixels[idx + width] += (error * 5) >> 4;
            if (y + 1 < height && x + 1 < width) pixels[idx + width + 1] += (error * 1) >> 4;
        }
    }
    return output;
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

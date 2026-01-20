/**
 * Core Floyd-Steinberg dithering algorithm.
 * Operates on a single-channel grayscale pixel array.
 * 
 * @param pixels Input grayscale pixel data (modified in-place or copied)
 * @param width Image width
 * @param height Image height
 * @returns 1-bit dithered array (0=black, 255=white)
 */
export function ditherGrayscale(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number): Uint8Array {
    // We use Int16Array for calculation to handle error overflow temporarily
    // Copying input is safer to avoid mutating original implementation data if it matters,
    // although for performance in-place is often preferred. 
    // Here we create a working copy to ensure clean error propagation.
    const scratch = new Int16Array(pixels.length);
    for (let i = 0; i < pixels.length; i++) {
        scratch[i] = pixels[i];
    }
    
    const output = new Uint8Array(pixels.length);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const oldVal = scratch[idx];
            
            // Threshold
            const newVal = oldVal < 128 ? 0 : 255;
            
            output[idx] = newVal;
            // Also update scratch for future error diff (though once passed, not strictly needed, but useful if re-read)
            scratch[idx] = newVal; 
            
            const error = oldVal - newVal;
            
            // Distribute error to 4 neighbors
            // Right
            if (x + 1 < width) {
                scratch[idx + 1] += (error * 7) >> 4;
            }
            // Bottom-Left
            if (y + 1 < height && x - 1 >= 0) {
                scratch[idx + width - 1] += (error * 3) >> 4;
            }
            // Bottom
            if (y + 1 < height) {
                scratch[idx + width] += (error * 5) >> 4;
            }
            // Bottom-Right
            if (y + 1 < height && x + 1 < width) {
                scratch[idx + width + 1] += (error * 1) >> 4;
            }
        }
    }
    
    return output;
}

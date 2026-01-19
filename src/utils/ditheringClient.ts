/**
 * Client-side utility for image processing (monochrome dithering).
 * Simulates the server-side Sharp/Floyd-Steinberg process using Canvas API.
 */

export const processImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 1. Setup Canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // 2. Resize Logic (Match server: width = 576px)
                const targetWidth = 576;
                const scale = targetWidth / img.width;
                const targetHeight = Math.round(img.height * scale);

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Draw resized image (white background for transparency)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // 3. Get Pixel Data for Dithering
                const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
                const data = imageData.data; // RGBA array

                // 4. Floyd-Steinberg Dithering
                // Convert to grayscale and dither in place
                // Note: We'll operate on the R channel for grayscale value and update RGB
                
                const width = targetWidth;
                const height = targetHeight;

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const i = (y * width + x) * 4;
                        
                        // Convert to grayscale (luminance)
                        // r*0.299 + g*0.587 + b*0.114
                        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        const oldVal = gray;
                        
                        // Threshold
                        const newVal = oldVal < 128 ? 0 : 255;
                        
                        // Set pixel to black or white
                        data[i] = newVal;     // R
                        data[i + 1] = newVal; // G
                        data[i + 2] = newVal; // B
                        // Alpha remains 255 (fully opaque)
                        
                        const error = oldVal - newVal;

                        // Distribute error
                        // Right
                        if (x + 1 < width) {
                            distributeError(data, (y * width + (x + 1)) * 4, error * 7 / 16);
                        }
                        // Bottom-Left
                        if (y + 1 < height && x - 1 >= 0) {
                            distributeError(data, ((y + 1) * width + (x - 1)) * 4, error * 3 / 16);
                        }
                        // Bottom
                        if (y + 1 < height) {
                            distributeError(data, ((y + 1) * width + x) * 4, error * 5 / 16);
                        }
                        // Bottom-Right
                        if (y + 1 < height && x + 1 < width) {
                            distributeError(data, ((y + 1) * width + (x + 1)) * 4, error * 1 / 16);
                        }
                    }
                }

                // 5. Update Canvas with dithered data
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = reject;
            // Handle Type Error for string | ArrayBuffer
            if (typeof e.target?.result === 'string') {
                 img.src = e.target.result;
            } else {
                 reject(new Error('Failed to load image data'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

function distributeError(data: Uint8ClampedArray, index: number, errorAmount: number) {
    // We add error to RGB channels. 
    // Since we are converting to grayscale on the fly in the loop, 
    // we just apply the error to RGB channels so next pixels pick it up in grayscale calc.
    // However, simplest way for grayscale dither loop is to assume RGB are synced.
    // But here we haven't grayscaled the whole image first.
    // To do it correctly in one pass:
    // We modify the *brightness* of neighbors. 
    // A simple approximation is adding to all channels.
    
    data[index] = Math.min(255, Math.max(0, data[index] + errorAmount));
    data[index + 1] = Math.min(255, Math.max(0, data[index + 1] + errorAmount));
    data[index + 2] = Math.min(255, Math.max(0, data[index + 2] + errorAmount));
}

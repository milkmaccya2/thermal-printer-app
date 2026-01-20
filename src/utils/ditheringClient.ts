/**
 * Client-side utility for image processing (monochrome dithering).
 * Simulates the server-side Sharp/Floyd-Steinberg process using Canvas API.
 */

export const processImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
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
                // Convert to grayscale first for the core logic
                const width = targetWidth;
                const height = targetHeight;
                const grayscalePixels = new Uint8ClampedArray(width * height);
                
                for (let i = 0; i < width * height; i++) {
                    const r = data[i * 4];
                    const g = data[i * 4 + 1];
                    const b = data[i * 4 + 2];
                    // Standard luminance
                    grayscalePixels[i] = r * 0.299 + g * 0.587 + b * 0.114;
                }

                const { ditherGrayscale } = await import('./ditheringCore');
                const dithered = ditherGrayscale(grayscalePixels, width, height);

                // Map back to RGBA (0 -> Black, 255 -> White)
                for (let i = 0; i < width * height; i++) {
                    const val = dithered[i];
                    const idx = i * 4;
                    data[idx] = val;     // R
                    data[idx + 1] = val; // G
                    data[idx + 2] = val; // B
                    // Alpha (data[idx+3]) remains unchanged
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

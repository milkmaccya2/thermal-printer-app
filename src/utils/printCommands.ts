/**
 * Generates the ESC/POS command buffer for feeding paper and cutting.
 * Default behavior: Feed 4 lines then cut.
 */
export function getCutCommand(): Buffer {
    // Feed 4 lines (0x0A * 4) + GS V 66 0 (Cut)
    return Buffer.from([
        0x0A, 0x0A, 0x0A, 0x0A, 
        0x1d, 0x56, 0x42, 0x00 
    ]);
}

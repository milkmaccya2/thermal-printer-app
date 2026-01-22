import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getPrinterStatusFromOS } from '../utils/printerStatus';

const execAsync = promisify(exec);

export const queueActions = {
  /**
   * Retrieves current printer status and job queue from the OS (lpstat).
   */
  getPrinterStatus: defineAction({
    accept: 'json',
    handler: async () => {
      try {
        const { status, jobs } = await getPrinterStatusFromOS();
        return { success: true, jobs, status };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  }),
  
  /**
   * Cancels a specific print job by ID.
   */
  cancelJob: defineAction({
    accept: 'json',
    input: z.object({ jobId: z.string() }),
    handler: async ({ jobId }) => {
        try {
            await execAsync(`cancel "${jobId}"`);
            return { success: true, message: `Job ${jobId} canceled` };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
  }),

  /**
   * Cancels ALL jobs in the print queue.
   */
  clearQueue: defineAction({
    accept: 'json',
    handler: async () => {
        try {
            await execAsync('cancel -a');
            return { success: true, message: 'All jobs canceled' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
  }),

  /**
   * Re-enables the printer (cupsenable).
   * Often needed if the printer pauses due to error.
   */
  enablePrinter: defineAction({
    accept: 'json',
    handler: async () => {
        try {
            await execAsync('cupsenable $(lpstat -p | cut -d " " -f 2)');
            return { success: true, message: 'Printers enabled' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
  }),
};

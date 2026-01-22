import { printerActions } from './printer';
import { queueActions } from './queue';

/**
 * Server Actions for Thermal Printer App.
 * Aggregates actions from `printer.ts` and `queue.ts`.
 */
export const server = {
  ...printerActions,
  ...queueActions,
};

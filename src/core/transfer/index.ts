import type { TransferSimulationInput, TransferSimulationResult } from './types';
import { simulateTransfer } from './models';

export * from './types';
export { simulateTransfer } from './models';

export function runTransferSimulation(input: TransferSimulationInput): TransferSimulationResult {
  return simulateTransfer(input);
}

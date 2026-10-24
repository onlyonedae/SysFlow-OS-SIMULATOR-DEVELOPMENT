import type { DiskSimulationInput, DiskSimulationResult } from './types';
import { simulateFCFS } from './fcfs';
import { simulateSSTF } from './sstf';
import { simulateSCAN, simulateCSCAN } from './scan';
import { simulateLOOK, simulateCLOOK } from './look';

export * from './types';
export { simulateFCFS } from './fcfs';
export { simulateSSTF } from './sstf';
export { simulateSCAN, simulateCSCAN } from './scan';
export { simulateLOOK, simulateCLOOK } from './look';

export type DiskAlgorithm = 'FCFS' | 'SSTF' | 'SCAN' | 'C-SCAN' | 'LOOK' | 'C-LOOK';

export function runDiskSimulation(algorithm: DiskAlgorithm, input: DiskSimulationInput): DiskSimulationResult {
  switch (algorithm) {
    case 'FCFS':
      return simulateFCFS(input);
    case 'SSTF':
      return simulateSSTF(input);
    case 'SCAN':
      return simulateSCAN(input);
    case 'C-SCAN':
      return simulateCSCAN(input);
    case 'LOOK':
      return simulateLOOK(input);
    case 'C-LOOK':
      return simulateCLOOK(input);
    default:
      return simulateFCFS(input);
  }
}

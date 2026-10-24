import type { BufferingSimulationInput, BufferingSimulationResult } from './types';
import { simulateBuffering } from './models';

export * from './types';
export { simulateBuffering } from './models';

export function runBufferingSimulation(input: BufferingSimulationInput): BufferingSimulationResult {
  return simulateBuffering(input);
}

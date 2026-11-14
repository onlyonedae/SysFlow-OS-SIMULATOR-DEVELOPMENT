import type { DiskSimulationInput } from './types';
import { DEFAULT_SEEK_TIME_PER_CYLINDER } from './index';

export function sanitizeDiskInput(input: DiskSimulationInput): DiskSimulationInput {
  const minTrack = Math.max(0, Math.floor(Number(input.minTrack) || 0));
  const maxTrack = Math.max(minTrack + 1, Math.floor(Number(input.maxTrack) || 199));
  const initialHead = Math.min(maxTrack, Math.max(minTrack, Math.floor(Number(input.initialHead) || 0)));
  const seekTimePerCylinder = Math.max(0.001, Number(input.seekTimePerCylinder) || DEFAULT_SEEK_TIME_PER_CYLINDER);

  const cleanRequests = (input.requests || [])
    .map(r => Math.floor(Number(r)))
    .filter(r => !isNaN(r) && r >= minTrack && r <= maxTrack);

  return {
    ...input,
    minTrack,
    maxTrack,
    initialHead,
    seekTimePerCylinder,
    requests: cleanRequests
  };
}

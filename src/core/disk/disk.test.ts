import { describe, it, expect } from 'vitest';
import { simulateFCFS } from './fcfs';
import { simulateSSTF } from './sstf';
import { simulateSCAN, simulateCSCAN } from './scan';
import { simulateLOOK, simulateCLOOK } from './look';
import type { DiskSimulationInput } from './types';

describe('Penjadwalan Disk - Uji Kasus Buku Teks Silberschatz', () => {
  const textbookInput: DiskSimulationInput = {
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    initialHead: 53,
    minTrack: 0,
    maxTrack: 199,
    direction: 'left', // arah menuju 0
    countJumpReturn: true,
    seekTimePerCylinder: 0.5
  };

  it('Algoritma FCFS harus menghasilkan total pergerakan 640', () => {
    const result = simulateFCFS(textbookInput);
    expect(result.metrics.totalHeadMovement).toBe(640);
  });

  it('Algoritma SSTF harus menghasilkan total pergerakan 236', () => {
    const result = simulateSSTF(textbookInput);
    expect(result.metrics.totalHeadMovement).toBe(236);
  });

  it('Algoritma SCAN (arah awal ke 0) harus menghasilkan total pergerakan 236', () => {
    const result = simulateSCAN(textbookInput);
    expect(result.metrics.totalHeadMovement).toBe(236);
  });

  it('Algoritma LOOK (arah awal ke 0) harus menghasilkan total pergerakan 208', () => {
    const result = simulateLOOK(textbookInput);
    expect(result.metrics.totalHeadMovement).toBe(208);
  });

  it('Algoritma C-SCAN dengan arah ke kanan dan lompatan dihitung', () => {
    const cscanInput: DiskSimulationInput = {
      ...textbookInput,
      direction: 'right',
      countJumpReturn: true
    };
    const resultWithJump = simulateCSCAN(cscanInput);
    // 53 -> 65, 67, 98, 122, 124, 183, 199 (146) + jump 199->0 (199) + 0->14, 37 (37) = 382
    expect(resultWithJump.metrics.totalHeadMovement).toBe(382);

    const resultWithoutJump = simulateCSCAN({
      ...cscanInput,
      countJumpReturn: false
    });
    expect(resultWithoutJump.metrics.totalHeadMovement).toBe(183);
  });

  it('Algoritma C-LOOK dengan arah ke kanan dan lompatan dihitung', () => {
    const clookInput: DiskSimulationInput = {
      ...textbookInput,
      direction: 'right',
      countJumpReturn: true
    };
    const resultWithJump = simulateCLOOK(clookInput);
    // 53 -> 183 (130) + jump 183->14 (169) + 14->37 (23) = 322
    expect(resultWithJump.metrics.totalHeadMovement).toBe(322);

    const resultWithoutJump = simulateCLOOK({
      ...clookInput,
      countJumpReturn: false
    });
    expect(resultWithoutJump.metrics.totalHeadMovement).toBe(153);
  });
});

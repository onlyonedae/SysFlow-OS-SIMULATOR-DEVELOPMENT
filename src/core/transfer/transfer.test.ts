import { describe, it, expect } from 'vitest';
import { simulateTransfer } from './models';

describe('Metode Transfer Data - Uji Karakteristik CPU & Interrupt', () => {
  const baseInput = {
    dataSizeKb: 64,
    blockSizeKb: 4,               // 16 blok
    deviceSpeedMsPerBlock: 5,     // 16 * 5 = 80 ms transfer
    interruptCostMs: 2,
    dmaSetupTimeMs: 3,
    cpuCopyTimePerBlockMs: 1
  };

  it('Programmed I/O (Polling) harus memiliki utilisasi CPU 100% dan 0 interrupt', () => {
    const result = simulateTransfer({
      ...baseInput,
      method: 'programmed_io'
    });

    expect(result.metrics.interruptCount).toBe(0);
    expect(result.metrics.cpuUtilization).toBe(100);
    expect(result.metrics.cpuFreeTime).toBe(0);
  });

  it('Interrupt-Driven I/O harus memicu 1 interrupt per blok dan CPU bebas saat perangkat membaca', () => {
    const result = simulateTransfer({
      ...baseInput,
      method: 'interrupt_driven'
    });

    expect(result.metrics.interruptCount).toBe(16); // 16 blok
    expect(result.metrics.cpuUtilization).toBeLessThan(100);
    expect(result.metrics.cpuFreeTime).toBeGreaterThan(0);
  });

  it('DMA harus hanya memicu 1 interrupt di akhir dan memiliki utilisasi CPU terendah', () => {
    const dmaResult = simulateTransfer({
      ...baseInput,
      method: 'dma'
    });

    const interruptResult = simulateTransfer({
      ...baseInput,
      method: 'interrupt_driven'
    });

    expect(dmaResult.metrics.interruptCount).toBe(1);
    expect(dmaResult.metrics.cpuBusyTime).toBe(3 + 2); // Tsetup + Tint = 5 ms
    expect(dmaResult.metrics.cpuUtilization).toBeLessThan(interruptResult.metrics.cpuUtilization);
  });
});

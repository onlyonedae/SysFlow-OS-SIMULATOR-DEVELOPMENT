import { describe, it, expect } from 'vitest';
import { simulateBuffering } from './models';

describe('Strategi Buffering - Uji Kasus Matematika & Model Waktu', () => {
  it('Metode Tanpa Buffer (Unbuffered) harus sekuensial dengan waktu M * (T + C)', () => {
    const result = simulateBuffering({
      method: 'unbuffered',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6
    });

    // 8 item * (4 + 6) = 80 ms
    expect(result.metrics.totalCompletionTime).toBe(80);
    expect(result.metrics.producerIdleTime).toBe(48); // 8 * 6
    expect(result.metrics.consumerIdleTime).toBe(32); // 8 * 4
    expect(result.metrics.speedupFactor).toBe(1);
  });

  it('Single Buffer harus memparalelkan proses dan lebih cepat dari Tanpa Buffer', () => {
    const unbufferedResult = simulateBuffering({
      method: 'unbuffered',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6
    });

    const singleResult = simulateBuffering({
      method: 'single',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6
    });

    // Single buffer harus lebih cepat dari 80 ms
    expect(singleResult.metrics.totalCompletionTime).toBeLessThan(unbufferedResult.metrics.totalCompletionTime);
    expect(singleResult.metrics.speedupFactor).toBeGreaterThan(1);
  });

  it('Double Buffer harus mengeliminasi sebagian besar producer idle saat T < C', () => {
    const result = simulateBuffering({
      method: 'double',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6
    });

    expect(result.metrics.totalCompletionTime).toBeLessThan(80);
    expect(result.metrics.throughput).toBeGreaterThan(0);
  });

  it('Circular Buffer harus bekerja lancar dengan kapasitas N slot', () => {
    const result = simulateBuffering({
      method: 'circular',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6,
      bufferCapacity: 4
    });

    expect(result.metrics.totalCompletionTime).toBeLessThan(80);
    expect(result.traces.length).toBeGreaterThan(0);
  });
});

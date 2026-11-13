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

  it('Single Buffer dengan 1 slot harus menunggu consumer selesai sebelum slot dipakai kembali', () => {
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

    // Pada 1 slot buffer tanpa ruang memori kedua, producer menunggu hingga consumer selesai
    // M * (T + C) = 8 * (4 + 6) = 80 ms
    expect(singleResult.metrics.totalCompletionTime).toBe(80);
    expect(singleResult.metrics.totalCompletionTime).toBe(unbufferedResult.metrics.totalCompletionTime);
  });

  it('Double Buffer harus memparalelkan proses dan lebih cepat daripada Single Buffer', () => {
    const singleResult = simulateBuffering({
      method: 'single',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6
    });

    const doubleResult = simulateBuffering({
      method: 'double',
      itemCount: 8,
      produceTime: 4,
      consumeTime: 6
    });

    // Double buffer memparalelkan transfer dan komputasi di 2 slot bergantian
    expect(doubleResult.metrics.totalCompletionTime).toBeLessThan(singleResult.metrics.totalCompletionTime);
    expect(doubleResult.metrics.totalCompletionTime).toBe(52);
    expect(doubleResult.metrics.speedupFactor).toBeGreaterThan(1);
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

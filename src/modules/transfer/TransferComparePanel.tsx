import React from 'react';
import { simulateTransfer } from '../../core/transfer';
import type { TransferSimulationInput, TransferMethod } from '../../core/transfer';

export interface TransferComparePanelProps {
  input: TransferSimulationInput;
  activeMethod: TransferMethod;
  onSelectMethod?: (method: TransferMethod) => void;
}

export const TransferComparePanel: React.FC<TransferComparePanelProps> = ({
  input,
  activeMethod,
  onSelectMethod
}) => {
  const methods: { id: TransferMethod; label: string }[] = [
    { id: 'programmed_io', label: 'Programmed I/O' },
    { id: 'interrupt_driven', label: 'Interrupt-driven' },
    { id: 'dma', label: 'DMA' }
  ];

  const results = methods.map((m) => {
    const res = simulateTransfer({ ...input, method: m.id });
    return {
      id: m.id,
      label: m.label,
      metrics: res.metrics
    };
  });

  const maxCpuBusy = Math.max(...results.map((r) => r.metrics.cpuBusyTime), 1);
  const minTotalTime = Math.min(...results.map((r) => r.metrics.totalTransferTime));
  const minCpuBusy = Math.min(...results.map((r) => r.metrics.cpuBusyTime));
  const maxCpuFree = Math.max(...results.map((r) => r.metrics.cpuFreeTime));
  const minUtil = Math.min(...results.map((r) => r.metrics.cpuUtilization));
  const minInterrupts = Math.min(...results.map((r) => r.metrics.interruptCount));
  const maxThroughput = Math.max(...results.map((r) => r.metrics.effectiveThroughput));

  return (
    <div className="compare-table-full-container">
      <table className="compare-table-full">
        <thead>
          <tr>
            <th>Metode</th>
            <th className="num-col">Total (ms)</th>
            <th className="num-col">CPU sibuk</th>
            <th className="num-col">CPU bebas</th>
            <th className="num-col">Utilisasi</th>
            <th className="num-col">Interrupt</th>
            <th className="num-col">Throughput</th>
            <th style={{ width: '220px' }}>CPU SIBUK RELATIF</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isActive = r.id === activeMethod;
            const pct = Math.min(100, Math.round((r.metrics.cpuBusyTime / maxCpuBusy) * 100));

            const isBestTotal = r.metrics.totalTransferTime === minTotalTime;
            const isBestBusy = r.metrics.cpuBusyTime === minCpuBusy;
            const isBestFree = r.metrics.cpuFreeTime === maxCpuFree;
            const isBestUtil = r.metrics.cpuUtilization === minUtil;
            const isBestInt = r.metrics.interruptCount === minInterrupts;
            const isBestThroughput = r.metrics.effectiveThroughput === maxThroughput;

            return (
              <tr
                key={r.id}
                className={isActive ? 'active-row' : ''}
                onClick={() => onSelectMethod?.(r.id)}
                style={{ cursor: onSelectMethod ? 'pointer' : 'default' }}
                title="Klik untuk memilih metode ini"
              >
                <td>
                  <span className="mono" style={{ fontWeight: isActive ? 600 : 500 }}>
                    {r.label}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestTotal ? 'metric-best' : ''}`}>
                    {r.metrics.totalTransferTime.toFixed(1).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestBusy ? 'metric-best' : ''}`}>
                    {r.metrics.cpuBusyTime.toFixed(1).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestFree ? 'metric-best' : ''}`}>
                    {r.metrics.cpuFreeTime.toFixed(1).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestUtil ? 'metric-best' : ''}`}>
                    {r.metrics.cpuUtilization.toFixed(1).replace('.', ',')}%
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestInt ? 'metric-best' : ''}`}>
                    {r.metrics.interruptCount}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestThroughput ? 'metric-best' : ''}`}>
                    {r.metrics.effectiveThroughput.toFixed(3).replace('.', ',')}
                  </span>
                </td>
                <td>
                  <div className="relative-bar-cell">
                    <div className="relative-bar-track">
                      <div
                        className={`relative-bar-fill ${isActive ? 'active' : ''}`}
                        style={{ width: `${pct}%`, backgroundColor: pct > 80 ? 'var(--color-danger)' : undefined }}
                      />
                    </div>
                    <span className="relative-bar-val">{pct}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="compare-table-footnote">
        <span>Tebal = nilai terbaik. Untuk CPU sibuk dan interrupt, nilai lebih kecil lebih baik.</span>
        <span className="mono">{results[0].metrics.blocksCount} blok · waktu diskret</span>
      </div>
    </div>
  );
};

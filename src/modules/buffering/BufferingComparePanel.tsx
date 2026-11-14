import React from 'react';
import { simulateBuffering } from '../../core/buffering';
import type { BufferingSimulationInput, BufferingMethod } from '../../core/buffering';

export interface BufferingComparePanelProps {
  input: BufferingSimulationInput;
  activeMethod: BufferingMethod;
  onSelectMethod?: (method: BufferingMethod) => void;
}

export const BufferingComparePanel: React.FC<BufferingComparePanelProps> = ({
  input,
  activeMethod,
  onSelectMethod
}) => {
  const methods: { id: BufferingMethod; label: string }[] = [
    { id: 'unbuffered', label: 'Tanpa buffer' },
    { id: 'single', label: 'Single buffer' },
    { id: 'double', label: 'Double buffer' },
    { id: 'circular', label: 'Circular buffer' }
  ];

  const results = methods.map((m) => {
    const res = simulateBuffering({ ...input, method: m.id });
    return {
      id: m.id,
      label: m.label,
      metrics: res.metrics
    };
  });

  const maxTotalTime = Math.max(...results.map((r) => r.metrics.totalCompletionTime), 1);
  const minTotalTime = Math.min(...results.map((r) => r.metrics.totalCompletionTime));
  const maxThroughput = Math.max(...results.map((r) => r.metrics.throughput));
  const maxSpeedup = Math.max(...results.map((r) => r.metrics.speedupFactor));
  const minProducerIdle = Math.min(...results.map((r) => r.metrics.producerIdleTime));
  const minConsumerIdle = Math.min(...results.map((r) => r.metrics.consumerIdleTime));
  const maxOccupancy = Math.max(...results.map((r) => r.metrics.avgBufferOccupancy));

  return (
    <div className="compare-table-full-container">
      <table className="compare-table-full">
        <thead>
          <tr>
            <th>Strategi</th>
            <th className="num-col">Total selesai (ms)</th>
            <th className="num-col">Throughput</th>
            <th className="num-col">Speedup</th>
            <th className="num-col">Producer idle</th>
            <th className="num-col">Consumer idle</th>
            <th className="num-col">Keterisian</th>
            <th style={{ width: '240px' }}>TOTAL WAKTU RELATIF</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const isActive = r.id === activeMethod;
            const pct = Math.min(100, Math.round((r.metrics.totalCompletionTime / maxTotalTime) * 100));

            const isBestTotal = r.metrics.totalCompletionTime === minTotalTime;
            const isBestThroughput = r.metrics.throughput === maxThroughput;
            const isBestSpeedup = r.metrics.speedupFactor === maxSpeedup;
            const isBestPIdle = r.metrics.producerIdleTime === minProducerIdle;
            const isBestCIdle = r.metrics.consumerIdleTime === minConsumerIdle;
            const isBestOcc = r.metrics.avgBufferOccupancy === maxOccupancy;

            return (
              <tr
                key={r.id}
                className={isActive ? 'active-row' : ''}
                onClick={() => onSelectMethod?.(r.id)}
                style={{ cursor: onSelectMethod ? 'pointer' : 'default' }}
                title="Klik untuk memilih strategi ini"
              >
                <td>
                  <span className="mono" style={{ fontWeight: isActive ? 600 : 500 }}>
                    {r.label}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestTotal ? 'metric-best' : ''}`}>
                    {r.metrics.totalCompletionTime.toFixed(1).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestThroughput ? 'metric-best' : ''}`}>
                    {r.metrics.throughput.toFixed(4).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestSpeedup ? 'metric-best' : ''}`}>
                    {r.metrics.speedupFactor.toFixed(2).replace('.', ',')}×
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestPIdle ? 'metric-best' : ''}`}>
                    {r.metrics.producerIdleTime.toFixed(1).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestCIdle ? 'metric-best' : ''}`}>
                    {r.metrics.consumerIdleTime.toFixed(1).replace('.', ',')}
                  </span>
                </td>
                <td className="num-col">
                  <span className={`mono ${isBestOcc ? 'metric-best' : ''}`}>
                    {r.metrics.avgBufferOccupancy.toFixed(1).replace('.', ',')}%
                  </span>
                </td>
                <td>
                  <div className="relative-bar-cell">
                    <div className="relative-bar-track">
                      <div
                        className={`relative-bar-fill ${isActive ? 'active' : ''}`}
                        style={{ width: `${pct}%` }}
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
        <span>Tebal = nilai terbaik. Double dan Circular seri pada total waktu dan throughput.</span>
        <span className="mono">8 item · waktu diskret</span>
      </div>
    </div>
  );
};

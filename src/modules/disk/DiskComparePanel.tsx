import React from 'react';
import { runDiskSimulation } from '../../core/disk';
import type { DiskAlgorithm, DiskSimulationInput } from '../../core/disk';

export interface DiskComparePanelProps {
  input: DiskSimulationInput;
  activeAlgorithm: DiskAlgorithm;
}

const ALGORITHMS: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];

export const DiskComparePanel: React.FC<DiskComparePanelProps> = ({ input, activeAlgorithm }) => {
  const results = ALGORITHMS.map((algo) => ({
    algo,
    result: runDiskSimulation(algo, input)
  }));

  const maxHead = Math.max(...results.map((r) => r.result.metrics.totalHeadMovement), 1);
  const minHead = Math.min(...results.map((r) => r.result.metrics.totalHeadMovement));
  const minSeek = Math.min(...results.map((r) => r.result.metrics.estimatedSeekTime));
  const minAvg = Math.min(...results.map((r) => r.result.metrics.avgWaitingTime));
  const minMax = Math.min(...results.map((r) => r.result.metrics.maxWaitingTime));
  const maxThroughput = Math.max(...results.map((r) => r.result.metrics.throughput));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="compare-table-full">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', width: '22%' }}>ALGORITMA</th>
              <th style={{ textAlign: 'right', width: '12%' }}>TOTAL GERAK</th>
              <th style={{ textAlign: 'right', width: '12%' }}>SEEK (MS)</th>
              <th style={{ textAlign: 'right', width: '14%' }}>TUNGGU RATA-RATA</th>
              <th style={{ textAlign: 'right', width: '13%' }}>TUNGGU MAKS</th>
              <th style={{ textAlign: 'right', width: '12%' }}>THROUGHPUT</th>
              <th style={{ textAlign: 'left', width: '15%' }}>GERAK RELATIF</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ algo, result }) => {
              const m = result.metrics;
              const isActive = algo === activeAlgorithm;
              const isMinHead = m.totalHeadMovement === minHead;
              const isMinSeek = m.estimatedSeekTime === minSeek;
              const isMinAvg = m.avgWaitingTime === minAvg;
              const isMinMax = m.maxWaitingTime === minMax;
              const isMaxThroughput = m.throughput === maxThroughput;
              const barPercent = Math.max(4, Math.round((m.totalHeadMovement / maxHead) * 100));

              return (
                <tr
                  key={algo}
                  className={isActive ? 'row-active' : ''}
                >
                  <td style={{ fontWeight: isActive ? 600 : 500 }}>
                    {result.algorithmName.replace(/ \(.*\)/, '')}
                    {isActive && (
                      <span className="algo-active-tag"> aktif</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: isMinHead ? 700 : 400 }}>
                    {m.totalHeadMovement}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: isMinSeek ? 700 : 400 }}>
                    {m.estimatedSeekTime.toFixed(1).replace('.', ',')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: isMinAvg ? 700 : 400 }}>
                    {m.avgWaitingTime.toFixed(1).replace('.', ',')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: isMinMax ? 700 : 400 }}>
                    {m.maxWaitingTime.toFixed ? m.maxWaitingTime.toFixed(1).replace('.', ',') : m.maxWaitingTime}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: isMaxThroughput ? 700 : 400 }}>
                    {m.throughput.toFixed(4).replace('.', ',')}
                  </td>
                  <td>
                    <div className="relative-bar-track">
                      <div
                        className={`relative-bar-fill ${isActive ? 'active' : ''}`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="compare-footer-note">
        Tebal = nilai terbaik pada kolom. Throughput lebih tinggi lebih baik.
      </div>
    </div>
  );
};

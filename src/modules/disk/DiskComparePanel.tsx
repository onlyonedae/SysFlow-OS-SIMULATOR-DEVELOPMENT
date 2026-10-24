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

  const minHead   = Math.min(...results.map(r => r.result.metrics.totalHeadMovement));
  const minSeek   = Math.min(...results.map(r => r.result.metrics.estimatedSeekTime));
  const minAvg    = Math.min(...results.map(r => r.result.metrics.avgWaitingTime));
  const minMax    = Math.min(...results.map(r => r.result.metrics.maxWaitingTime));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th>Metode</th>
              <th>Gerak (track)</th>
              <th>Seek (ms)</th>
              <th>Tunggu ø (ms)</th>
              <th>Tunggu maks. (ms)</th>
            </tr>
          </thead>
          <tbody>
            {results.map(({ algo, result }) => {
              const m = result.metrics;
              const isActive = algo === activeAlgorithm;
              const isMinHead = m.totalHeadMovement === minHead;
              const isMinSeek = m.estimatedSeekTime === minSeek;
              const isMinAvg  = m.avgWaitingTime === minAvg;
              const isMinMax  = m.maxWaitingTime === minMax;

              return (
                <tr
                  key={algo}
                  className={isActive ? 'row-active' : ''}
                >
                  <td>
                    {algo}
                    {isActive && (
                      <span style={{
                        marginLeft: '5px',
                        fontSize: '9px',
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        verticalAlign: 'middle'
                      }}>●</span>
                    )}
                  </td>
                  <td className={isMinHead ? 'best-val' : ''}>
                    {m.totalHeadMovement}
                  </td>
                  <td className={isMinSeek ? 'best-val' : ''}>
                    {m.estimatedSeekTime.toFixed(1).replace('.', ',')}
                  </td>
                  <td className={isMinAvg ? 'best-val' : ''}>
                    {m.avgWaitingTime.toFixed(3).replace('.', ',')}
                  </td>
                  <td className={isMinMax ? 'best-val' : ''}>
                    {m.maxWaitingTime.toFixed ? m.maxWaitingTime.toFixed(1).replace('.', ',') : m.maxWaitingTime}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="compare-footer-note">
        ✓ Nilai terendah. Arah awal menuju 0; lompatan dihitung. Semua request tiba pada t=0.
      </div>
    </div>
  );
};

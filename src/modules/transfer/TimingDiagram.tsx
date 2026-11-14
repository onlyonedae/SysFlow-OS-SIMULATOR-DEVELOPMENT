import React from 'react';
import type { TimingInterval } from '../../core/transfer';

export interface TimingDiagramProps {
  timeline: TimingInterval[];
  currentTime: number;
  totalTime: number;
}

export const TimingDiagram: React.FC<TimingDiagramProps> = ({
  timeline,
  currentTime,
  totalTime
}) => {
  const safeTotalTime = Math.max(totalTime, 1);

  const cpuIntervals = timeline.filter((it) => it.track === 'cpu' && it.status !== 'free');
  const devIntervals = timeline.filter((it) => it.track === 'device' && it.status !== 'free');
  const memIntervals = timeline.filter((it) => it.track === 'memory' && it.status !== 'free');

  const tickCount = 4;
  const ticks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(Math.round((i / tickCount) * safeTotalTime));
  }

  const getCpuSegmentClass = (status: TimingInterval['status']) => {
    switch (status) {
      case 'polling':
        return 'timeline-segment-polling';
      case 'interrupt_handler':
        return 'timeline-segment-isr';
      case 'dma_setup':
        return 'timeline-segment-dma-setup';
      default:
        return 'timeline-segment-danger';
    }
  };

  const getCpuLabel = (status: TimingInterval['status']) => {
    switch (status) {
      case 'polling':
        return 'POLL';
      case 'interrupt_handler':
        return 'ISR';
      case 'dma_setup':
        return 'SETUP';
      default:
        return 'BUSY';
    }
  };

  return (
    <div className="timeline-module-block">
      <div className="timeline-module-header">
        <span className="timeline-module-title">Timing diagram</span>
      </div>

      <div className="timeline-tracks-wrapper">
        {/* Track CPU */}
        <div className="timeline-track-row">
          <span className="timeline-track-name" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>CPU</span>
          <div className="timeline-track-bar-canvas">
            {cpuIntervals.map((inv, idx) => {
              const leftPct = (inv.startTime / safeTotalTime) * 100;
              const widthPct = ((inv.endTime - inv.startTime) / safeTotalTime) * 100;
              const segClass = getCpuSegmentClass(inv.status);
              const label = getCpuLabel(inv.status);

              return (
                <div
                  key={idx}
                  className={segClass}
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0.5, widthPct)}%`
                  }}
                  title={`CPU ${inv.label}: t=${inv.startTime} - ${inv.endTime} ms`}
                >
                  {widthPct > 3 && (
                    <span className="timeline-block-text" style={{ color: '#FFFFFF' }}>
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
            {currentTime > 0 && currentTime <= safeTotalTime && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(currentTime / safeTotalTime) * 100}%`,
                  width: '2px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 4px #FFFFFF',
                  zIndex: 3
                }}
              />
            )}
          </div>
        </div>

        {/* Track Device Controller (Cyan) */}
        <div className="timeline-track-row">
          <span className="timeline-track-name" style={{ color: '#38BDF8', fontWeight: 600 }}>Device</span>
          <div className="timeline-track-bar-canvas">
            {devIntervals.map((inv, idx) => {
              const leftPct = (inv.startTime / safeTotalTime) * 100;
              const widthPct = ((inv.endTime - inv.startTime) / safeTotalTime) * 100;
              return (
                <div
                  key={idx}
                  className="timeline-segment-device"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0.5, widthPct)}%`
                  }}
                  title={`Device baca blok #${inv.blockIndex ?? ''}: t=${inv.startTime} - ${inv.endTime} ms`}
                >
                  {widthPct > 3 && (
                    <span className="timeline-block-text" style={{ color: '#E0F2FE' }}>
                      {inv.blockIndex ? `#${inv.blockIndex}` : 'I/O'}
                    </span>
                  )}
                </div>
              );
            })}
            {currentTime > 0 && currentTime <= safeTotalTime && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(currentTime / safeTotalTime) * 100}%`,
                  width: '2px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 4px #FFFFFF',
                  zIndex: 3
                }}
              />
            )}
          </div>
        </div>

        {/* Track Memori RAM (Hijau Emerald) */}
        <div className="timeline-track-row">
          <span className="timeline-track-name" style={{ color: '#34D399', fontWeight: 600 }}>Memori</span>
          <div className="timeline-track-bar-canvas">
            {memIntervals.map((inv, idx) => {
              const leftPct = (inv.startTime / safeTotalTime) * 100;
              const widthPct = ((inv.endTime - inv.startTime) / safeTotalTime) * 100;
              return (
                <div
                  key={idx}
                  className="timeline-segment-memory"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0.5, widthPct)}%`
                  }}
                  title={`Memori tulis blok #${inv.blockIndex ?? ''}: t=${inv.startTime} - ${inv.endTime} ms`}
                >
                  {widthPct > 3 && (
                    <span className="timeline-block-text" style={{ color: '#D1FAE5' }}>
                      WRITE
                    </span>
                  )}
                </div>
              );
            })}
            {currentTime > 0 && currentTime <= safeTotalTime && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(currentTime / safeTotalTime) * 100}%`,
                  width: '2px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 4px #FFFFFF',
                  zIndex: 3
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sumbu Waktu (Ticks) */}
      <div className="timeline-axis-ticks">
        {ticks.map((val, idx) => (
          <span key={idx}>{val}</span>
        ))}
        <span>ms</span>
      </div>

      {/* Legend Multi-Warna Lengkap */}
      <div className="timeline-legend-row" style={{ flexWrap: 'wrap', rowGap: '4px' }}>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: '#EF4444' }} />
          Polling
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: '#F59E0B' }} />
          Interrupt Handler (ISR)
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: '#818CF8' }} />
          DMA Setup
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: '#38BDF8' }} />
          Transfer Device
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: '#34D399' }} />
          Write Memori
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: 'var(--color-sunk)', border: '1px solid var(--color-rule)' }} />
          bebas
        </span>
      </div>
    </div>
  );
};

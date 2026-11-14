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

  return (
    <div className="timeline-module-block">
      <div className="timeline-module-header">
        <span className="timeline-module-title">Timing diagram</span>
      </div>

      <div className="timeline-tracks-wrapper">
        {/* Track CPU */}
        <div className="timeline-track-row">
          <span className="timeline-track-name">CPU</span>
          <div className="timeline-track-bar-canvas">
            {cpuIntervals.map((inv, idx) => {
              const leftPct = (inv.startTime / safeTotalTime) * 100;
              const widthPct = ((inv.endTime - inv.startTime) / safeTotalTime) * 100;
              const isInterrupt = inv.status === 'interrupt_handler' || inv.status === 'polling';
              return (
                <div
                  key={idx}
                  className={isInterrupt ? 'timeline-segment-danger' : 'timeline-segment-working'}
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0.5, widthPct)}%`
                  }}
                  title={`CPU ${inv.label}: t=${inv.startTime} - ${inv.endTime} ms`}
                />
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
                  backgroundColor: 'var(--color-head-mark)',
                  zIndex: 3
                }}
              />
            )}
          </div>
        </div>

        {/* Track Device */}
        <div className="timeline-track-row">
          <span className="timeline-track-name">Device</span>
          <div className="timeline-track-bar-canvas">
            {devIntervals.map((inv, idx) => {
              const leftPct = (inv.startTime / safeTotalTime) * 100;
              const widthPct = ((inv.endTime - inv.startTime) / safeTotalTime) * 100;
              return (
                <div
                  key={idx}
                  className="timeline-segment-working"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0.5, widthPct)}%`
                  }}
                  title={`Device ${inv.label}: t=${inv.startTime} - ${inv.endTime} ms`}
                />
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
                  backgroundColor: 'var(--color-head-mark)',
                  zIndex: 3
                }}
              />
            )}
          </div>
        </div>

        {/* Track Memori */}
        <div className="timeline-track-row">
          <span className="timeline-track-name">Memori</span>
          <div className="timeline-track-bar-canvas">
            {memIntervals.map((inv, idx) => {
              const leftPct = (inv.startTime / safeTotalTime) * 100;
              const widthPct = ((inv.endTime - inv.startTime) / safeTotalTime) * 100;
              return (
                <div
                  key={idx}
                  className="timeline-segment-working"
                  style={{
                    left: `${leftPct}%`,
                    width: `${Math.max(0.5, widthPct)}%`
                  }}
                  title={`Memori ${inv.label}: t=${inv.startTime} - ${inv.endTime} ms`}
                />
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
                  backgroundColor: 'var(--color-head-mark)',
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

      {/* Legend */}
      <div className="timeline-legend-row">
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: 'var(--color-accent)' }} />
          device / memori sibuk
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: 'var(--color-danger)' }} />
          CPU melayani interrupt
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: 'var(--color-sunk)', border: '1px solid var(--color-rule)' }} />
          bebas
        </span>
      </div>
    </div>
  );
};

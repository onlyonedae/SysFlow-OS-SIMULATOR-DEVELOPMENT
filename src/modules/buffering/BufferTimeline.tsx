import React from 'react';
import type { BufferingTimelineInterval } from '../../core/buffering';

export interface BufferTimelineProps {
  timeline: BufferingTimelineInterval[];
  currentTime: number;
  totalTime: number;
}

export const BufferTimeline: React.FC<BufferTimelineProps> = ({
  timeline,
  currentTime,
  totalTime
}) => {
  const safeTotalTime = Math.max(totalTime, 1);
  const pIntervals = timeline.filter((it) => it.actor === 'producer' && it.state === 'working');
  const cIntervals = timeline.filter((it) => it.actor === 'consumer' && it.state === 'working');

  // Buat 6 ticks waktu proporsional
  const tickCount = 5;
  const ticks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(Math.round((i / tickCount) * safeTotalTime));
  }

  return (
    <div className="timeline-module-block">
      <div className="timeline-module-header">
        <span className="timeline-module-title">Timeline aktor</span>
      </div>

      <div className="timeline-tracks-wrapper">
        {/* Track Producer */}
        <div className="timeline-track-row">
          <span className="timeline-track-name">Producer</span>
          <div className="timeline-track-bar-canvas">
            {pIntervals.map((inv, idx) => {
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
                  title={`Producer bekerja: t=${inv.startTime} - ${inv.endTime} ms`}
                />
              );
            })}
            {/* Playhead marker jika sedang disimulasikan */}
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

        {/* Track Consumer */}
        <div className="timeline-track-row">
          <span className="timeline-track-name">Consumer</span>
          <div className="timeline-track-bar-canvas">
            {cIntervals.map((inv, idx) => {
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
                  title={`Consumer bekerja: t=${inv.startTime} - ${inv.endTime} ms`}
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
          bekerja
        </span>
        <span>
          <span className="timeline-legend-dot" style={{ backgroundColor: 'var(--color-sunk)', border: '1px solid var(--color-rule)' }} />
          menganggur
        </span>
      </div>
    </div>
  );
};

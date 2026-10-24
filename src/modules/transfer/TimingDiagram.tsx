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
  const chartWidth = 660;
  const chartHeight = 180;
  const padLeft = 100;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;
  const safeTotalTime = Math.max(totalTime, 1);

  const getX = (t: number) => {
    return padLeft + (t / safeTotalTime) * innerW;
  };

  const rowHeight = 26;
  const cpuY = padTop + 5;
  const devY = padTop + 40;
  const memY = padTop + 75;

  const tickCount = 6;
  const timeTicks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    timeTicks.push(Math.round((i / tickCount) * safeTotalTime));
  }

  const cpuIntervals = timeline.filter((it) => it.track === 'cpu');
  const devIntervals = timeline.filter((it) => it.track === 'device');
  const memIntervals = timeline.filter((it) => it.track === 'memory');

  const getBlockColor = (status: TimingInterval['status']) => {
    switch (status) {
      case 'polling':
        return { fill: 'var(--color-idle)', text: '#ffffff' }; // Merah polling
      case 'interrupt_handler':
        return { fill: 'var(--color-waiting)', text: '#ffffff' }; // Amber ISR
      case 'dma_setup':
        return { fill: '#4338ca', text: '#ffffff' }; // Indigo setup
      case 'busy_transfer':
        return { fill: 'var(--color-active)', text: '#ffffff' }; // Teal transfer
      case 'memory_write':
        return { fill: 'var(--color-served)', text: '#ffffff' }; // Hijau RAM
      case 'free':
      default:
        return { fill: 'var(--color-timeline-free)', text: 'var(--color-text-dim)' }; // Abu-abu bebas
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius)',
      padding: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
          Timing Diagram 3 Jalur: CPU, Device Controller, dan Memori
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-idle)' }}></span>
            Polling
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-waiting)' }}></span>
            Interrupt Handler
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-active)' }}></span>
            Transfer I/O
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-served)' }}></span>
            Write Memori
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-timeline-free)', border: '1px solid var(--color-border)' }}></span>
            CPU Bebas
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: 'var(--color-chart-bg)' }}
          role="img"
          aria-label="Timing diagram 3 jalur CPU, Device Controller, dan Memori"
        >
          {/* Grid Garis Waktu Vertikal */}
          {timeTicks.map((tick) => (
            <line
              key={`grid-x-${tick}`}
              x1={getX(tick)}
              y1={padTop}
              x2={getX(tick)}
              y2={padTop + innerH}
              stroke="var(--color-chart-grid)"
              strokeDasharray="2 2"
            />
          ))}

          {/* Label Jalur */}
          <text x={padLeft - 10} y={cpuY + rowHeight / 2 + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--color-text)">
            CPU
          </text>
          <text x={padLeft - 10} y={devY + rowHeight / 2 + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--color-text)">
            Controller
          </text>
          <text x={padLeft - 10} y={memY + rowHeight / 2 + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--color-text)">
            Memori (RAM)
          </text>

          {/* Latar Belakang Baris */}
          <rect x={padLeft} y={cpuY} width={innerW} height={rowHeight} fill="var(--color-track-bg)" stroke="var(--color-track-stroke)" strokeWidth="1" />
          <rect x={padLeft} y={devY} width={innerW} height={rowHeight} fill="var(--color-track-bg)" stroke="var(--color-track-stroke)" strokeWidth="1" />
          <rect x={padLeft} y={memY} width={innerW} height={rowHeight} fill="var(--color-track-bg)" stroke="var(--color-track-stroke)" strokeWidth="1" />

          {/* Render Interval CPU */}
          {cpuIntervals.map((it, i) => {
            const x1 = getX(it.startTime);
            const x2 = getX(it.endTime);
            const w = Math.max(x2 - x1, 1);
            const style = getBlockColor(it.status);

            return (
              <g key={`cpu-it-${i}`}>
                <rect x={x1} y={cpuY} width={w} height={rowHeight} fill={style.fill} stroke="var(--color-surface)" strokeWidth="0.75" />
                {w > 26 && (
                  <text x={x1 + w / 2} y={cpuY + rowHeight / 2 + 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600" fill={style.text}>
                    {it.status === 'polling' ? 'POLL' : (it.status === 'interrupt_handler' ? 'ISR' : (it.status === 'free' ? 'BEBAS' : 'COPY'))}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Interval Device Controller */}
          {devIntervals.map((it, i) => {
            const x1 = getX(it.startTime);
            const x2 = getX(it.endTime);
            const w = Math.max(x2 - x1, 1);
            const style = getBlockColor(it.status);

            return (
              <g key={`dev-it-${i}`}>
                <rect x={x1} y={devY} width={w} height={rowHeight} fill={style.fill} stroke="var(--color-surface)" strokeWidth="0.75" />
                {w > 26 && (
                  <text x={x1 + w / 2} y={devY + rowHeight / 2 + 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600" fill={style.text}>
                    {it.status === 'busy_transfer' ? `#${it.blockIndex ?? ''}` : 'IDLE'}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Interval Memori */}
          {memIntervals.map((it, i) => {
            const x1 = getX(it.startTime);
            const x2 = getX(it.endTime);
            const w = Math.max(x2 - x1, 1);
            const style = getBlockColor(it.status);

            return (
              <g key={`mem-it-${i}`}>
                <rect x={x1} y={memY} width={w} height={rowHeight} fill={style.fill} stroke="var(--color-surface)" strokeWidth="0.75" />
                {w > 26 && (
                  <text x={x1 + w / 2} y={memY + rowHeight / 2 + 3} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600" fill={style.text}>
                    {it.status === 'memory_write' || it.status === 'busy_transfer' ? 'WRITE' : 'IDLE'}
                  </text>
                )}
              </g>
            );
          })}

          {/* Kursor Waktu Berjalan Real-time */}
          <line
            x1={getX(currentTime)}
            y1={padTop - 4}
            x2={getX(currentTime)}
            y2={padTop + innerH + 4}
            stroke="var(--color-cursor)"
            strokeWidth="2"
          />
          <polygon
            points={`${getX(currentTime) - 5},${padTop - 6} ${getX(currentTime) + 5},${padTop - 6} ${getX(currentTime)},${padTop}`}
            fill="var(--color-cursor)"
          />

          {/* Sumbu Waktu Bawah */}
          <line x1={padLeft} y1={padTop + innerH + 8} x2={padLeft + innerW} y2={padTop + innerH + 8} stroke="var(--color-border)" strokeWidth="1.5" />
          {timeTicks.map((t) => (
            <g key={`tick-label-transfer-${t}`}>
              <line x1={getX(t)} y1={padTop + innerH + 8} x2={getX(t)} y2={padTop + innerH + 13} stroke="var(--color-border)" />
              <text x={getX(t)} y={padTop + innerH + 24} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-text-dim)">
                {t}
              </text>
            </g>
          ))}
          <text x={padLeft + innerW / 2} y={chartHeight - 2} textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)">
            Waktu Transfer (ms)
          </text>
        </svg>
      </div>
    </div>
  );
};

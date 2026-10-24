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
  const chartWidth = 640;
  const chartHeight = 150;
  const padLeft = 90;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const safeTotalTime = Math.max(totalTime, 1);

  const getX = (t: number) => {
    return padLeft + (t / safeTotalTime) * innerW;
  };

  // 2 Jalur: Row 0 untuk Producer, Row 1 untuk Consumer
  const rowHeight = 24;
  const producerY = padTop + 10;
  const consumerY = padTop + 45;

  // Ticks waktu horizontal
  const tickCount = 6;
  const timeTicks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    timeTicks.push(Math.round((i / tickCount) * safeTotalTime));
  }

  // Filter interval sesuai actor
  const pIntervals = timeline.filter((it) => it.actor === 'producer');
  const cIntervals = timeline.filter((it) => it.actor === 'consumer');

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
          Timeline Aktivitas Producer vs Consumer
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '10px', backgroundColor: 'var(--color-waiting)' }}></span>
            Producer Bekerja (I/O)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '10px', backgroundColor: 'var(--color-active)' }}></span>
            Consumer Bekerja (CPU)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '12px', height: '10px', backgroundColor: 'var(--color-idle)' }}></span>
            Menganggur (Idle / Stall)
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#fafbfc' }}
          role="img"
          aria-label="Diagram timing aktivitas producer dan consumer"
        >
          {/* Garis Grid Waktu Vertikal */}
          {timeTicks.map((tick) => (
            <line
              key={`grid-t-${tick}`}
              x1={getX(tick)}
              y1={padTop}
              x2={getX(tick)}
              y2={padTop + innerH}
              stroke="#e2e8f0"
              strokeDasharray="2 2"
            />
          ))}

          {/* Label Baris Jalur */}
          <text
            x={padLeft - 10}
            y={producerY + rowHeight / 2 + 4}
            textAnchor="end"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fontWeight="600"
            fill="var(--color-text)"
          >
            Producer (I/O)
          </text>
          <text
            x={padLeft - 10}
            y={consumerY + rowHeight / 2 + 4}
            textAnchor="end"
            fontSize="11"
            fontFamily="var(--font-mono)"
            fontWeight="600"
            fill="var(--color-text)"
          >
            Consumer (CPU)
          </text>

          {/* Latar Belakang Jalur */}
          <rect
            x={padLeft}
            y={producerY}
            width={innerW}
            height={rowHeight}
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          <rect
            x={padLeft}
            y={consumerY}
            width={innerW}
            height={rowHeight}
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Blok Waktu Producer */}
          {pIntervals.map((interval, i) => {
            const x1 = getX(interval.startTime);
            const x2 = getX(interval.endTime);
            const w = Math.max(x2 - x1, 1);
            const isWorking = interval.state === 'working';

            return (
              <g key={`p-block-${i}`}>
                <rect
                  x={x1}
                  y={producerY}
                  width={w}
                  height={rowHeight}
                  fill={isWorking ? 'var(--color-waiting)' : 'var(--color-idle)'}
                  stroke="#ffffff"
                  strokeWidth="0.75"
                />
                {w > 18 && (
                  <text
                    x={x1 + w / 2}
                    y={producerY + rowHeight / 2 + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                    fill="#ffffff"
                  >
                    {isWorking ? `#${interval.itemId}` : 'IDLE'}
                  </text>
                )}
              </g>
            );
          })}

          {/* Blok Waktu Consumer */}
          {cIntervals.map((interval, i) => {
            const x1 = getX(interval.startTime);
            const x2 = getX(interval.endTime);
            const w = Math.max(x2 - x1, 1);
            const isWorking = interval.state === 'working';

            return (
              <g key={`c-block-${i}`}>
                <rect
                  x={x1}
                  y={consumerY}
                  width={w}
                  height={rowHeight}
                  fill={isWorking ? 'var(--color-active)' : 'var(--color-idle)'}
                  stroke="#ffffff"
                  strokeWidth="0.75"
                />
                {w > 18 && (
                  <text
                    x={x1 + w / 2}
                    y={consumerY + rowHeight / 2 + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                    fill="#ffffff"
                  >
                    {isWorking ? `#${interval.itemId}` : 'IDLE'}
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
            stroke="#0f172a"
            strokeWidth="2"
          />
          <polygon
            points={`${getX(currentTime) - 5},${padTop - 6} ${getX(currentTime) + 5},${padTop - 6} ${getX(currentTime)},${padTop}`}
            fill="#0f172a"
          />

          {/* Sumbu Waktu Bawah */}
          <line
            x1={padLeft}
            y1={padTop + innerH + 8}
            x2={padLeft + innerW}
            y2={padTop + innerH + 8}
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          {timeTicks.map((t) => (
            <g key={`tick-label-${t}`}>
              <line
                x1={getX(t)}
                y1={padTop + innerH + 8}
                x2={getX(t)}
                y2={padTop + innerH + 13}
                stroke="var(--color-border)"
              />
              <text
                x={getX(t)}
                y={padTop + innerH + 24}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill="var(--color-text-dim)"
              >
                {t}
              </text>
            </g>
          ))}
          <text
            x={padLeft + innerW / 2}
            y={chartHeight - 2}
            textAnchor="middle"
            fontSize="10"
            fontFamily="var(--font-sans)"
            fill="var(--color-text-muted)"
          >
            Waktu Berjalan (ms)
          </text>
        </svg>
      </div>
    </div>
  );
};

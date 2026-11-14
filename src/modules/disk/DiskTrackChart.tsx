import React, { useState } from 'react';
import type { DiskStepTrace } from '../../core/disk';

export interface DiskTrackChartProps {
  traces: DiskStepTrace[];
  currentStep: number;
  minTrack: number;
  maxTrack: number;
  allRequests: number[];
}

export const DiskTrackChart: React.FC<DiskTrackChartProps> = ({
  traces,
  currentStep,
  minTrack,
  maxTrack,
  allRequests
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Dimensi SVG
  const width = 640;
  const height = 300;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 32;
  const paddingBottom = 42;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const totalSteps = Math.max(traces.length - 1, 1);
  const trackRange = Math.max(maxTrack - minTrack, 1);

  // Transformasi koordinat
  const getX = (track: number) => {
    return paddingLeft + ((track - minTrack) / trackRange) * innerWidth;
  };

  const getY = (stepIndex: number) => {
    return paddingTop + (stepIndex / totalSteps) * innerHeight;
  };

  // Titik jejak sampai currentStep
  const visibleTraces = traces.slice(0, currentStep + 1);

  // Set request yang sudah dilayani sampai currentStep
  const servedTrackSet = new Set<number>();
  for (let i = 1; i <= currentStep && i < traces.length; i++) {
    if (traces[i].servedTrack !== null) {
      servedTrackSet.add(traces[i].servedTrack as number);
    }
  }

  // Ticks sumbu X
  const xTickSteps = 5;
  const xTicks: number[] = [];
  for (let i = 0; i <= xTickSteps; i++) {
    const trackVal = Math.round(minTrack + (i / xTickSteps) * trackRange);
    if (!xTicks.includes(trackVal)) xTicks.push(trackVal);
  }

  // Ticks sumbu Y
  const yTicks: number[] = [];
  const yStepInterval = Math.max(1, Math.ceil(totalSteps / 5));
  for (let s = 0; s <= totalSteps; s += yStepInterval) {
    yTicks.push(s);
  }
  if (!yTicks.includes(totalSteps)) yTicks.push(totalSteps);

  const activeTrace = visibleTraces[visibleTraces.length - 1];

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      flex: 1
    }}>
      {/* Legenda atas sesuai Figma */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--color-rule)'
      }}>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-ink2)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '2px', backgroundColor: 'var(--color-ink)', display: 'inline-block' }}></span>
            jalur tempuh
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-head-mark)', borderRadius: '50%', display: 'inline-block' }}></span>
            head saat ini
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', border: '1.5px solid var(--color-ink3)', borderRadius: '50%', display: 'inline-block' }}></span>
            request
          </span>
        </div>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--color-ink3)' }}>
          silinder 0–{maxTrack}
        </span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', padding: '12px 16px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: 'var(--color-plot)', border: '1px solid var(--color-rule)', borderRadius: '2px' }}
          role="img"
          aria-label="Grafik pergerakan head disk terhadap langkah waktu"
        >
          {/* Garis Grid Latar Belakang */}
          {xTicks.map((tick) => (
            <line
              key={`x-grid-${tick}`}
              x1={getX(tick)}
              y1={paddingTop}
              x2={getX(tick)}
              y2={paddingTop + innerHeight}
              stroke="var(--color-chart-grid)"
              strokeDasharray="3 3"
            />
          ))}

          {yTicks.map((step) => (
            <line
              key={`y-grid-${step}`}
              x1={paddingLeft}
              y1={getY(step)}
              x2={paddingLeft + innerWidth}
              y2={getY(step)}
              stroke="var(--color-chart-grid)"
              strokeDasharray="3 3"
            />
          ))}

          {/* Sumbu X & Sumbu Y */}
          <line
            x1={paddingLeft}
            y1={paddingTop + innerHeight}
            x2={paddingLeft + innerWidth}
            y2={paddingTop + innerHeight}
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={paddingTop + innerHeight}
            stroke="var(--color-border)"
            strokeWidth="1.5"
          />

          {/* Label Sumbu X */}
          {xTicks.map((tick) => (
            <g key={`x-tick-${tick}`}>
              <line
                x1={getX(tick)}
                y1={paddingTop + innerHeight}
                x2={getX(tick)}
                y2={paddingTop + innerHeight + 5}
                stroke="var(--color-border)"
              />
              <text
                x={getX(tick)}
                y={paddingTop + innerHeight + 17}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill="var(--color-text-dim)"
              >
                {tick}
              </text>
            </g>
          ))}
          <text
            x={paddingLeft + innerWidth / 2}
            y={height - 6}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-sans)"
            fontWeight="500"
            fill="var(--color-text-muted)"
          >
            Nomor Track (Silinder)
          </text>

          {/* Label Sumbu Y */}
          {yTicks.map((step) => (
            <g key={`y-tick-${step}`}>
              <line
                x1={paddingLeft - 5}
                y1={getY(step)}
                x2={paddingLeft}
                y2={getY(step)}
                stroke="var(--color-border)"
              />
              <text
                x={paddingLeft - 8}
                y={getY(step) + 3}
                textAnchor="end"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill="var(--color-text-dim)"
              >
                {step}
              </text>
            </g>
          ))}
          <text
            x={16}
            y={paddingTop + innerHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 16 ${paddingTop + innerHeight / 2})`}
            fontSize="11"
            fontFamily="var(--font-sans)"
            fontWeight="500"
            fill="var(--color-text-muted)"
          >
            Urutan Langkah (Step)
          </text>

          {/* Indikator Semua Request Awal pada Sumbu X (Garis Atas) */}
          {allRequests.map((req, idx) => {
            const isServed = servedTrackSet.has(req);
            return (
              <g key={`req-marker-${idx}-${req}`}>
                <line
                  x1={getX(req)}
                  y1={paddingTop - 2}
                  x2={getX(req)}
                  y2={paddingTop + 6}
                  stroke={isServed ? 'var(--color-served)' : 'var(--color-waiting)'}
                  strokeWidth="2"
                />
              </g>
            );
          })}

          {/* Garis Segmen Riwayat Perjalanan Head */}
          {visibleTraces.map((trace, i) => {
            if (i === 0) return null;
            const prev = visibleTraces[i - 1];
            const x1 = getX(prev.headPosition);
            const y1 = getY(prev.stepIndex);
            const x2 = getX(trace.headPosition);
            const y2 = getY(trace.stepIndex);
            const isLatestLeg = i === currentStep;

            return (
              <g key={`line-leg-${i}`}>
                {/* Highlight jalur pergerakan terbaru */}
                {isLatestLeg && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--color-active)"
                    strokeWidth="6"
                    opacity="0.25"
                    strokeLinecap="round"
                  />
                )}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={trace.isJump ? 'var(--color-waiting)' : (isLatestLeg ? 'var(--color-active)' : '#64748b')}
                  strokeWidth={isLatestLeg ? 2.5 : 1.75}
                  strokeDasharray={trace.isJump ? '5 4' : undefined}
                />
              </g>
            );
          })}

          {/* Titik Simpul Tiap Langkah */}
          {visibleTraces.map((trace, i) => {
            const x = getX(trace.headPosition);
            const y = getY(trace.stepIndex);
            const isLatest = i === currentStep;
            const isHovered = hoveredPoint === i;

            if (trace.stepIndex === 0) {
              return (
                <g
                  key={`point-node-${i}`}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={x} cy={y} r={isLatest ? 7 : 5} fill="var(--color-text)" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--color-text)">
                    Awal ({trace.headPosition})
                  </text>
                </g>
              );
            }

            if (trace.servedTrack !== null) {
              return (
                <g
                  key={`point-node-${i}`}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Halo Amber jika ini langkah aktif sesuai Figma */}
                  {isLatest && (
                    <circle
                      cx={x}
                      cy={y}
                      r="11"
                      fill="var(--color-head-mark)"
                      opacity="0.16"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isLatest ? 6.5 : (isHovered ? 5 : 3.5)}
                    fill={isLatest ? 'var(--color-head-mark)' : 'var(--color-ink)'}
                    stroke="var(--color-plot)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + (x > width / 2 ? -9 : 9)}
                    y={y + 3}
                    textAnchor={x > width / 2 ? 'end' : 'start'}
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fill={isLatest ? 'var(--color-head-mark)' : 'var(--color-ink)'}
                    fontWeight={isLatest ? '700' : '500'}
                  >
                    {trace.headPosition}
                  </text>
                </g>
              );
            }

            // Batas atau titik putar tanpa request
            return (
              <g
                key={`point-node-${i}`}
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x - 4}
                  y={y - 4}
                  width={8}
                  height={8}
                  fill={trace.isJump ? 'var(--color-waiting)' : 'var(--color-text-dim)'}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill="var(--color-text-dim)"
                >
                  {trace.isJump ? 'Lompat' : `Batas ${trace.headPosition}`}
                </text>
              </g>
            );
          })}

          {/* Tracer Beacon Head Aktif (Bergerak Meluncur) */}
          {activeTrace && (
            <g transform={`translate(${getX(activeTrace.headPosition)}, ${getY(activeTrace.stepIndex)})`}>
              <circle r="3" fill="#ffffff" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

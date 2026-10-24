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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
            Grafik Jalur Pergerakan Head (Cylinder vs Waktu)
          </span>
          <span className="status-tag status-active" style={{ fontSize: '10px' }}>
            Langkah Aktif: {currentStep} / {totalSteps}
          </span>
        </div>

        {/* Legenda Simbol */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', backgroundColor: 'var(--color-active)', borderRadius: '50%' }}></span>
            Head Aktif
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', backgroundColor: 'var(--color-served)', borderRadius: '50%' }}></span>
            Selesai (Dilayani)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', border: '1px solid var(--color-waiting)', backgroundColor: 'var(--color-waiting-bg)' }}></span>
            Antrean Menunggu
          </span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', backgroundColor: '#fafbfc' }}
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
              stroke="#e2e8f0"
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
              stroke="#e2e8f0"
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
                  {/* Animasi Halo Radar jika ini langkah aktif */}
                  {isLatest && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="none"
                      stroke="var(--color-active)"
                      strokeWidth="2"
                      opacity="0.6"
                      className="head-scanner-beam"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isLatest ? 7 : (isHovered ? 6 : 4.5)}
                    fill={isLatest ? 'var(--color-active)' : 'var(--color-served)'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + (x > width / 2 ? -9 : 9)}
                    y={y + 3}
                    textAnchor={x > width / 2 ? 'end' : 'start'}
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                    fill={isLatest ? 'var(--color-active)' : 'var(--color-text)'}
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

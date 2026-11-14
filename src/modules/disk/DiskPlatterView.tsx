import React from 'react';
import type { DiskStepTrace } from '../../core/disk';
import { DEFAULT_SEEK_TIME_PER_CYLINDER } from '../../core/disk';

export interface DiskPlatterViewProps {
  currentTrace: DiskStepTrace | undefined;
  minTrack: number;
  maxTrack: number;
  allRequests?: number[];
  isPlaying?: boolean;
  seekTimePerCylinder?: number;
  cumulativeDistance?: number;
}

export const DiskPlatterView: React.FC<DiskPlatterViewProps> = ({
  currentTrace,
  minTrack,
  maxTrack,
  seekTimePerCylinder = DEFAULT_SEEK_TIME_PER_CYLINDER,
  cumulativeDistance = 0
}) => {
  const headPos = currentTrace ? currentTrace.headPosition : minTrack;
  const trackRange = Math.max(maxTrack - minTrack, 1);
  const normalizedHead = Math.max(0, Math.min(1, (headPos - minTrack) / trackRange));

  // Geometri Platter Sesuai Figma (Kotak 208px)
  const cx = 104 - 6;
  const cy = 104;
  const rings = [96, 80, 64, 48, 32];
  const armRadius = 20 + normalizedHead * 66;
  const armAngleRad = (-32 * Math.PI) / 180;
  const hx = cx + Math.cos(armAngleRad) * armRadius;
  const hy = cy + Math.sin(armAngleRad) * armRadius;
  const armEndX = cx + Math.cos(armAngleRad) * (armRadius + 34);
  const armEndY = cy + Math.sin(armAngleRad) * (armRadius + 34);

  const stepDistance = currentTrace ? currentTrace.distance : 0;
  const waitMs = (cumulativeDistance * seekTimePerCylinder).toFixed(1).replace('.', ',');

  return (
    <div className="platter-sidebar-container">
      {/* ── Box Chassis Platter ── */}
      <div className="platter-chassis-box">
        <svg
          viewBox="0 0 208 208"
          width="208"
          height="208"
          style={{ display: 'block' }}
          role="img"
          aria-label="Skematik fisik platter disk"
        >
          {/* Cincin Platter Silinder */}
          {rings.map((r) => (
            <circle
              key={`ring-${r}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--color-chassis-line)"
              strokeWidth="1"
            />
          ))}

          {/* Poros Spindle Tengah */}
          <circle cx={cx} cy={cy} r={5} fill="var(--color-chassis-line)" />

          {/* Lengan Aktuator Mekanik */}
          <line
            x1={armEndX}
            y1={armEndY}
            x2={hx}
            y2={hy}
            stroke="var(--color-chassis-ink)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Head Dot (Amber) */}
          <circle
            cx={hx}
            cy={hy}
            r={5}
            fill="var(--color-head-mark)"
          />

          {/* Label PLATTER */}
          <text
            x={104}
            y={196}
            fontSize="11"
            fontWeight="600"
            fill="var(--color-chassis-ink)"
            textAnchor="middle"
            letterSpacing="0.08em"
            opacity="0.55"
            fontFamily="var(--font-sans)"
          >
            PLATTER
          </text>
        </svg>
      </div>

      {/* ── Readout Silinder & Jarak (Sesuai Figma) ── */}
      <div className="platter-readout-section">
        <div style={{ textAlign: 'center', padding: '10px 0 8px' }}>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--color-ink3)' }}>
            silinder
          </div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>
            {headPos}
          </div>
        </div>

        <div className="rule-divider" />

        <div className="platter-stats-table">
          <div className="platter-stat-row">
            <span className="stat-label">Jarak langkah</span>
            <span className="stat-val mono">{stepDistance} track</span>
          </div>
          <div className="platter-stat-row">
            <span className="stat-label">Kumulatif</span>
            <span className="stat-val mono">{cumulativeDistance} track</span>
          </div>
          <div className="platter-stat-row">
            <span className="stat-label">Tunggu terlayani</span>
            <span className="stat-val mono">{waitMs} ms</span>
          </div>
        </div>

        <div className="rule-divider" />

        <p className="platter-note">
          Radius = nomor silinder; sudut tetap. Tidak diskalakan terhadap waktu.
        </p>
      </div>
    </div>
  );
};

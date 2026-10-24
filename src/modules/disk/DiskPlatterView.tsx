import React from 'react';
import type { DiskStepTrace } from '../../core/disk';

export interface DiskPlatterViewProps {
  currentTrace: DiskStepTrace | undefined;
  minTrack: number;
  maxTrack: number;
  allRequests: number[];
  isPlaying: boolean;
}

export const DiskPlatterView: React.FC<DiskPlatterViewProps> = ({
  currentTrace,
  minTrack,
  maxTrack,
  allRequests,
  isPlaying
}) => {
  const headPos = currentTrace ? currentTrace.headPosition : minTrack;
  const trackRange = Math.max(maxTrack - minTrack, 1);
  const normalizedHead = Math.max(0, Math.min(1, (headPos - minTrack) / trackRange));

  // Geometri Piringan (SVG ViewBox 480 x 280)
  const platterCenterX = 160;
  const platterCenterY = 140;
  const innerRadius = 40;   // Silinder terdalam
  const outerRadius = 120;  // Silinder terluar

  // Radius posisi head saat ini (track 0 berada di innerRadius, maxTrack di outerRadius)
  const currentHeadRadius = innerRadius + normalizedHead * (outerRadius - innerRadius);

  // Geometri Actuator Arm & Pivot VCM
  const pivotX = 380;
  const pivotY = 200;

  // Hitung sudut rotasi arm mekanik mengelilingi pivot agar head tepat menyentuh track
  // Sudut baseline saat head di outerRadius (-28 deg), saat di innerRadius (-8 deg)
  const baseAngle = -28 + (1 - normalizedHead) * 20;
  const armLength = 220;

  // Status aksi mekanik saat ini
  const remainingSet = new Set(currentTrace?.remainingRequests || []);
  const isServingNow = currentTrace && currentTrace.servedTrack !== null && currentTrace.stepIndex > 0;
  const isMoving = currentTrace && currentTrace.distance > 0;

  return (
    <div className="hardware-chassis" style={{ flex: 1 }}>
      {/* Platter area + info side-by-side */}
      <div style={{ display: 'flex', height: '100%' }}>
        {/* SVG area */}
        <div style={{ flex: 1, padding: '8px', position: 'relative' }}>
        <svg
          viewBox="0 0 480 270"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '260px',
            display: 'block'
          }}
          role="img"
          aria-label="Animasi mekanik hard disk dengan piringan berputar dan pergerakan lengan actuator"
        >
          <defs>
            {/* Gradien Logam Casing */}
            <linearGradient id="chassisGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Gradien Refleksi Piringan Magnetik */}
            <radialGradient id="platterReflect" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="85%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* Gradien Lengan Actuator Logam */}
            <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Casing / Baseplate HDD */}
          <rect
            x="6"
            y="6"
            width="468"
            height="258"
            fill="url(#chassisGrad)"
            stroke="#334155"
            strokeWidth="1.5"
            rx="4"
          />

          {/* Sekrup Sudut Casing */}
          {[[20, 20], [460, 20], [20, 250], [460, 250]].map(([sx, sy], i) => (
            <circle key={`screw-${i}`} cx={sx} cy={sy} r="4" fill="#334155" stroke="#475569" strokeWidth="1" />
          ))}

          {/* PIRINGAN MAGNETIK (PLATTER) */}
          <g>
            {/* Bayangan Alur Piringan Luar */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={outerRadius + 4}
              fill="#090d16"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Piringan Utama (Berputar saat isPlaying) */}
            <g className={isPlaying ? 'spinning-platter' : ''}>
              <circle
                cx={platterCenterX}
                cy={platterCenterY}
                r={outerRadius}
                fill="url(#platterReflect)"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              {/* Garis-Garis Sektor Radial (Spokes Piringan) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                const ang = (deg * Math.PI) / 180;
                const x1 = platterCenterX + innerRadius * Math.cos(ang);
                const y1 = platterCenterY + innerRadius * Math.sin(ang);
                const x2 = platterCenterX + outerRadius * Math.cos(ang);
                const y2 = platterCenterY + outerRadius * Math.sin(ang);
                return (
                  <line
                    key={`spoke-${deg}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth="0.75"
                    strokeDasharray="4 6"
                    opacity="0.6"
                  />
                );
              })}

              {/* Alur Silinder Konsentris Halus */}
              {[0.15, 0.35, 0.55, 0.75, 0.95].map((ratio) => {
                const r = innerRadius + ratio * (outerRadius - innerRadius);
                return (
                  <circle
                    key={`groove-${ratio}`}
                    cx={platterCenterX}
                    cy={platterCenterY}
                    r={r}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                );
              })}
            </g>

            {/* Cincin Laser Silinder Aktif Saat Ini */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={currentHeadRadius}
              fill="none"
              stroke="var(--color-active-bright)"
              strokeWidth="2"
              opacity="0.85"
            />
            {isServingNow && (
              <circle
                cx={platterCenterX}
                cy={platterCenterY}
                r={currentHeadRadius}
                fill="none"
                stroke="var(--color-served-bright)"
                strokeWidth="4"
                opacity="0.5"
                className="head-scanner-beam"
              />
            )}

            {/* Titik-Titik Antrean Request di Piringan */}
            {allRequests.map((req, idx) => {
              const reqNorm = Math.max(0, Math.min(1, (req - minTrack) / trackRange));
              const reqRadius = innerRadius + reqNorm * (outerRadius - innerRadius);
              const isRemaining = remainingSet.has(req);
              const isCurrent = headPos === req;

              // Distribusikan sudut sektor
              const angle = (idx * (360 / Math.max(allRequests.length, 1)) * Math.PI) / 180;
              const rx = platterCenterX + reqRadius * Math.cos(angle);
              const ry = platterCenterY + reqRadius * Math.sin(angle);

              return (
                <g key={`platter-req-${idx}-${req}`}>
                  <circle
                    cx={rx}
                    cy={ry}
                    r={isCurrent ? 5.5 : 4}
                    fill={isCurrent ? 'var(--color-active-bright)' : (isRemaining ? 'var(--color-waiting-bright)' : 'var(--color-served-bright)')}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                </g>
              );
            })}

            {/* Spindle Motor Tengah (Hub Poros Logam) */}
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r={innerRadius}
              fill="#334155"
              stroke="#64748b"
              strokeWidth="2"
            />
            <circle
              cx={platterCenterX}
              cy={platterCenterY}
              r="14"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="1.5"
            />
            {/* 3 Baut Spindle Hub */}
            {[0, 120, 240].map((deg) => {
              const radB = (deg * Math.PI) / 180;
              const bx = platterCenterX + 8 * Math.cos(radB);
              const by = platterCenterY + 8 * Math.sin(radB);
              return <circle key={`spindle-bolt-${deg}`} cx={bx} cy={by} r="2" fill="#94a3b8" />;
            })}
          </g>

          {/* VOICE COIL MOTOR (VCM) & MAGNET PIVOT */}
          <g>
            {/* Magnet Lengkung VCM */}
            <path
              d="M 370 140 A 70 70 0 0 1 430 230 L 400 230 A 45 45 0 0 0 360 160 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <path
              d="M 365 150 A 60 60 0 0 1 420 220"
              fill="none"
              stroke="#d97706"
              strokeWidth="3"
              strokeDasharray="4 2"
              opacity="0.8"
            />

            {/* Pivot Bearing Dasar */}
            <circle cx={pivotX} cy={pivotY} r="22" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <circle cx={pivotX} cy={pivotY} r="14" fill="#334155" />
            <circle cx={pivotX} cy={pivotY} r="6" fill="#cbd5e1" />
          </g>

          {/* LENGAN ACTUATOR MEKANIK (DIPERKUAT DENGAN ROTASI CSS HALUS) */}
          <g
            style={{
              transformOrigin: `${pivotX}px ${pivotY}px`,
              transform: `rotate(${baseAngle + 20}deg)`,
              transition: 'transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)'
            }}
          >
            {/* Coil Ekor di belakang pivot */}
            <polygon
              points={`${pivotX + 5},${pivotY - 14} ${pivotX + 38},${pivotY - 24} ${pivotX + 42},${pivotY + 12} ${pivotX + 8},${pivotY + 12}`}
              fill="#b45309"
              stroke="#d97706"
              strokeWidth="1"
            />

            {/* Badan Lengan Utama Logam Menipis */}
            <polygon
              points={`${pivotX - 10},${pivotY - 10} ${pivotX - armLength + 15},${pivotY - 2} ${pivotX - armLength},${pivotY} ${pivotX - armLength + 15},${pivotY + 2} ${pivotX - 10},${pivotY + 10}`}
              fill="url(#armGrad)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Lubang Peredam Bobot Lengan (Weight Reduction Cutouts) */}
            <circle cx={pivotX - 60} cy={pivotY} r="6" fill="#0f172a" />
            <circle cx={pivotX - 110} cy={pivotY} r="4.5" fill="#0f172a" />
            <circle cx={pivotX - 150} cy={pivotY} r="3.5" fill="#0f172a" />

            {/* Fleksibel Pita Kabel (Flex Ribbon Cable) */}
            <path
              d={`M ${pivotX - 15} ${pivotY + 10} Q ${pivotX + 15} ${pivotY + 35} ${pivotX + 30} ${pivotY + 45}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              opacity="0.85"
            />

            {/* Ujung Slider Head (Read/Write Gimbal Head) */}
            <rect
              x={pivotX - armLength - 6}
              y={pivotY - 5}
              width="14"
              height="10"
              fill="var(--color-active-bright)"
              stroke="#ffffff"
              strokeWidth="1.5"
              rx="1.5"
            />

            {/* LED Status Head Laser */}
            <circle
              cx={pivotX - armLength + 1}
              cy={pivotY}
              r="3"
              fill={isServingNow ? 'var(--color-served-bright)' : 'var(--color-active-bright)'}
              className={isServingNow ? 'head-scanner-beam' : ''}
            />
          </g>

          {/* SKALA LINEAR TRACK DI BAGIAN BAWAH */}
          <g transform="translate(30, 245)">
            <rect x="0" y="-3" width="420" height="6" fill="#1e293b" rx="3" />
            <rect
              x="0"
              y="-3"
              width={normalizedHead * 420}
              height="6"
              fill="var(--color-active-bright)"
              rx="3"
              style={{ transition: 'width 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
            />
            {/* Pin Indikator Head */}
            <circle
              cx={normalizedHead * 420}
              cy="0"
              r="7"
              fill="var(--color-active-bright)"
              stroke="#ffffff"
              strokeWidth="2"
              style={{ transition: 'cx 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
            />
            <text x="0" y="16" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-chassis-muted)">
              Track 0
            </text>
            <text x="420" y="16" textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-chassis-muted)">
              Track {maxTrack}
            </text>
            <text
              x={Math.max(45, Math.min(375, normalizedHead * 420))}
              y="-8"
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--font-mono)"
              fontWeight="600"
              fill="var(--color-active-bright)"
              style={{ transition: 'x 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
            >
              Head: {headPos}
            </text>
          </g>
        </svg>
      </div>

        {/* Info sidebar kanan */}
        <div style={{
          width: '130px',
          borderLeft: '1px solid var(--color-chassis-border)',
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          justifyContent: 'center'
        }}>
          {/* Cylinder aktif - angka besar */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--color-accent)',
              lineHeight: 1,
              letterSpacing: '-1px'
            }}>
              {headPos}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted)', marginTop: '4px' }}>
              Silinder aktif
            </div>
          </div>

          {/* t = seek time */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--color-text-muted)'
            }}>
              t = {isMoving && currentTrace
                ? (currentTrace.distance * 0.1).toFixed(1)
                : '0.0'} ms
            </div>
          </div>

          <div style={{
            fontSize: '10px',
            color: 'var(--color-chassis-muted)',
            lineHeight: '1.5',
            borderTop: '1px solid var(--color-chassis-border)',
            paddingTop: '8px'
          }}>
            Rotasi hanya ilustrasi; tidak dihitung sebagai seek.
          </div>

          {/* Status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="status-dot active" style={{
              backgroundColor: isServingNow
                ? 'var(--color-served)'
                : isMoving
                ? 'var(--color-waiting)'
                : 'var(--color-accent)'
            }} />
            <span style={{ fontSize: '10px', color: 'var(--color-chassis-muted)', fontFamily: 'var(--font-mono)' }}>
              {isServingNow ? 'R/W' : isMoving ? 'SEEK' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

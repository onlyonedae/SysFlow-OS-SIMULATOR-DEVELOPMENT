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

  // Geometri Piringan (SVG ViewBox 460 x 260)
  const platterCenterX = 150;
  const platterCenterY = 130;
  const innerRadius = 36;   // Silinder terdalam
  const outerRadius = 112;  // Silinder terluar
  const armLength = 208;
  const pivotX = 360;
  const pivotY = 180;

  // Radius posisi head saat ini (track 0 berada di innerRadius, maxTrack di outerRadius)
  const currentHeadRadius = innerRadius + normalizedHead * (outerRadius - innerRadius);

  // Exact Trigonometric Arm Rotation via Law of Cosines
  // Menghitung sudut rotasi presisi matematis agar ujung head tepat menempel pada cincin silinder aktif
  const D = Math.hypot(pivotX - platterCenterX, pivotY - platterCenterY);
  const cosTheta = (armLength * armLength + D * D - currentHeadRadius * currentHeadRadius) / (2 * armLength * D);
  const thetaDeg = (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180) / Math.PI;
  const baseAngle = (Math.atan2(platterCenterY - pivotY, platterCenterX - pivotX) * 180) / Math.PI;
  const armAngle = baseAngle + thetaDeg;
  const armRotation = armAngle + 180;

  // Status aksi mekanik saat ini
  const remainingSet = new Set(currentTrace?.remainingRequests || []);
  const isServingNow = Boolean(currentTrace && currentTrace.servedTrack !== null && currentTrace.stepIndex > 0);
  const isMoving = Boolean(currentTrace && currentTrace.distance > 0);
  const seekTime = isMoving && currentTrace ? (currentTrace.distance * 0.1).toFixed(1).replace('.', ',') : '0,0';
  const headPercent = ((normalizedHead) * 100).toFixed(0);

  return (
    <div className="hardware-chassis" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* SVG Area (Piringan & Lengan Mekanik) */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          backgroundColor: 'var(--color-surface)',
          position: 'relative'
        }}>
          <svg
            viewBox="0 0 460 260"
            style={{
              width: '100%',
              height: '100%',
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
                <stop offset="100%" stopColor="#0b1120" />
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
              x="5"
              y="5"
              width="450"
              height="250"
              fill="url(#chassisGrad)"
              stroke="#334155"
              strokeWidth="1.5"
              rx="6"
            />

            {/* Sekrup Sudut Casing */}
            {[[18, 18], [442, 18], [18, 242], [442, 242]].map(([sx, sy], i) => (
              <circle key={`screw-${i}`} cx={sx} cy={sy} r="3.5" fill="#334155" stroke="#475569" strokeWidth="1" />
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
              <g
                className={isPlaying ? 'spinning-platter' : ''}
                style={{ transformOrigin: `${platterCenterX}px ${platterCenterY}px` }}
              >
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
                strokeWidth="2.2"
                opacity="0.85"
                strokeDasharray={isMoving ? '4 2' : undefined}
                style={{ transition: 'r 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
              />
              {isServingNow && (
                <circle
                  cx={platterCenterX}
                  cy={platterCenterY}
                  r={currentHeadRadius}
                  fill="none"
                  stroke="var(--color-served-bright)"
                  strokeWidth="4.5"
                  opacity="0.6"
                  className="head-scanner-beam"
                  style={{ transition: 'r 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)' }}
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
                r="13"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.5"
              />
              {/* 3 Baut Spindle Hub */}
              {[0, 120, 240].map((deg) => {
                const radB = (deg * Math.PI) / 180;
                const bx = platterCenterX + 7.5 * Math.cos(radB);
                const by = platterCenterY + 7.5 * Math.sin(radB);
                return <circle key={`spindle-bolt-${deg}`} cx={bx} cy={by} r="1.8" fill="#94a3b8" />;
              })}
            </g>

            {/* VOICE COIL MOTOR (VCM) & MAGNET PIVOT */}
            <g>
              {/* Magnet Lengkung VCM */}
              <path
                d="M 350 125 A 65 65 0 0 1 415 210 L 385 210 A 40 40 0 0 0 340 145 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <path
                d="M 345 135 A 55 55 0 0 1 405 200"
                fill="none"
                stroke="#d97706"
                strokeWidth="3"
                strokeDasharray="4 2"
                opacity="0.8"
              />

              {/* Pivot Bearing Dasar */}
              <circle cx={pivotX} cy={pivotY} r="20" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx={pivotX} cy={pivotY} r="13" fill="#334155" />
              <circle cx={pivotX} cy={pivotY} r="5.5" fill="#cbd5e1" />
            </g>

            {/* LENGAN ACTUATOR MEKANIK (DIPERKUAT DENGAN ROTASI TRIGONOMETRI PRESISI) */}
            <g
              style={{
                transformOrigin: `${pivotX}px ${pivotY}px`,
                transform: `rotate(${armRotation}deg)`,
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
                points={`${pivotX - 10},${pivotY - 9} ${pivotX - armLength + 15},${pivotY - 2} ${pivotX - armLength},${pivotY} ${pivotX - armLength + 15},${pivotY + 2} ${pivotX - 10},${pivotY + 9}`}
                fill="url(#armGrad)"
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Lubang Peredam Bobot Lengan (Weight Reduction Cutouts) */}
              <circle cx={pivotX - 55} cy={pivotY} r="5.5" fill="#0f172a" />
              <circle cx={pivotX - 105} cy={pivotY} r="4" fill="#0f172a" />
              <circle cx={pivotX - 145} cy={pivotY} r="3" fill="#0f172a" />

              {/* Fleksibel Pita Kabel (Flex Ribbon Cable) */}
              <path
                d={`M ${pivotX - 15} ${pivotY + 9} Q ${pivotX + 15} ${pivotY + 32} ${pivotX + 30} ${pivotY + 42}`}
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
          </svg>
        </div>

        {/* Sidebar Info & Telemetri Platter */}
        <div style={{
          width: '165px',
          flexShrink: 0,
          borderLeft: '1px solid var(--color-border)',
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)',
          gap: '10px'
        }}>
          {/* Header & Head Position */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '9.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontWeight: 600
              }}>
                HEAD SILINDER
              </span>
              <span style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-accent)',
                backgroundColor: 'var(--color-accent-bg-2)',
                padding: '1px 5px',
                borderRadius: '3px'
              }}>
                {headPercent}%
              </span>
            </div>

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--color-accent)',
              lineHeight: 1,
              letterSpacing: '-1px'
            }}>
              {headPos}
            </div>

            <div style={{ fontSize: '10.5px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              Silinder / Track aktif
            </div>

            {/* Mini track visual bar */}
            <div style={{ marginTop: '8px' }}>
              <div style={{
                height: '4px',
                backgroundColor: 'var(--color-border)',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${headPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-accent)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '8.5px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-dim)',
                marginTop: '3px'
              }}>
                <span>T:{minTrack}</span>
                <span>T:{maxTrack}</span>
              </div>
            </div>
          </div>

          {/* Seek time & jarak */}
          <div style={{
            padding: '8px 10px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text)'
            }}>
              t = {seekTime} ms
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              {isMoving && currentTrace ? `Gerak: ${currentTrace.distance} track` : 'Posisi stabil'}
            </div>
          </div>

          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '6px 8px',
            borderRadius: 'var(--border-radius)',
            backgroundColor: isServingNow
              ? 'var(--color-served-bg)'
              : isMoving
              ? 'var(--color-waiting-bg)'
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${
              isServingNow
                ? 'var(--color-served-border)'
                : isMoving
                ? 'var(--color-waiting-border)'
                : 'var(--color-border)'
            }`
          }}>
            <span
              className="status-dot active"
              style={{
                backgroundColor: isServingNow
                  ? 'var(--color-served)'
                  : isMoving
                  ? 'var(--color-waiting)'
                  : 'var(--color-accent)'
              }}
            />
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: isServingNow
                ? 'var(--color-served)'
                : isMoving
                ? 'var(--color-waiting)'
                : 'var(--color-text-muted)'
            }}>
              {isServingNow ? 'R/W AKTIF' : isMoving ? 'SEEKING' : 'IDLE / SIAP'}
            </span>
          </div>

          {/* Sisa antrean */}
          <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
            Antrean sisa: <strong style={{ color: 'var(--color-text)' }}>{remainingSet.size}</strong> req
          </div>

          {/* Catatan Rotasi */}
          <div style={{
            fontSize: '9.5px',
            color: 'var(--color-text-dim)',
            lineHeight: '1.4',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '6px'
          }}>
            Rotasi piringan kontinu; seek dihitung murni perpindahan lengan silinder.
          </div>
        </div>
      </div>
    </div>
  );
};

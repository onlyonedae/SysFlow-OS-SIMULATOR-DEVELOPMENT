import React, { useEffect } from 'react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  timeMs?: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  timeMs,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange
}) => {
  // Dukungan keyboard aksesibel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, select, textarea, [role="button"], [role="slider"], [contenteditable]')) {
        return;
      }
      if (document.querySelector('[role="dialog"], .modal-overlay')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause(); else onPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onStepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlay, onPause, onStepForward, onStepBackward, onReset]);

  return (
    <div className="instrument-playback-bar">
      {/* ── Cluster Tombol Navigasi Sesuai Tangkapan Layar ── */}
      <div className="playback-controls-cluster">
        {/* Grup 3 Tombol Bersegmen [⏮][▶/⏸][⏭] */}
        <div className="playback-segmented-group" role="group" aria-label="Kontrol putar animasi">
          {/* 1. Tombol Mundur (⏮) */}
          <button
            type="button"
            className="playback-seg-btn"
            onClick={onStepBackward}
            disabled={currentStep <= 0}
            title="Langkah sebelumnya (Panah Kiri)"
            aria-label="Langkah sebelumnya"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* 2. Tombol Putar / Jeda (▶ / ⏸) */}
          <button
            type="button"
            className="playback-seg-btn"
            onClick={isPlaying ? onPause : onPlay}
            disabled={!isPlaying && currentStep >= totalSteps}
            title={isPlaying ? 'Jeda simulasi (Spasi)' : 'Putar simulasi (Spasi)'}
            aria-label={isPlaying ? 'Jeda simulasi' : 'Putar simulasi'}
          >
            {isPlaying ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>

          {/* 3. Tombol Maju (⏭) */}
          <button
            type="button"
            className="playback-seg-btn"
            onClick={onStepForward}
            disabled={currentStep >= totalSteps}
            title="Langkah berikutnya (Panah Kanan)"
            aria-label="Langkah berikutnya"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Tombol Reset (↺) */}
        <button
          type="button"
          className="playback-reset-btn"
          onClick={onReset}
          title="Reset simulasi ke awal (R)"
          aria-label="Reset simulasi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* ── Status Langkah & Waktu Real-Time ── */}
      <div className="playback-step-status">
        <span>LANGKAH</span>
        <span className="status-tag">{currentStep}</span>
        <span>/ {totalSteps}</span>
        {timeMs !== undefined && (
          <span style={{ color: 'var(--color-ink3)', marginLeft: '4px' }}>
            · t = {timeMs} ms
          </span>
        )}
      </div>

      {/* ── Slider Kecepatan ── */}
      <div className="playback-speed-wrap">
        <span className="mono">Kecepatan:</span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="playback-speed-slider"
          aria-label="Kecepatan putar"
        />
        <span className="playback-speed-val mono">{speed.toFixed(1)}×</span>
      </div>
    </div>
  );
};

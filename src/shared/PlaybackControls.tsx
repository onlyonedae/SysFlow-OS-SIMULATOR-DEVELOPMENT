import React, { useEffect } from 'react';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
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
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange
}) => {
  // Dukungan keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause(); else onPlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault(); onStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault(); onStepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault(); onReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onPlay, onPause, onStepForward, onStepBackward, onReset]);

  const progressPct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="playback-bar">
      {/* ── Play/Pause Button ── */}
      {isPlaying ? (
        <button
          type="button"
          id="playback-pause-btn"
          className="playback-btn-play"
          onClick={onPause}
          title="Jeda pemutaran (Spasi)"
          aria-label="Jeda simulasi"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          Jeda
        </button>
      ) : (
        <button
          type="button"
          id="playback-play-btn"
          className="playback-btn-play"
          onClick={onPlay}
          disabled={currentStep >= totalSteps}
          title="Putar simulasi (Spasi)"
          aria-label="Mulai simulasi"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Lanjutkan
        </button>
      )}

      {/* ── Step Backward ── */}
      <button
        type="button"
        id="playback-back-btn"
        className="playback-btn-icon"
        onClick={onStepBackward}
        disabled={currentStep <= 0}
        title="Langkah mundur (←)"
        aria-label="Langkah mundur"
      >
        ←
      </button>

      {/* ── Step Forward ── */}
      <button
        type="button"
        id="playback-fwd-btn"
        className="playback-btn-icon"
        onClick={onStepForward}
        disabled={currentStep >= totalSteps}
        title="Langkah maju (→)"
        aria-label="Langkah maju"
      >
        →
      </button>

      {/* ── Reset ── */}
      <button
        type="button"
        id="playback-reset-btn"
        className="btn btn-sm"
        onClick={onReset}
        title="Reset ke awal (R)"
        aria-label="Reset simulasi"
      >
        Reset
      </button>

      {/* ── Progress Bar ── */}
      <div
        className="playback-progress-bar"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-label={`Langkah ${currentStep} dari ${totalSteps}`}
      >
        <div
          className="playback-progress-fill"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Progress Label ── */}
      <span className="playback-label">
        {currentStep} / {totalSteps} • {progressPct.toFixed(1)}%
      </span>

      {/* ── Kecepatan ── */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
        <span>Kecepatan</span>
        <select
          id="playback-speed-select"
          className="speed-select"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          aria-label="Kecepatan putar"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={1.5}>1.5×</option>
          <option value={2}>2×</option>
        </select>
      </label>
    </div>
  );
};

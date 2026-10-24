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
  // Dukungan navigasi keyboard (Space, ArrowLeft, ArrowRight, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Jangan cegah shortcut jika pengguna sedang mengetik di input text / textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) onPause();
        else onPlay();
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
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '8px 12px',
      backgroundColor: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderTop: 'none'
    }}>
      {/* Tombol Kontrol Navigasi Langkah */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          className="btn btn-sm"
          onClick={onReset}
          title="Reset simulasi ke awal (R)"
          aria-label="Reset simulasi"
        >
          Reset (R)
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={onStepBackward}
          disabled={currentStep <= 0}
          title="Langkah mundur satu step (Panah Kiri)"
          aria-label="Langkah mundur"
        >
          ◀ Mundur
        </button>
        {isPlaying ? (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={onPause}
            title="Jeda pemutaran (Spasi)"
            aria-label="Jeda simulasi"
          >
            ❚❚ Jeda
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={onPlay}
            disabled={currentStep >= totalSteps}
            title="Putar simulasi otomatis (Spasi)"
            aria-label="Mulai simulasi"
          >
            ▶ Putar
          </button>
        )}
        <button
          type="button"
          className="btn btn-sm"
          onClick={onStepForward}
          disabled={currentStep >= totalSteps}
          title="Langkah maju satu step (Panah Kanan)"
          aria-label="Langkah maju"
        >
          Maju ▶
        </button>
      </div>

      {/* Indikator Langkah & Pengatur Kecepatan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Langkah: <strong className="mono" style={{ color: 'var(--color-text)' }}>{currentStep}</strong> / <span className="mono">{totalSteps}</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span>Kecepatan:</span>
          <select
            className="form-select"
            style={{ width: '80px', padding: '2px 4px', fontSize: '11px' }}
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            aria-label="Kecepatan putar"
          >
            <option value={0.5}>0.5x (Lambat)</option>
            <option value={1}>1.0x (Normal)</option>
            <option value={1.5}>1.5x (Cepat)</option>
            <option value={2}>2.0x (Sangat cepat)</option>
          </select>
        </label>
      </div>
    </div>
  );
};

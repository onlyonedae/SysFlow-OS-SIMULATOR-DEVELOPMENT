import React from 'react';

export interface StepExplanationProps {
  currentStep: number;
  totalSteps: number;
  explanation: string;
  headPosition?: number;
  distance?: number;
  isJump?: boolean;
}

export const StepExplanation: React.FC<StepExplanationProps> = ({
  currentStep,
  totalSteps,
  explanation,
  headPosition,
  distance,
  isJump
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderTop: 'none',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--color-text-muted)'
      }}>
        <span>Status langkah ({currentStep}/{totalSteps}):</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {headPosition !== undefined && (
            <span>Posisi: <strong className="mono" style={{ color: 'var(--color-active)' }}>{headPosition}</strong></span>
          )}
          {distance !== undefined && distance > 0 && (
            <span>Jarak: <strong className="mono" style={{ color: isJump ? 'var(--color-waiting)' : 'var(--color-text)' }}>{distance} track</strong></span>
          )}
        </div>
      </div>
      <div style={{
        fontSize: '13px',
        color: 'var(--color-text)',
        fontWeight: 500,
        minHeight: '22px'
      }}>
        {explanation || (currentStep === 0 ? 'Tekan Putar atau Maju untuk memulai simulasi.' : 'Simulasi selesai.')}
      </div>
    </div>
  );
};

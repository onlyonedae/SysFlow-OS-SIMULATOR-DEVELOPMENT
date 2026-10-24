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
  if (currentStep === 0) {
    return (
      <div style={{
        padding: '10px 14px',
        fontSize: '11px',
        color: 'var(--color-text-dim)',
        borderTop: '1px solid var(--color-border)',
        fontStyle: 'italic'
      }}>
        Tekan Lanjutkan atau → untuk memulai simulasi.
      </div>
    );
  }

  return (
    <div style={{ borderTop: '1px solid var(--color-border)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        backgroundColor: 'rgba(45, 212, 191, 0.06)',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--color-accent)',
          letterSpacing: '0.5px'
        }}>
          LANGKAH {currentStep} / {totalSteps}
        </span>

        {headPosition !== undefined && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Posisi:{' '}
            <strong style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-accent)',
              fontSize: '12px'
            }}>
              {headPosition}
            </strong>
          </span>
        )}

        {distance !== undefined && distance > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Jarak:{' '}
            <strong style={{
              fontFamily: 'var(--font-mono)',
              color: isJump ? 'var(--color-waiting)' : 'var(--color-text)',
              fontSize: '12px'
            }}>
              {distance} track
            </strong>
            {isJump && (
              <span style={{ color: 'var(--color-waiting)', fontSize: '10px', marginLeft: '4px' }}>
                (lompatan)
              </span>
            )}
          </span>
        )}
      </div>

      <div style={{
        padding: '8px 14px',
        fontSize: '12px',
        color: 'var(--color-text)',
        lineHeight: '1.5',
        minHeight: '36px'
      }}>
        {explanation || (currentStep >= totalSteps ? 'Simulasi selesai.' : '')}
      </div>
    </div>
  );
};

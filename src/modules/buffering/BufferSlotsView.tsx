import React from 'react';
import type { BufferSlotState, BufferingStepTrace } from '../../core/buffering';

export interface BufferSlotsViewProps {
  slots: BufferSlotState[];
  currentTrace: BufferingStepTrace | undefined;
  method: string;
}

export const BufferSlotsView: React.FC<BufferSlotsViewProps> = ({
  slots,
  currentTrace,
  method
}) => {
  const pState = currentTrace?.producerState || 'idle';
  const cState = currentTrace?.consumerState || 'idle';
  const pItem = currentTrace?.producerCurrentItem;
  const cItem = currentTrace?.consumerCurrentItem;

  return (
    <div className="hardware-chassis">
      {/* Header Panel Hardware Buffering */}
      <div className="hardware-chassis-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot active"></span>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
            STATUS BUFFER & WORKER PIPELINE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--color-chassis-muted)' }}>
            WAKTU: <strong style={{ color: 'var(--color-active-bright)' }}>{currentTrace?.currentTime ?? 0} ms</strong>
          </span>
          <span style={{ color: 'var(--color-chassis-muted)' }}>
            SELESAI: <strong style={{ color: 'var(--color-served-bright)' }}>{currentTrace?.completedItemsCount ?? 0} item</strong>
          </span>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#0f172a' }}>
        {/* Jalur Diagram Producer -> Buffer -> Consumer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '130px 1fr 130px',
          gap: '14px',
          alignItems: 'center'
        }}>
          {/* Box PRODUCER */}
          <div style={{
            backgroundColor: '#1e293b',
            border: `1.5px solid ${pState === 'working' ? 'var(--color-waiting-bright)' : (pState === 'idle' ? 'var(--color-idle-bright)' : '#475569')}`,
            borderRadius: 'var(--border-radius)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-chassis-muted)' }}>
              PRODUCER (I/O DEVICE)
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: pState === 'working' ? 'var(--color-waiting-bright)' : (pState === 'idle' ? 'var(--color-idle-bright)' : 'var(--color-chassis-muted)')
            }}>
              {pState === 'working' ? `PRODUCE #${pItem}` : (pState === 'idle' ? 'STALLED (IDLE)' : 'MENUNGGU')}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {pState === 'working' ? 'Mengisi ke buffer' : (pState === 'idle' ? '▲ Buffer penuh' : 'Siap')}
            </div>
          </div>

          {/* AREA BUFFER SLOTS */}
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid #334155',
            borderRadius: 'var(--border-radius)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>
                Kapasitas Slot Buffer: {method === 'unbuffered' ? '0 (Langsung ke User Memory)' : `${slots.length} Slot`}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {method.toUpperCase()}
              </span>
            </div>

            {method === 'unbuffered' ? (
              <div style={{
                padding: '14px',
                textAlign: 'center',
                border: '1.5px dashed #475569',
                color: '#94a3b8',
                fontSize: '11px',
                borderRadius: 'var(--border-radius)'
              }}>
                Tidak ada buffer perantara. Producer dan Consumer harus menunggu satu sama lain secara sekuensial.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(slots.length, 6)}, 1fr)`,
                gap: '8px'
              }}>
                {slots.map((slot) => {
                  let borderColor = '#334155';
                  let bgColor = '#1e293b';
                  let statusText = 'KOSONG';
                  let statusColor = '#64748b';

                  if (slot.status === 'filling') {
                    borderColor = 'var(--color-waiting-bright)';
                    bgColor = 'rgba(245, 158, 11, 0.15)';
                    statusText = 'SEDANG DIISI';
                    statusColor = 'var(--color-waiting-bright)';
                  } else if (slot.status === 'full') {
                    borderColor = 'var(--color-served-bright)';
                    bgColor = 'rgba(34, 197, 94, 0.15)';
                    statusText = 'PENUH (READY)';
                    statusColor = 'var(--color-served-bright)';
                  } else if (slot.status === 'emptying') {
                    borderColor = 'var(--color-active-bright)';
                    bgColor = 'rgba(20, 184, 166, 0.2)';
                    statusText = 'DIPINDAHKAN';
                    statusColor = 'var(--color-active-bright)';
                  }

                  return (
                    <div
                      key={`slot-${slot.index}`}
                      style={{
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor: bgColor,
                        borderRadius: 'var(--border-radius)',
                        padding: '8px 6px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all var(--transition-normal)'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        Slot {slot.index + 1}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: slot.itemId ? '#ffffff' : '#475569'
                      }}>
                        {slot.itemId ? `Item #${slot.itemId}` : '—'}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 600, color: statusColor }}>
                        {statusText}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Box CONSUMER */}
          <div style={{
            backgroundColor: '#1e293b',
            border: `1.5px solid ${cState === 'working' ? 'var(--color-active-bright)' : (cState === 'idle' ? 'var(--color-idle-bright)' : '#475569')}`,
            borderRadius: 'var(--border-radius)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-chassis-muted)' }}>
              CONSUMER (CPU)
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: cState === 'working' ? 'var(--color-active-bright)' : (cState === 'idle' ? 'var(--color-idle-bright)' : 'var(--color-chassis-muted)')
            }}>
              {cState === 'working' ? `PROSES #${cItem}` : 'STARVED (IDLE)'}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {cState === 'working' ? 'Komputasi data' : '▲ Menunggu data buffer'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

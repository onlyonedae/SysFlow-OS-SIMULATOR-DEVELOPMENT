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

  const producerBorder = pState === 'working'
    ? 'var(--color-waiting-bright)'
    : pState === 'idle'
    ? 'var(--color-idle-bright)'
    : 'var(--color-chassis-border)';

  const consumerBorder = cState === 'working'
    ? 'var(--color-active-bright)'
    : cState === 'idle'
    ? 'var(--color-idle-bright)'
    : 'var(--color-chassis-border)';

  return (
    <div className="hardware-chassis">
      {/* Header Panel */}
      <div className="hardware-chassis-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot active"></span>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
            STATUS BUFFER &amp; WORKER PIPELINE
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

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--color-chassis-inner)' }}>
        {/* Diagram Producer → Buffer → Consumer */}
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 130px', gap: '14px', alignItems: 'center' }}>

          {/* Box PRODUCER */}
          <div style={{
            backgroundColor: 'var(--color-chassis-node)',
            border: `1.5px solid ${producerBorder}`,
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
              color: pState === 'working'
                ? 'var(--color-waiting-bright)'
                : pState === 'idle'
                ? 'var(--color-idle-bright)'
                : 'var(--color-chassis-muted)'
            }}>
              {pState === 'working' ? `PRODUCE #${pItem}` : pState === 'idle' ? 'STALLED (IDLE)' : 'MENUNGGU'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted-2)' }}>
              {pState === 'working' ? 'Mengisi ke buffer' : pState === 'idle' ? '▲ Buffer penuh' : 'Siap'}
            </div>
          </div>

          {/* AREA BUFFER SLOTS */}
          <div style={{
            backgroundColor: 'var(--color-chassis-surface)',
            border: '1px solid var(--color-chassis-border)',
            borderRadius: 'var(--border-radius)',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-chassis-text)' }}>
                Kapasitas: {method === 'unbuffered' ? '0 (Langsung)' : `${slots.length} Slot`}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-chassis-muted)', fontFamily: 'var(--font-mono)' }}>
                {method.toUpperCase()}
              </span>
            </div>

            {method === 'unbuffered' ? (
              <div style={{
                padding: '14px',
                textAlign: 'center',
                border: '1.5px dashed var(--color-chassis-border)',
                color: 'var(--color-chassis-muted)',
                fontSize: '11px',
                borderRadius: 'var(--border-radius)',
                lineHeight: '1.5'
              }}>
                Tidak ada buffer perantara. Producer dan Consumer menunggu satu sama lain secara sekuensial.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(slots.length, 6)}, 1fr)`,
                gap: '8px'
              }}>
                {slots.map((slot) => {
                  let borderColor = 'var(--color-chassis-border)';
                  let bgColor = 'var(--color-chassis-node)';
                  let statusText = 'KOSONG';
                  let statusColor = 'var(--color-chassis-muted)';

                  if (slot.status === 'filling') {
                    borderColor = 'var(--color-waiting-bright)';
                    bgColor = 'var(--color-waiting-bg)';
                    statusText = 'SEDANG DIISI';
                    statusColor = 'var(--color-waiting-bright)';
                  } else if (slot.status === 'full') {
                    borderColor = 'var(--color-served-bright)';
                    bgColor = 'var(--color-served-bg)';
                    statusText = 'PENUH (READY)';
                    statusColor = 'var(--color-served-bright)';
                  } else if (slot.status === 'emptying') {
                    borderColor = 'var(--color-active-bright)';
                    bgColor = 'var(--color-active-bg)';
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
                        transition: 'border-color var(--transition-normal), background-color var(--transition-normal)'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted)', fontFamily: 'var(--font-mono)' }}>
                        Slot {slot.index + 1}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: slot.itemId ? 'var(--color-chassis-text)' : 'var(--color-chassis-border)'
                      }}>
                        {slot.itemId ? `#${slot.itemId}` : '—'}
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
            backgroundColor: 'var(--color-chassis-node)',
            border: `1.5px solid ${consumerBorder}`,
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
              color: cState === 'working'
                ? 'var(--color-active-bright)'
                : 'var(--color-idle-bright)'
            }}>
              {cState === 'working' ? `PROSES #${cItem}` : 'STARVED (IDLE)'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted-2)' }}>
              {cState === 'working' ? 'Komputasi data' : '▲ Menunggu data'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const pIdle = currentTrace?.producerIdleTotal ?? 0;
  const cIdle = currentTrace?.consumerIdleTotal ?? 0;

  return (
    <div className="buffering-stage2-top">
      {/* ─── Header Slot Buffer ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink3)' }}>Slot buffer</span>
        <span className="mono" style={{ fontSize: '12px', color: 'var(--color-ink3)' }}>
          t = {currentTrace?.currentTime ?? 0} ms
        </span>
      </div>

      {/* ─── Kartu Slot Buffer Sesuai Figma ─── */}
      {method === 'unbuffered' ? (
        <div style={{
          backgroundColor: 'var(--color-sunk)',
          border: '1px solid var(--color-rule)',
          borderRadius: '2px',
          padding: '16px',
          color: 'var(--color-ink3)',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          0 slot (Tanpa buffer) · Aliran data langsung antara I/O producer dan CPU consumer.
        </div>
      ) : (
        <div className="slot-cards-container">
          {slots.map((s, i) => {
            const isFull = s.status === 'full';
            const isEmptying = s.status === 'emptying';
            const statusClass = isFull ? 'full' : isEmptying ? 'emptying' : 'empty';
            const badgeLabel = isFull ? 'PENUH' : isEmptying ? 'DIAMBIL' : 'KOSONG';

            return (
              <div key={s.index} className={`slot-card-item ${statusClass}`}>
                <div className="slot-card-header">
                  <span className="slot-card-title">Slot {i + 1}</span>
                  <span className="slot-card-badge">{badgeLabel}</span>
                </div>
                <div className="slot-card-body">
                  {isFull || isEmptying ? `item ${s.itemId ?? (i + 1)}` : '—'}
                </div>
                <div className="slot-card-sub">
                  {isFull
                    ? 'menunggu consumer'
                    : isEmptying
                    ? `item ${s.itemId ?? (i + 1)} · diproses`
                    : 'menunggu producer'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Telemetri Status Aktor (Producer & Consumer) ─── */}
      <div className="actor-readout-grid">
        <div className="actor-readout-col">
          <div className="actor-readout-title">
            <span>Producer</span>
            <span className="mono" style={{ fontSize: '11px', color: pState === 'working' ? 'var(--color-accent)' : 'var(--color-ink3)' }}>
              {pState.toUpperCase()}
            </span>
          </div>
          <div className="actor-readout-sub">
            {pItem ? `item ${pItem}` : '—'} · menganggur {pIdle.toFixed(1).replace('.', ',')} ms
          </div>
        </div>

        <div className="actor-readout-col">
          <div className="actor-readout-title">
            <span>Consumer</span>
            <span className="mono" style={{ fontSize: '11px', color: cState === 'working' ? 'var(--color-accent)' : 'var(--color-ink3)' }}>
              {cState.toUpperCase()}
            </span>
          </div>
          <div className="actor-readout-sub">
            {cItem ? `item ${cItem}` : '—'} · menganggur {cIdle.toFixed(1).replace('.', ',')} ms
          </div>
        </div>
      </div>
    </div>
  );
};

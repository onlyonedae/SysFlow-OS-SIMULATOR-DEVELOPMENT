import React from 'react';
import type { BufferingMethod, BufferingSimulationInput } from '../../core/buffering';

export interface BufferingParamsFormProps {
  input: BufferingSimulationInput;
  onInputChange: (newInput: BufferingSimulationInput) => void;
}

export const BufferingParamsForm: React.FC<BufferingParamsFormProps> = ({
  input,
  onInputChange
}) => {
  const handleMethodChange = (m: BufferingMethod) => {
    onInputChange({ ...input, method: m });
  };

  const handleApplyPreset = (t: number, c: number) => {
    onInputChange({
      ...input,
      produceTime: t,
      consumeTime: c
    });
  };

  return (
    <div className="panel-body">
      {/* Pilihan Metode Buffering */}
      <div className="form-group">
        <label className="form-label" htmlFor="buffering-method-select">
          Strategi Buffering
        </label>
        <select
          id="buffering-method-select"
          className="form-select"
          value={input.method}
          onChange={(e) => handleMethodChange(e.target.value as BufferingMethod)}
        >
          <option value="unbuffered">Tanpa Buffer (Unbuffered)</option>
          <option value="single">Single Buffer (Buffer Tunggal, 1 Slot)</option>
          <option value="double">Double Buffer (Buffer Ganda, 2 Slot)</option>
          <option value="circular">Circular Buffer (Buffer Melingkar, N Slot)</option>
        </select>
      </div>

      {/* Preset Cepat Skenario Rekayasa */}
      <div className="form-group">
        <label className="form-label">Preset Beban Sistem</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleApplyPreset(8, 3)}
            title="Waktu I/O lebih lama daripada komputasi CPU"
          >
            I/O Bound (T=8ms, C=3ms)
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleApplyPreset(3, 8)}
            title="Komputasi CPU lebih lama daripada transfer I/O"
          >
            CPU Bound (T=3ms, C=8ms)
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleApplyPreset(5, 5)}
            title="Waktu I/O dan CPU seimbang"
          >
            Seimbang (T=5ms, C=5ms)
          </button>
        </div>
      </div>

      {/* Parameter Waktu Waktu Per Item */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="produce-time-input">
            Produce (T)
          </label>
          <input
            id="produce-time-input"
            type="number"
            min="1"
            max="50"
            className="form-input"
            value={input.produceTime}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
              onInputChange({ ...input, produceTime: val });
            }}
          />
          <div className="form-help">Waktu transfer I/O ke buffer (ms).</div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="consume-time-input">
            Consume (C)
          </label>
          <input
            id="consume-time-input"
            type="number"
            min="1"
            max="50"
            className="form-input"
            value={input.consumeTime}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
              onInputChange({ ...input, consumeTime: val });
            }}
          />
          <div className="form-help">Waktu komputasi CPU (ms).</div>
        </div>
      </div>

      {/* Jumlah Item Data */}
      <div className="form-group">
        <label className="form-label" htmlFor="item-count-input">
          Jumlah Item Data: <span className="mono">{input.itemCount}</span>
        </label>
        <input
          id="item-count-input"
          type="range"
          min="4"
          max="20"
          step="1"
          style={{ width: '100%', cursor: 'pointer' }}
          value={input.itemCount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            onInputChange({ ...input, itemCount: val });
          }}
        />
        <div className="form-help">Banyaknya blok/item data yang diproses.</div>
      </div>

      {/* Kapasitas Slot (Khusus Circular Buffer) */}
      {input.method === 'circular' && (
        <div className="form-group" style={{ backgroundColor: 'var(--color-bg)', padding: '8px', border: '1px solid var(--color-border)' }}>
          <label className="form-label" htmlFor="buffer-cap-input">
            Ukuran Buffer Melingkar (Slot N)
          </label>
          <input
            id="buffer-cap-input"
            type="number"
            min="3"
            max="12"
            className="form-input"
            value={input.bufferCapacity ?? 4}
            onChange={(e) => {
              const val = Math.max(3, Math.min(12, parseInt(e.target.value, 10) || 4));
              onInputChange({ ...input, bufferCapacity: val });
            }}
          />
          <div className="form-help">Jumlah slot antrean melingkar (FIFO).</div>
        </div>
      )}
    </div>
  );
};

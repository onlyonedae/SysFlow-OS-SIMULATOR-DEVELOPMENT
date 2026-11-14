import React, { useState } from 'react';
import type { BufferingMethod, BufferingSimulationInput } from '../../core/buffering';

export interface BufferingParamsFormProps {
  input: BufferingSimulationInput;
  onInputChange: (newInput: BufferingSimulationInput) => void;
}

export const BufferingParamsForm: React.FC<BufferingParamsFormProps> = ({
  input,
  onInputChange
}) => {
  const [activePreset, setActivePreset] = useState<'balanced' | 'io' | 'cpu'>('balanced');

  const methods: { id: BufferingMethod; name: string; slots: string }[] = [
    { id: 'unbuffered', name: 'Tanpa buffer', slots: '0 slot' },
    { id: 'single', name: 'Single buffer', slots: '1 slot' },
    { id: 'double', name: 'Double buffer', slots: '2 slot' },
    { id: 'circular', name: 'Circular buffer', slots: `${input.bufferCapacity ?? 4} slot` }
  ];

  const handleSelectMethod = (m: BufferingMethod) => {
    onInputChange({ ...input, method: m });
  };

  const handleApplyPreset = (preset: 'balanced' | 'io' | 'cpu') => {
    setActivePreset(preset);
    if (preset === 'balanced') {
      onInputChange({
        ...input,
        produceTime: 4,
        consumeTime: 6,
        itemCount: 8
      });
    } else if (preset === 'io') {
      onInputChange({
        ...input,
        produceTime: 8,
        consumeTime: 3,
        itemCount: 8
      });
    } else {
      onInputChange({
        ...input,
        produceTime: 3,
        consumeTime: 8,
        itemCount: 8
      });
    }
  };

  return (
    <div className="instrument-panel-body">
      {/* ─── Strategi (Radio Card List) ─── */}
      <div className="control-group">
        <label className="instrument-label">Strategi</label>
        <div className="radio-card-list">
          {methods.map((m) => {
            const isSelected = input.method === m.id;
            return (
              <div
                key={m.id}
                className={`radio-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectMethod(m.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectMethod(m.id);
                }}
              >
                <div className="radio-card-left">
                  <div className="radio-card-dot">
                    {isSelected && <div className="radio-card-dot-inner" />}
                  </div>
                  <span className="radio-card-name">{m.name}</span>
                </div>
                <span className="radio-card-badge">{m.slots}</span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="instrument-divider" />

      {/* ─── Beban Sistem (2x2 Grid) ─── */}
      <div className="control-group">
        <label className="instrument-label">Beban sistem</label>
        <div className="field-grid-2x2">
          <div className="field-box-item">
            <span className="field-box-label">T — produksi</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="1"
                max="50"
                className="field-box-input"
                value={input.produceTime}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onInputChange({ ...input, produceTime: val });
                }}
              />
              <span className="field-box-suffix">ms</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">C — konsumsi</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="1"
                max="50"
                className="field-box-input"
                value={input.consumeTime}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onInputChange({ ...input, consumeTime: val });
                }}
              />
              <span className="field-box-suffix">ms</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Jumlah item</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="1"
                max="30"
                className="field-box-input"
                value={input.itemCount}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                  onInputChange({ ...input, itemCount: val });
                }}
              />
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Kapasitas</span>
            <div className="field-box-input-wrapper" style={{ opacity: input.method === 'circular' ? 1 : 0.6 }}>
              <input
                type="number"
                min="2"
                max="16"
                disabled={input.method !== 'circular'}
                className="field-box-input"
                value={input.method === 'circular' ? (input.bufferCapacity ?? 4) : (input.method === 'double' ? 2 : (input.method === 'single' ? 1 : 0))}
                onChange={(e) => {
                  const val = Math.max(2, Math.min(16, parseInt(e.target.value, 10) || 4));
                  onInputChange({ ...input, bufferCapacity: val });
                }}
              />
              <span className="field-box-suffix">slot</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="instrument-divider" />

      {/* ─── Skenario Preset ─── */}
      <div className="control-group">
        <label className="instrument-label">Preset</label>
        <div className="scenario-row">
          <button
            type="button"
            className={`scenario-btn ${activePreset === 'balanced' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('balanced')}
          >
            Seimbang
          </button>
          <button
            type="button"
            className={`scenario-btn ${activePreset === 'io' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('io')}
          >
            I/O lambat
          </button>
          <button
            type="button"
            className={`scenario-btn ${activePreset === 'cpu' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('cpu')}
          >
            CPU lambat
          </button>
        </div>
        <div className="scenario-captions">
          {activePreset === 'balanced' && <div>Seimbang: T &lt; C, buffer ganda menutup jeda CPU.</div>}
          {activePreset === 'io' && <div>I/O lambat: T &gt; C, producer membatasi throughput sistem.</div>}
          {activePreset === 'cpu' && <div>CPU lambat: T &lt; C, consumer membatasi throughput sistem.</div>}
        </div>
      </div>
    </div>
  );
};

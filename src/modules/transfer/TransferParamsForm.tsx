import React, { useState } from 'react';
import type { TransferMethod, TransferSimulationInput } from '../../core/transfer';

export interface TransferParamsFormProps {
  input: TransferSimulationInput;
  onInputChange: (newInput: TransferSimulationInput) => void;
}

export const TransferParamsForm: React.FC<TransferParamsFormProps> = ({
  input,
  onInputChange
}) => {
  const [activePreset, setActivePreset] = useState<'hdd' | 'ssd' | 'usb'>('hdd');

  const methods: { id: TransferMethod; name: string }[] = [
    { id: 'programmed_io', name: 'Programmed I/O' },
    { id: 'interrupt_driven', name: 'Interrupt-driven' },
    { id: 'dma', name: 'DMA' }
  ];

  const totalBlocks = Math.max(1, Math.ceil(input.dataSizeKb / Math.max(1, input.blockSizeKb)));

  const handleSelectMethod = (m: TransferMethod) => {
    onInputChange({ ...input, method: m });
  };

  const handleApplyPreset = (preset: 'hdd' | 'ssd' | 'usb') => {
    setActivePreset(preset);
    if (preset === 'hdd') {
      onInputChange({
        ...input,
        dataSizeKb: 64,
        blockSizeKb: 4,
        deviceSpeedMsPerBlock: 5,
        interruptCostMs: 2,
        dmaSetupTimeMs: 3,
        cpuCopyTimePerBlockMs: 1
      });
    } else if (preset === 'ssd') {
      onInputChange({
        ...input,
        dataSizeKb: 64,
        blockSizeKb: 4,
        deviceSpeedMsPerBlock: 1,
        interruptCostMs: 1,
        dmaSetupTimeMs: 2,
        cpuCopyTimePerBlockMs: 0.5
      });
    } else {
      onInputChange({
        ...input,
        dataSizeKb: 64,
        blockSizeKb: 4,
        deviceSpeedMsPerBlock: 8,
        interruptCostMs: 2,
        dmaSetupTimeMs: 3,
        cpuCopyTimePerBlockMs: 1
      });
    }
  };

  return (
    <div className="instrument-panel-body">
      {/* ─── Pilihan Metode Transfer ─── */}
      <div className="control-group">
        <label className="instrument-label">Metode</label>
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
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-ink3)', marginTop: '4px' }}>
          {input.method === 'programmed_io' && 'CPU melakukan polling sibuk sepanjang durasi baca.'}
          {input.method === 'interrupt_driven' && `${totalBlocks} interrupt, satu per blok transfer.`}
          {input.method === 'dma' && '1 interrupt selesai di akhir seluruh transfer blok.'}
        </div>
      </div>

      <hr className="instrument-divider" />

      {/* ─── Perangkat & Ukuran (2-Column Grid) ─── */}
      <div className="control-group">
        <label className="instrument-label">Perangkat &amp; ukuran</label>
        <div className="field-grid-2x2">
          <div className="field-box-item">
            <span className="field-box-label">Ukuran data</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="4"
                max="1024"
                step="4"
                className="field-box-input"
                value={input.dataSizeKb}
                onChange={(e) => {
                  const val = Math.max(4, parseInt(e.target.value, 10) || 4);
                  onInputChange({ ...input, dataSizeKb: val });
                }}
              />
              <span className="field-box-suffix">KB</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Ukuran blok</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="1"
                max="64"
                step="1"
                className="field-box-input"
                value={input.blockSizeKb}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onInputChange({ ...input, blockSizeKb: val });
                }}
              />
              <span className="field-box-suffix">KB</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Waktu baca/blok</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="1"
                max="50"
                className="field-box-input"
                value={input.deviceSpeedMsPerBlock}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onInputChange({ ...input, deviceSpeedMsPerBlock: val });
                }}
              />
              <span className="field-box-suffix">ms</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Biaya interrupt</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                className="field-box-input"
                value={input.interruptCostMs}
                onChange={(e) => {
                  const val = Math.max(0.5, parseFloat(e.target.value) || 0.5);
                  onInputChange({ ...input, interruptCostMs: val });
                }}
              />
              <span className="field-box-suffix">ms</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Setup DMA</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="1"
                max="20"
                className="field-box-input"
                value={input.dmaSetupTimeMs}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onInputChange({ ...input, dmaSetupTimeMs: val });
                }}
              />
              <span className="field-box-suffix">ms</span>
            </div>
          </div>

          <div className="field-box-item">
            <span className="field-box-label">Copy CPU/blok</span>
            <div className="field-box-input-wrapper">
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                className="field-box-input"
                value={input.cpuCopyTimePerBlockMs ?? 1}
                onChange={(e) => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  onInputChange({ ...input, cpuCopyTimePerBlockMs: val });
                }}
              />
              <span className="field-box-suffix">ms</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="instrument-divider" />

      {/* ─── Preset Cepat ─── */}
      <div className="control-group">
        <label className="instrument-label">Preset</label>
        <div className="scenario-row">
          <button
            type="button"
            className={`scenario-btn ${activePreset === 'hdd' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('hdd')}
          >
            Disk HDD
          </button>
          <button
            type="button"
            className={`scenario-btn ${activePreset === 'ssd' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('ssd')}
          >
            SSD
          </button>
          <button
            type="button"
            className={`scenario-btn ${activePreset === 'usb' ? 'active' : ''}`}
            onClick={() => handleApplyPreset('usb')}
          >
            USB 2.0
          </button>
        </div>
        <div className="scenario-captions">
          {activePreset === 'hdd' && <div>Disk HDD: 5 ms/blok, interrupt 2 ms.</div>}
          {activePreset === 'ssd' && <div>SSD: 1 ms/blok transfer cepat, interrupt 1 ms.</div>}
          {activePreset === 'usb' && <div>USB 2.0: 8 ms/blok transfer lambat, interrupt 2 ms.</div>}
        </div>
      </div>
    </div>
  );
};

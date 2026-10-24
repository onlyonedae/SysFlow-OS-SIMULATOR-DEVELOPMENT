import React from 'react';
import type { TransferMethod, TransferSimulationInput } from '../../core/transfer';

export interface TransferParamsFormProps {
  input: TransferSimulationInput;
  onInputChange: (newInput: TransferSimulationInput) => void;
}

export const TransferParamsForm: React.FC<TransferParamsFormProps> = ({
  input,
  onInputChange
}) => {
  const handleMethodChange = (m: TransferMethod) => {
    onInputChange({ ...input, method: m });
  };

  const handleApplyPreset = (dataSize: number, blockSize: number, devSpeed: number, intCost: number, dmaSetup: number) => {
    onInputChange({
      ...input,
      dataSizeKb: dataSize,
      blockSizeKb: blockSize,
      deviceSpeedMsPerBlock: devSpeed,
      interruptCostMs: intCost,
      dmaSetupTimeMs: dmaSetup
    });
  };

  const totalBlocks = Math.max(1, Math.ceil(input.dataSizeKb / input.blockSizeKb));

  return (
    <div className="panel-body">
      {/* Pilihan Metode Transfer */}
      <div className="form-group">
        <label className="form-label" htmlFor="transfer-method-select">
          Metode Transfer Data
        </label>
        <select
          id="transfer-method-select"
          className="form-select"
          value={input.method}
          onChange={(e) => handleMethodChange(e.target.value as TransferMethod)}
        >
          <option value="programmed_io">Programmed I/O (Polling / Busy-Wait)</option>
          <option value="interrupt_driven">Interrupt-Driven I/O</option>
          <option value="dma">Direct Memory Access (DMA)</option>
        </select>
      </div>

      {/* Preset Cepat */}
      <div className="form-group">
        <label className="form-label">Preset Ukuran & Perangkat</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleApplyPreset(64, 4, 5, 2, 3)}
            title="Data sedang 64 KB, 16 blok"
          >
            Standar: 64 KB (16 Blok @ 4KB)
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleApplyPreset(128, 8, 6, 2, 4)}
            title="Data besar 128 KB, 16 blok"
          >
            File Besar: 128 KB (16 Blok @ 8KB)
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleApplyPreset(32, 2, 10, 2, 3)}
            title="Perangkat lambat dengan banyak blok"
          >
            Perangkat Lambat: 32 KB (16 Blok @ 2KB, Tdev=10ms)
          </button>
        </div>
      </div>

      {/* Ukuran Data dan Blok */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="data-size-input">
            Ukuran Data (KB)
          </label>
          <input
            id="data-size-input"
            type="number"
            min="4"
            max="1024"
            step="4"
            className="form-input"
            value={input.dataSizeKb}
            onChange={(e) => {
              const val = Math.max(4, parseInt(e.target.value, 10) || 4);
              onInputChange({ ...input, dataSizeKb: val });
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="block-size-input">
            Ukuran Blok (KB)
          </label>
          <input
            id="block-size-input"
            type="number"
            min="1"
            max="64"
            className="form-input"
            value={input.blockSizeKb}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
              onInputChange({ ...input, blockSizeKb: val });
            }}
          />
        </div>
      </div>
      <div className="form-help">
        Total blok yang akan ditransfer: <strong className="mono">{totalBlocks} blok</strong>.
      </div>

      {/* Kecepatan Perangkat & Biaya Overhead */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="dev-speed-input">
            Waktu I/O (Tdev)
          </label>
          <input
            id="dev-speed-input"
            type="number"
            min="1"
            max="50"
            className="form-input"
            value={input.deviceSpeedMsPerBlock}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
              onInputChange({ ...input, deviceSpeedMsPerBlock: val });
            }}
          />
          <div className="form-help">Durasi baca perangkat per blok (ms).</div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="int-cost-input">
            Biaya Interrupt
          </label>
          <input
            id="int-cost-input"
            type="number"
            min="1"
            max="20"
            className="form-input"
            value={input.interruptCostMs}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value, 10) || 1);
              onInputChange({ ...input, interruptCostMs: val });
            }}
          />
          <div className="form-help">Waktu ISR per sinyal interrupt (ms).</div>
        </div>
      </div>

      {/* Waktu Setup DMA */}
      <div className="form-group" style={{ backgroundColor: 'var(--color-bg)', padding: '8px', border: '1px solid var(--color-border)' }}>
        <label className="form-label" htmlFor="dma-setup-input">
          Waktu Setup DMA (Tsetup)
        </label>
        <input
          id="dma-setup-input"
          type="number"
          min="1"
          max="20"
          className="form-input"
          value={input.dmaSetupTimeMs}
          onChange={(e) => {
            const val = Math.max(1, parseInt(e.target.value, 10) || 1);
            onInputChange({ ...input, dmaSetupTimeMs: val });
          }}
        />
        <div className="form-help">Waktu CPU menginisialisasi controller DMA (hanya 1x di awal).</div>
      </div>
    </div>
  );
};

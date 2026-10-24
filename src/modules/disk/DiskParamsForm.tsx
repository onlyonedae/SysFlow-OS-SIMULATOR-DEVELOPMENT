import React, { useState, useEffect } from 'react';
import type { DiskAlgorithm, DiskSimulationInput, Direction } from '../../core/disk';

export interface DiskParamsFormProps {
  algorithm: DiskAlgorithm;
  onAlgorithmChange: (algo: DiskAlgorithm) => void;
  input: DiskSimulationInput;
  onInputChange: (newInput: DiskSimulationInput) => void;
}

const ALGORITHMS: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];

export const DiskParamsForm: React.FC<DiskParamsFormProps> = ({
  algorithm,
  onAlgorithmChange,
  input,
  onInputChange
}) => {
  const [initialHeadText, setInitialHeadText] = useState(String(input.initialHead));
  const [maxTrackText, setMaxTrackText] = useState(String(input.maxTrack));
  const [direction, setDirection] = useState<Direction>(input.direction);
  const [countJumpReturn, setCountJumpReturn] = useState<boolean>(input.countJumpReturn);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perbarui saat input eksternal berubah
  useEffect(() => {
    setInitialHeadText(String(input.initialHead));
    setMaxTrackText(String(input.maxTrack));
    setDirection(input.direction);
    setCountJumpReturn(input.countJumpReturn);
  }, [input]);

  // Hapus sebuah request dari antrean
  const handleRemoveRequest = (idx: number) => {
    const updated = input.requests.filter((_, i) => i !== idx);
    if (updated.length === 0) {
      setErrorMessage('Antrean request tidak boleh kosong.');
      return;
    }
    setErrorMessage(null);
    onInputChange({ ...input, requests: updated });
  };

  // Validasi dan commit perubahan head/track
  const commitHeadAndRange = (headStr: string, maxStr: string, dir: Direction, jump: boolean) => {
    const headVal = parseInt(headStr, 10);
    const minVal = input.minTrack;
    const maxVal = parseInt(maxStr, 10);

    if (isNaN(headVal) || isNaN(maxVal)) {
      setErrorMessage('Nilai head dan maks track harus angka valid.');
      return;
    }
    if (minVal >= maxVal) {
      setErrorMessage(`Track maks (${maxVal}) harus lebih besar dari ${minVal}.`);
      return;
    }
    if (headVal < minVal || headVal > maxVal) {
      setErrorMessage(`Head awal ${headVal} di luar rentang ${minVal}–${maxVal}.`);
      return;
    }
    // Clamp request yang di luar rentang baru
    const clampedRequests = input.requests.map((r) => Math.max(minVal, Math.min(maxVal, r)));
    setErrorMessage(null);
    onInputChange({
      ...input,
      initialHead: headVal,
      maxTrack: maxVal,
      direction: dir,
      countJumpReturn: jump,
      requests: clampedRequests
    });
  };

  const handleGenerateRandom = () => {
    const minVal = input.minTrack;
    const maxVal = parseInt(maxTrackText, 10) || 199;
    const count = 8;
    const randRequests: number[] = [];
    for (let i = 0; i < count; i++) {
      randRequests.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
    }
    const randHead = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    setInitialHeadText(String(randHead));
    setErrorMessage(null);
    onInputChange({
      ...input,
      requests: randRequests,
      initialHead: randHead,
      maxTrack: maxVal
    });
  };

  const handleApplyTextbookExample = () => {
    setInitialHeadText('53');
    setMaxTrackText('199');
    setDirection('left');
    setCountJumpReturn(true);
    setErrorMessage(null);
    onInputChange({
      requests: [98, 183, 37, 122, 14, 124, 65, 67],
      initialHead: 53,
      minTrack: 0,
      maxTrack: 199,
      direction: 'left',
      countJumpReturn: true,
      seekTimePerCylinder: input.seekTimePerCylinder ?? 0.1
    });
  };

  return (
    <div className="panel-body">

      {/* ── Antrean Request (Chips) ── */}
      <div className="form-group">
        <label className="form-label">
          <span>Antrean · {input.requests.length} request</span>
          <span className="form-label-hint">0–{input.maxTrack}</span>
        </label>
        <div className="request-chips">
          {input.requests.map((req, idx) => (
            <span key={`chip-${idx}-${req}`} className="request-chip">
              {req}
              <span
                className="chip-del"
                role="button"
                tabIndex={0}
                aria-label={`Hapus request ${req}`}
                onClick={() => handleRemoveRequest(idx)}
                onKeyDown={(e) => e.key === 'Enter' && handleRemoveRequest(idx)}
              >
                ×
              </span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleApplyTextbookExample}
            title="Muat contoh standar dari buku teks Silberschatz"
          >
            Contoh Buku
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={handleGenerateRandom}
            title="Buat antrean acak"
          >
            Acak
          </button>
        </div>
      </div>

      {/* ── Head Awal & Rentang Track ── */}
      <div className="form-input-row">
        <div className="form-group">
          <label className="form-label" htmlFor="disk-head-input">Head awal</label>
          <input
            id="disk-head-input"
            type="number"
            className="form-input"
            value={initialHeadText}
            onChange={(e) => {
              setInitialHeadText(e.target.value);
              commitHeadAndRange(e.target.value, maxTrackText, direction, countJumpReturn);
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="disk-range-select">Rentang track</label>
          <select
            id="disk-range-select"
            className="form-select"
            value={`0-${maxTrackText}`}
            onChange={(e) => {
              const val = e.target.value.split('-')[1];
              setMaxTrackText(val);
              commitHeadAndRange(initialHeadText, val, direction, countJumpReturn);
            }}
          >
            <option value="0-199">0–199</option>
            <option value="0-299">0–299</option>
            <option value="0-499">0–499</option>
            <option value="0-999">0–999</option>
          </select>
        </div>
      </div>

      {/* ── Arah Awal (SCAN/LOOK) ── */}
      <div className="form-group">
        <label className="form-label">Arah awal · keluarga SCAN / LOOK</label>
        <div className="direction-buttons">
          <button
            type="button"
            className={`dir-btn ${direction === 'left' ? 'active' : ''}`}
            onClick={() => {
              setDirection('left');
              commitHeadAndRange(initialHeadText, maxTrackText, 'left', countJumpReturn);
            }}
          >
            ← Menuju 0
          </button>
          <button
            type="button"
            className={`dir-btn ${direction === 'right' ? 'active' : ''}`}
            onClick={() => {
              setDirection('right');
              commitHeadAndRange(initialHeadText, maxTrackText, 'right', countJumpReturn);
            }}
          >
            Menuju akhir →
          </button>
        </div>
      </div>

      {/* ── Opsi C-SCAN / C-LOOK ── */}
      <div className="form-group">
        <label
          className="checkbox-group"
          style={{ cursor: 'pointer' }}
        >
          <input
            type="checkbox"
            checked={countJumpReturn}
            onChange={(e) => {
              setCountJumpReturn(e.target.checked);
              commitHeadAndRange(initialHeadText, maxTrackText, direction, e.target.checked);
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
            Hitung lompatan C-SCAN / C-LOOK
          </span>
        </label>
        <div className="form-help" style={{ paddingLeft: '21px' }}>
          Jarak kembali disertakan pada hasil.
        </div>
      </div>

      {/* ── Pilihan Metode ── */}
      <div className="form-group">
        <label className="form-label">Metode penjadwalan</label>
        <div className="algo-buttons">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              type="button"
              id={`algo-btn-${algo}`}
              className={`algo-btn ${algorithm === algo ? 'active' : ''}`}
              onClick={() => onAlgorithmChange(algo)}
            >
              {algo}
            </button>
          ))}
        </div>
        <div className="form-help" style={{ marginTop: '4px' }}>
          {algorithm === 'FCFS' && 'FCFS melayani request sesuai urutan datang.'}
          {algorithm === 'SSTF' && 'SSTF memilih request terdekat; arah awal tidak digunakan.'}
          {algorithm === 'SCAN' && 'SCAN bergerak ke satu arah hingga batas, lalu berbalik.'}
          {algorithm === 'C-SCAN' && 'C-SCAN hanya melayani satu arah, lompat ke awal setelah mencapai batas.'}
          {algorithm === 'LOOK' && 'LOOK seperti SCAN tapi berbalik di request terjauh, bukan di batas.'}
          {algorithm === 'C-LOOK' && 'C-LOOK seperti C-SCAN tapi lompat ke request pertama, bukan ke track 0.'}
        </div>
      </div>

      {/* ── Error ── */}
      {errorMessage && (
        <div className="form-error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

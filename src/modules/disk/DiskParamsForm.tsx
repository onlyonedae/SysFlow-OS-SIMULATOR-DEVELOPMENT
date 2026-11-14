import React, { useState, useEffect } from 'react';
import type { DiskAlgorithm, DiskSimulationInput, Direction } from '../../core/disk';
import { DEFAULT_SEEK_TIME_PER_CYLINDER } from '../../core/disk';

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
  const [newTrackText, setNewTrackText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<'buku' | 'kluster' | 'acak'>('buku');

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

  const handleAddTrack = () => {
    const val = parseInt(newTrackText.trim(), 10);
    if (isNaN(val)) {
      setErrorMessage('Nomor track harus angka.');
      return;
    }
    const maxVal = parseInt(maxTrackText, 10) || 199;
    if (val < input.minTrack || val > maxVal) {
      setErrorMessage(`Track harus berada dalam rentang ${input.minTrack}–${maxVal}.`);
      return;
    }
    setErrorMessage(null);
    onInputChange({ ...input, requests: [...input.requests, val] });
    setNewTrackText('');
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
    setActiveScenario('acak');
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
    setActiveScenario('buku');
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
      seekTimePerCylinder: input.seekTimePerCylinder ?? DEFAULT_SEEK_TIME_PER_CYLINDER
    });
  };

  const handleApplyStarvationExample = () => {
    setActiveScenario('kluster');
    setInitialHeadText('50');
    setMaxTrackText('199');
    setDirection('right');
    setCountJumpReturn(true);
    setErrorMessage(null);
    onInputChange({
      requests: [50, 52, 48, 55, 51, 180, 195],
      initialHead: 50,
      minTrack: 0,
      maxTrack: 199,
      direction: 'right',
      countJumpReturn: true,
      seekTimePerCylinder: input.seekTimePerCylinder ?? DEFAULT_SEEK_TIME_PER_CYLINDER
    });
  };

  const getAlgoExplanation = (algo: DiskAlgorithm) => {
    switch (algo) {
      case 'FCFS': return 'Melayani request sesuai urutan kedatangan antrean.';
      case 'SSTF': return 'Memilih request terdekat dari posisi head.';
      case 'SCAN': return 'Menyapu silinder ke satu arah hingga ujung, lalu berbalik.';
      case 'C-SCAN': return 'Menyapu ke satu arah saja, lompat kembali ke ujung awal tanpa melayani.';
      case 'LOOK': return 'Menyapu ke arah target hingga request terakhir, berbalik tanpa ke track 0/199.';
      case 'C-LOOK': return 'Menyapu satu arah hingga request terakhir, lalu lompat ke request terendah.';
      default: return '';
    }
  };

  return (
    <div className="instrument-panel-body">

      {/* ── 1. Metode (Grid 3x2) ── */}
      <div className="control-group">
        <label className="control-label">Metode</label>
        <div className="method-grid">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo}
              type="button"
              className={`choice-btn ${algorithm === algo ? 'active' : ''}`}
              onClick={() => onAlgorithmChange(algo)}
            >
              {algo}
            </button>
          ))}
        </div>
        <div className="control-caption">
          {getAlgoExplanation(algorithm)}
        </div>
      </div>

      <div className="rule-divider" />

      {/* ── 2. Skenario ── */}
      <div className="control-group">
        <label className="control-label">Skenario</label>
        <div className="scenario-row">
          <button
            type="button"
            className={`choice-btn ${activeScenario === 'buku' ? 'active' : ''}`}
            onClick={handleApplyTextbookExample}
          >
            Buku teks
          </button>
          <button
            type="button"
            className={`choice-btn ${activeScenario === 'kluster' ? 'active' : ''}`}
            onClick={handleApplyStarvationExample}
          >
            Kluster jauh
          </button>
          <button
            type="button"
            className={`choice-btn ${activeScenario === 'acak' ? 'active' : ''}`}
            onClick={handleGenerateRandom}
          >
            Acak
          </button>
        </div>
        <div className="control-caption">
          {activeScenario === 'buku' && (
            <>
              Buku teks: head 53, 8 request (Silberschatz).<br />
              Amati: total gerak LOOK 208 vs FCFS 640.
            </>
          )}
          {activeScenario === 'kluster' && (
            <>
              Kluster dekat 50–55 vs jauh 180–195.<br />
              Amati fenomena starvation pada SSTF.
            </>
          )}
          {activeScenario === 'acak' && (
            <>
              Antrean acak 8 silinder acak.<br />
              Evaluasi kinerja komparatif.
            </>
          )}
        </div>
      </div>

      <div className="rule-divider" />

      {/* ── 3. Antrean ── */}
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="control-label" style={{ margin: 0 }}>Antrean</label>
          <span className="mono" style={{ fontSize: '12px', color: 'var(--color-ink3)' }}>0–{input.maxTrack}</span>
        </div>
        <div className="chips-grid">
          {input.requests.map((req, idx) => (
            <span key={`chip-${idx}-${req}`} className="instrument-chip">
              {req}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Hapus request ${req}`}
                onClick={() => handleRemoveRequest(idx)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="add-track-row">
          <input
            type="number"
            className="track-input"
            placeholder="Tambah track…"
            value={newTrackText}
            onChange={(e) => setNewTrackText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTrack();
              }
            }}
          />
          <button
            type="button"
            className="action-btn"
            onClick={handleAddTrack}
          >
            Tambah
          </button>
        </div>
      </div>

      <div className="rule-divider" />

      {/* ── 4. Head awal & Rentang track ── */}
      <div className="two-cols-row">
        <div className="control-group">
          <label className="control-label" htmlFor="disk-head-input">Head awal</label>
          <input
            id="disk-head-input"
            type="number"
            className="field-input"
            value={initialHeadText}
            onChange={(e) => {
              setInitialHeadText(e.target.value);
              commitHeadAndRange(e.target.value, maxTrackText, direction, countJumpReturn);
            }}
          />
        </div>
        <div className="control-group">
          <label className="control-label" htmlFor="disk-range-select">Rentang track</label>
          <select
            id="disk-range-select"
            className="field-select"
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

      {/* ── 5. Arah awal ── */}
      <div className="control-group">
        <label className="control-label">Arah awal</label>
        <div className="two-cols-row">
          <button
            type="button"
            className={`choice-btn ${direction === 'left' ? 'active' : ''}`}
            onClick={() => {
              setDirection('left');
              commitHeadAndRange(initialHeadText, maxTrackText, 'left', countJumpReturn);
            }}
          >
            ← Menuju 0
          </button>
          <button
            type="button"
            className={`choice-btn ${direction === 'right' ? 'active' : ''}`}
            onClick={() => {
              setDirection('right');
              commitHeadAndRange(initialHeadText, maxTrackText, 'right', countJumpReturn);
            }}
          >
            Menuju akhir →
          </button>
        </div>
      </div>

      {/* ── 6. Checkbox Opsi C-SCAN ── */}
      <div className="control-group" style={{ marginTop: '4px' }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={countJumpReturn}
            onChange={(e) => {
              setCountJumpReturn(e.target.checked);
              commitHeadAndRange(initialHeadText, maxTrackText, direction, e.target.checked);
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--color-ink2)', lineHeight: '1.4' }}>
            Hitung lompatan balik C-SCAN / C-LOOK
          </span>
        </label>
        <div className="control-caption" style={{ paddingLeft: '22px' }}>
          Dihitung sebagai jarak penuh 0 → 199.
        </div>
      </div>

      {/* ── Error ── */}
      {errorMessage && (
        <div className="instrument-error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

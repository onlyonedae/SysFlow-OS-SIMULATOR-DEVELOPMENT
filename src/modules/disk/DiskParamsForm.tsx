import React, { useState, useEffect } from 'react';
import type { DiskAlgorithm, DiskSimulationInput, Direction } from '../../core/disk';

export interface DiskParamsFormProps {
  algorithm: DiskAlgorithm;
  onAlgorithmChange: (algo: DiskAlgorithm) => void;
  input: DiskSimulationInput;
  onInputChange: (newInput: DiskSimulationInput) => void;
}

export const DiskParamsForm: React.FC<DiskParamsFormProps> = ({
  algorithm,
  onAlgorithmChange,
  input,
  onInputChange
}) => {
  const [requestText, setRequestText] = useState(input.requests.join(', '));
  const [initialHeadText, setInitialHeadText] = useState(String(input.initialHead));
  const [minTrackText, setMinTrackText] = useState(String(input.minTrack));
  const [maxTrackText, setMaxTrackText] = useState(String(input.maxTrack));
  const [direction, setDirection] = useState<Direction>(input.direction);
  const [countJumpReturn, setCountJumpReturn] = useState<boolean>(input.countJumpReturn);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perbarui saat input eksternal berubah
  useEffect(() => {
    setRequestText(input.requests.join(', '));
    setInitialHeadText(String(input.initialHead));
    setMinTrackText(String(input.minTrack));
    setMaxTrackText(String(input.maxTrack));
    setDirection(input.direction);
    setCountJumpReturn(input.countJumpReturn);
  }, [input]);

  // Validasi dan komit ke state induk
  const validateAndCommit = (
    reqStr: string,
    headStr: string,
    minStr: string,
    maxStr: string,
    dir: Direction,
    jump: boolean
  ) => {
    const minVal = parseInt(minStr, 10);
    const maxVal = parseInt(maxStr, 10);
    const headVal = parseInt(headStr, 10);

    if (isNaN(minVal) || isNaN(maxVal)) {
      setErrorMessage('Batas nomor track harus berupa angka valid.');
      return;
    }
    if (minVal < 0) {
      setErrorMessage('Nomor track minimum tidak boleh bernilai negatif.');
      return;
    }
    if (minVal >= maxVal) {
      setErrorMessage(`Track maksimum (${maxVal}) harus lebih besar dari track minimum (${minVal}).`);
      return;
    }

    if (isNaN(headVal)) {
      setErrorMessage('Posisi awal head harus berupa angka.');
      return;
    }
    if (headVal < minVal || headVal > maxVal) {
      setErrorMessage(`Posisi head awal ${headVal} di luar rentang ${minVal}-${maxVal}. Sesuaikan posisi atau rentang track.`);
      return;
    }

    // Parsing antrean request
    const parts = reqStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parts.length === 0) {
      setErrorMessage('Antrean request tidak boleh kosong. Masukkan minimal satu nomor track.');
      return;
    }

    const parsedRequests: number[] = [];
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        setErrorMessage(`Nilai "${part}" bukan angka track yang valid.`);
        return;
      }
      if (num < minVal || num > maxVal) {
        setErrorMessage(`Track ${num} di luar rentang ${minVal}-${maxVal}. Ubah nilainya atau perbesar rentang track.`);
        return;
      }
      parsedRequests.push(num);
    }

    // Lolos validasi
    setErrorMessage(null);
    onInputChange({
      requests: parsedRequests,
      initialHead: headVal,
      minTrack: minVal,
      maxTrack: maxVal,
      direction: dir,
      countJumpReturn: jump,
      seekTimePerCylinder: input.seekTimePerCylinder ?? 0.5
    });
  };

  const handleApplyTextbookExample = () => {
    const reqStr = '98, 183, 37, 122, 14, 124, 65, 67';
    const headStr = '53';
    const minStr = '0';
    const maxStr = '199';
    const dir: Direction = 'left';
    const jump = true;

    setRequestText(reqStr);
    setInitialHeadText(headStr);
    setMinTrackText(minStr);
    setMaxTrackText(maxStr);
    setDirection(dir);
    setCountJumpReturn(jump);
    validateAndCommit(reqStr, headStr, minStr, maxStr, dir, jump);
  };

  const handleGenerateRandom = () => {
    const minVal = parseInt(minTrackText, 10) || 0;
    const maxVal = parseInt(maxTrackText, 10) || 199;
    const count = 8;
    const randRequests: number[] = [];

    for (let i = 0; i < count; i++) {
      randRequests.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
    }

    const randHead = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    const reqStr = randRequests.join(', ');
    const headStr = String(randHead);

    setRequestText(reqStr);
    setInitialHeadText(headStr);
    validateAndCommit(reqStr, headStr, minTrackText, maxTrackText, direction, countJumpReturn);
  };

  return (
    <div className="panel-body">
      {/* Pilihan Metode */}
      <div className="form-group">
        <label className="form-label" htmlFor="disk-algo-select">
          Metode Penjadwalan
        </label>
        <select
          id="disk-algo-select"
          className="form-select"
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as DiskAlgorithm)}
        >
          <option value="FCFS">FCFS (First-Come, First-Served)</option>
          <option value="SSTF">SSTF (Shortest Seek Time First)</option>
          <option value="SCAN">SCAN (Elevator)</option>
          <option value="C-SCAN">C-SCAN (Circular SCAN)</option>
          <option value="LOOK">LOOK</option>
          <option value="C-LOOK">C-LOOK (Circular LOOK)</option>
        </select>
      </div>

      {/* Antrean Request */}
      <div className="form-group">
        <label className="form-label" htmlFor="disk-requests-input">
          Antrean Request Track
        </label>
        <textarea
          id="disk-requests-input"
          className="form-textarea"
          rows={3}
          value={requestText}
          onChange={(e) => {
            setRequestText(e.target.value);
            validateAndCommit(e.target.value, initialHeadText, minTrackText, maxTrackText, direction, countJumpReturn);
          }}
          placeholder="Contoh: 98, 183, 37, 122, 14, 124, 65, 67"
        />
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
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
            title="Bangun antrean acak"
          >
            Acak Antrean
          </button>
        </div>
      </div>

      {/* Posisi Awal Head & Rentang Track */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="disk-head-input">
            Posisi Head Awal
          </label>
          <input
            id="disk-head-input"
            type="number"
            className="form-input"
            value={initialHeadText}
            onChange={(e) => {
              setInitialHeadText(e.target.value);
              validateAndCommit(requestText, e.target.value, minTrackText, maxTrackText, direction, countJumpReturn);
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="disk-max-track-input">
            Maks Track
          </label>
          <input
            id="disk-max-track-input"
            type="number"
            className="form-input"
            value={maxTrackText}
            onChange={(e) => {
              setMaxTrackText(e.target.value);
              validateAndCommit(requestText, initialHeadText, minTrackText, e.target.value, direction, countJumpReturn);
            }}
          />
        </div>
      </div>

      {/* Arah Awal Head */}
      <div className="form-group">
        <label className="form-label">Arah Awal Gerakan Head</label>
        <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="radio"
              name="disk-direction"
              value="left"
              checked={direction === 'left'}
              onChange={() => {
                setDirection('left');
                validateAndCommit(requestText, initialHeadText, minTrackText, maxTrackText, 'left', countJumpReturn);
              }}
            />
            Menuju 0 (Kiri)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="radio"
              name="disk-direction"
              value="right"
              checked={direction === 'right'}
              onChange={() => {
                setDirection('right');
                validateAndCommit(requestText, initialHeadText, minTrackText, maxTrackText, 'right', countJumpReturn);
              }}
            />
            Menuju Akhir (Kanan)
          </label>
        </div>
        <div className="form-help">Penting untuk SCAN, C-SCAN, LOOK, C-LOOK.</div>
      </div>

      {/* Opsi Khusus C-SCAN / C-LOOK */}
      {(algorithm === 'C-SCAN' || algorithm === 'C-LOOK') && (
        <div className="form-group" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 8px', border: '1px solid var(--color-border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={countJumpReturn}
              onChange={(e) => {
                setCountJumpReturn(e.target.checked);
                validateAndCommit(requestText, initialHeadText, minTrackText, maxTrackText, direction, e.target.checked);
              }}
            />
            Hitung jarak lompat kembali ke awal
          </label>
          <div className="form-help">
            Jika dimatikan, pergerakan kembali tanpa layani dihitung sebagai zero-cost jump.
          </div>
        </div>
      )}

      {/* Pesan Error Validasi */}
      {errorMessage && (
        <div className="form-error" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

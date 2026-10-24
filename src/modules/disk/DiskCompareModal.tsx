import { runDiskSimulation } from '../../core/disk';
import type {
  DiskAlgorithm,
  DiskSimulationInput,
  DiskSimulationResult
} from '../../core/disk';
import { downloadCsv } from '../../utils/exportCsv';

export interface DiskCompareModalProps {
  input: DiskSimulationInput;
  onClose: () => void;
}

export const DiskCompareModal: React.FC<DiskCompareModalProps> = ({ input, onClose }) => {
  const algorithms: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];
  const results: DiskSimulationResult[] = algorithms.map((algo) => runDiskSimulation(algo, input));

  // Hitung nilai terbaik per baris
  const minHeadMovement = Math.min(...results.map((r) => r.metrics.totalHeadMovement));
  const minSeekTime = Math.min(...results.map((r) => r.metrics.estimatedSeekTime));
  const minAvgWait = Math.min(...results.map((r) => r.metrics.avgWaitingTime));
  const minMaxWait = Math.min(...results.map((r) => r.metrics.maxWaitingTime));
  const maxThroughput = Math.max(...results.map((r) => r.metrics.throughput));

  // Handler ekspor CSV
  const handleExport = () => {
    const headers = [
      'Metode',
      'Total Head Movement (silinder)',
      'Estimasi Seek Time (ms)',
      'Rata-rata Waktu Tunggu (silinder)',
      'Maksimum Waktu Tunggu (silinder)',
      'Throughput (req/ms)'
    ];

    const rows = results.map((r) => [
      r.algorithmName,
      r.metrics.totalHeadMovement,
      r.metrics.estimatedSeekTime.toFixed(1),
      r.metrics.avgWaitingTime.toFixed(2),
      r.metrics.maxWaitingTime,
      r.metrics.throughput.toFixed(4)
    ]);

    downloadCsv(`perbandingan-disk-${Date.now()}.csv`, headers, rows);
  };

  // Dimensi Bar Chart SVG
  const chartWidth = 560;
  const chartHeight = 200;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(...results.map((r) => r.metrics.totalHeadMovement), 1);
  const barWidth = Math.floor(innerW / results.length) - 14;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none'
      }}>
        {/* Header Modal */}
        <div className="panel-header" style={{ padding: '10px 16px' }}>
          <span>Perbandingan Kinerja Penjadwalan Disk</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            aria-label="Tutup jendela perbandingan"
          >
            Tutup [Esc]
          </button>
        </div>

        {/* Isi Modal */}
        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Input antrean: <span className="mono" style={{ color: 'var(--color-text)' }}>{input.requests.join(', ')}</span> | Head awal: <span className="mono">{input.initialHead}</span> | Arah: <span className="mono">{input.direction === 'left' ? 'menuju 0' : 'menuju akhir'}</span>
          </div>

          {/* Tabel Perbandingan Berdampingan */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Metrik Kinerja</th>
                  {results.map((r) => (
                    <th key={r.algorithmName} style={{ textAlign: 'right' }}>
                      {r.algorithmName.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Head Movement (silinder)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.totalHeadMovement === minHeadMovement;
                    return (
                      <td key={r.algorithmName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.totalHeadMovement} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Estimasi Seek Time (ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.estimatedSeekTime === minSeekTime;
                    return (
                      <td key={r.algorithmName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.estimatedSeekTime.toFixed(1)} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Rata-rata Waktu Tunggu (silinder)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.avgWaitingTime === minAvgWait;
                    return (
                      <td key={r.algorithmName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.avgWaitingTime.toFixed(2)} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Maksimum Waktu Tunggu (silinder)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.maxWaitingTime === minMaxWait;
                    return (
                      <td key={r.algorithmName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.maxWaitingTime} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Throughput (req/ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.throughput === maxThroughput;
                    return (
                      <td key={r.algorithmName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.throughput.toFixed(4)} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grafik Batang Total Head Movement */}
          <div style={{ border: '1px solid var(--color-border)', padding: '12px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Grafik Batang Perbandingan: Total Head Movement (Silinder) — Makin Pendek Makin Efisien
            </div>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              role="img"
              aria-label="Grafik batang perbandingan total pergerakan head antar metode disk"
            >
              {/* Garis Dasar Sumbu */}
              <line
                x1={padLeft}
                y1={padTop + innerH}
                x2={padLeft + innerW}
                y2={padTop + innerH}
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />
              <line
                x1={padLeft}
                y1={padTop}
                x2={padLeft}
                y2={padTop + innerH}
                stroke="var(--color-border)"
                strokeWidth="1.5"
              />

              {/* Ticks & Garis Grid Sumbu Y */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const yVal = Math.round(maxVal * (1 - ratio));
                const yPos = padTop + ratio * innerH;
                return (
                  <g key={`chart-y-${ratio}`}>
                    <line
                      x1={padLeft}
                      y1={yPos}
                      x2={padLeft + innerW}
                      y2={yPos}
                      stroke="var(--color-border-subtle)"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padLeft - 8}
                      y={yPos + 3}
                      textAnchor="end"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fill="var(--color-text-dim)"
                    >
                      {yVal}
                    </text>
                  </g>
                );
              })}

              <text
                x={12}
                y={padTop + innerH / 2}
                textAnchor="middle"
                transform={`rotate(-90 12 ${padTop + innerH / 2})`}
                fontSize="10"
                fontFamily="var(--font-sans)"
                fill="var(--color-text-muted)"
              >
                Silinder (track)
              </text>

              {/* Batang per Metode */}
              {results.map((r, i) => {
                const bH = (r.metrics.totalHeadMovement / maxVal) * innerH;
                const bX = padLeft + i * (innerW / results.length) + 6;
                const bY = padTop + innerH - bH;
                const isBest = r.metrics.totalHeadMovement === minHeadMovement;

                return (
                  <g key={`bar-${r.algorithmName}`}>
                    <rect
                      x={bX}
                      y={bY}
                      width={barWidth}
                      height={bH}
                      fill={isBest ? 'var(--color-served)' : 'var(--color-active)'}
                      opacity={isBest ? 1 : 0.85}
                    />
                    <text
                      x={bX + barWidth / 2}
                      y={bY - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                      fill={isBest ? 'var(--color-served)' : 'var(--color-text)'}
                    >
                      {r.metrics.totalHeadMovement}
                    </text>
                    <text
                      x={bX + barWidth / 2}
                      y={padTop + innerH + 15}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="var(--font-sans)"
                      fill="var(--color-text)"
                    >
                      {r.algorithmName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              <text
                x={padLeft + innerW / 2}
                y={chartHeight - 4}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-sans)"
                fill="var(--color-text-muted)"
              >
                Algoritma Penjadwalan Disk
              </text>
            </svg>
          </div>
        </div>

        {/* Footer Modal */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--color-served)' }}>
            ✓ Kolom hijau menandakan nilai terbaik per kriteria metrik.
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleExport}>
              Ekspor Hasil ke CSV
            </button>
            <button type="button" className="btn btn-sm" onClick={onClose}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

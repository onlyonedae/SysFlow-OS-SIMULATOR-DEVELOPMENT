import { simulateBuffering } from '../../core/buffering';
import type {
  BufferingMethod,
  BufferingSimulationInput,
  BufferingSimulationResult
} from '../../core/buffering';
import { downloadCsv } from '../../utils/exportCsv';

export interface BufferingCompareModalProps {
  input: BufferingSimulationInput;
  onClose: () => void;
}

export const BufferingCompareModal: React.FC<BufferingCompareModalProps> = ({ input, onClose }) => {
  const methods: BufferingMethod[] = ['unbuffered', 'single', 'double', 'circular'];
  const results: BufferingSimulationResult[] = methods.map((m) =>
    simulateBuffering({ ...input, method: m })
  );

  const minTotalTime = Math.min(...results.map((r) => r.metrics.totalCompletionTime));
  const maxThroughput = Math.max(...results.map((r) => r.metrics.throughput));
  const minPIdle = Math.min(...results.map((r) => r.metrics.producerIdleTime));
  const minCIdle = Math.min(...results.map((r) => r.metrics.consumerIdleTime));
  const maxSpeedup = Math.max(...results.map((r) => r.metrics.speedupFactor));

  const handleExport = () => {
    const headers = [
      'Strategi Buffering',
      'Total Waktu Selesai (ms)',
      'Throughput (item/ms)',
      'Speedup Factor',
      'Producer Idle (ms)',
      'Consumer Idle (ms)',
      'Rata-rata Keterisian Buffer (%)'
    ];

    const rows = results.map((r) => [
      r.methodName,
      r.metrics.totalCompletionTime,
      r.metrics.throughput.toFixed(4),
      r.metrics.speedupFactor.toFixed(2),
      r.metrics.producerIdleTime,
      r.metrics.consumerIdleTime,
      r.metrics.avgBufferOccupancy
    ]);

    downloadCsv(`perbandingan-buffering-${Date.now()}.csv`, headers, rows);
  };

  const chartWidth = 560;
  const chartHeight = 200;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(...results.map((r) => r.metrics.totalCompletionTime), 1);
  const barWidth = Math.floor(innerW / results.length) - 18;

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
        flexDirection: 'column'
      }}>
        <div className="panel-header" style={{ padding: '10px 16px' }}>
          <span>Perbandingan Kinerja Strategi Buffering</span>
          <button type="button" className="btn btn-sm" onClick={onClose} aria-label="Tutup modal">
            Tutup [Esc]
          </button>
        </div>

        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Jumlah Item: <span className="mono">{input.itemCount}</span> | Produce (T): <span className="mono">{input.produceTime} ms</span> | Consume (C): <span className="mono">{input.consumeTime} ms</span>
          </div>

          {/* Tabel Perbandingan */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Metrik Kinerja</th>
                  {results.map((r) => (
                    <th key={r.methodName} style={{ textAlign: 'right' }}>
                      {r.methodName.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Waktu Selesai (ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.totalCompletionTime === minTotalTime;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.totalCompletionTime} ms {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Throughput (item/ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.throughput === maxThroughput;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.throughput.toFixed(4)} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Speedup Factor</td>
                  {results.map((r) => {
                    const isBest = r.metrics.speedupFactor === maxSpeedup;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.speedupFactor.toFixed(2)}x {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Producer Idle Time (ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.producerIdleTime === minPIdle;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.producerIdleTime} ms {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Consumer Idle Time (ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.consumerIdleTime === minCIdle;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.consumerIdleTime} ms {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Rata-rata Keterisian Buffer</td>
                  {results.map((r) => (
                    <td key={r.methodName} className="metric-value" style={{ textAlign: 'right' }}>
                      {r.metrics.avgBufferOccupancy}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grafik Batang Total Waktu Selesai */}
          <div style={{ border: '1px solid var(--color-border)', padding: '12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Grafik Batang Perbandingan: Total Waktu Selesai (ms) — Makin Rendah Makin Cepat
            </div>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              role="img"
              aria-label="Grafik batang total waktu selesai per strategi buffering"
            >
              <line x1={padLeft} y1={padTop + innerH} x2={padLeft + innerW} y2={padTop + innerH} stroke="var(--color-border)" strokeWidth="1.5" />
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + innerH} stroke="var(--color-border)" strokeWidth="1.5" />

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const yVal = Math.round(maxVal * (1 - ratio));
                const yPos = padTop + ratio * innerH;
                return (
                  <g key={`chart-y-${ratio}`}>
                    <line x1={padLeft} y1={yPos} x2={padLeft + innerW} y2={yPos} stroke="var(--color-border-subtle)" strokeDasharray="2 2" />
                    <text x={padLeft - 8} y={yPos + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-dim)">
                      {yVal}
                    </text>
                  </g>
                );
              })}

              <text x={12} y={padTop + innerH / 2} textAnchor="middle" transform={`rotate(-90 12 ${padTop + innerH / 2})`} fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)">
                Waktu (ms)
              </text>

              {results.map((r, i) => {
                const bH = (r.metrics.totalCompletionTime / maxVal) * innerH;
                const bX = padLeft + i * (innerW / results.length) + 10;
                const bY = padTop + innerH - bH;
                const isBest = r.metrics.totalCompletionTime === minTotalTime;

                return (
                  <g key={`bar-buf-${r.methodName}`}>
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
                      {r.metrics.totalCompletionTime} ms
                    </text>
                    <text
                      x={bX + barWidth / 2}
                      y={padTop + innerH + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="var(--font-sans)"
                      fill="var(--color-text)"
                    >
                      {r.methodName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              <text x={padLeft + innerW / 2} y={chartHeight - 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)">
                Strategi Buffering
              </text>
            </svg>
          </div>
        </div>

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

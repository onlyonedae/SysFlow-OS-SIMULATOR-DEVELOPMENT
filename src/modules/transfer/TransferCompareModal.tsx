import { simulateTransfer } from '../../core/transfer';
import type {
  TransferMethod,
  TransferSimulationInput,
  TransferSimulationResult
} from '../../core/transfer';
import { downloadCsv } from '../../utils/exportCsv';

export interface TransferCompareModalProps {
  input: TransferSimulationInput;
  onClose: () => void;
}

export const TransferCompareModal: React.FC<TransferCompareModalProps> = ({ input, onClose }) => {
  const methods: TransferMethod[] = ['programmed_io', 'interrupt_driven', 'dma'];
  const results: TransferSimulationResult[] = methods.map((m) =>
    simulateTransfer({ ...input, method: m })
  );

  const minTotalTime = Math.min(...results.map((r) => r.metrics.totalTransferTime));
  const minCpuUtil = Math.min(...results.map((r) => r.metrics.cpuUtilization));
  const minCpuBusy = Math.min(...results.map((r) => r.metrics.cpuBusyTime));
  const maxCpuFree = Math.max(...results.map((r) => r.metrics.cpuFreeTime));
  const minInterrupts = Math.min(...results.map((r) => r.metrics.interruptCount));
  const maxThroughput = Math.max(...results.map((r) => r.metrics.effectiveThroughput));

  const handleExport = () => {
    const headers = [
      'Metode Transfer',
      'Total Waktu Transfer (ms)',
      'Utilisasi CPU (%)',
      'Waktu CPU Sibuk (ms)',
      'Waktu CPU Bebas (ms)',
      'Jumlah Interrupt',
      'Throughput Efektif (KB/ms)'
    ];

    const rows = results.map((r) => [
      r.methodName,
      r.metrics.totalTransferTime,
      r.metrics.cpuUtilization,
      r.metrics.cpuBusyTime,
      r.metrics.cpuFreeTime,
      r.metrics.interruptCount,
      r.metrics.effectiveThroughput.toFixed(3)
    ]);

    downloadCsv(`perbandingan-transfer-${Date.now()}.csv`, headers, rows);
  };

  const chartWidth = 560;
  const chartHeight = 200;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const barWidth = Math.floor(innerW / results.length) - 24;

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
          <span>Perbandingan Pemakaian CPU & Efisiensi Metode Transfer Data</span>
          <button type="button" className="btn btn-sm" onClick={onClose} aria-label="Tutup modal">
            Tutup [Esc]
          </button>
        </div>

        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Ukuran Data: <span className="mono">{input.dataSizeKb} KB</span> | Ukuran Blok: <span className="mono">{input.blockSizeKb} KB</span> | Waktu I/O: <span className="mono">{input.deviceSpeedMsPerBlock} ms/blok</span>
          </div>

          {/* Tabel Perbandingan */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table-compact">
              <thead>
                <tr>
                  <th>Kriteria Metrik</th>
                  {results.map((r) => (
                    <th key={r.methodName} style={{ textAlign: 'right' }}>
                      {r.methodName.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Utilisasi CPU (%)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.cpuUtilization === minCpuUtil;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.cpuUtilization}% {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Waktu CPU Bebas (Free)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.cpuFreeTime === maxCpuFree;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.cpuFreeTime} ms {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Waktu CPU Sibuk (Busy)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.cpuBusyTime === minCpuBusy;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.cpuBusyTime} ms {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Total Waktu Transfer (ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.totalTransferTime === minTotalTime;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.totalTransferTime} ms {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Jumlah Hardware Interrupt</td>
                  {results.map((r) => {
                    const isBest = r.metrics.interruptCount === minInterrupts;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.interruptCount} kali {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td>Throughput Efektif (KB/ms)</td>
                  {results.map((r) => {
                    const isBest = r.metrics.effectiveThroughput === maxThroughput;
                    return (
                      <td key={r.methodName} className={`metric-value ${isBest ? 'best-val' : ''}`} style={{ textAlign: 'right' }}>
                        {r.metrics.effectiveThroughput.toFixed(3)} {isBest ? '✓' : ''}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grafik Batang Utilisasi CPU (%) */}
          <div style={{ border: '1px solid var(--color-border)', padding: '12px', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Grafik Batang Perbandingan: Utilisasi CPU (%) — Makin Rendah Makin Bebas CPU untuk Program Lain
            </div>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              role="img"
              aria-label="Grafik batang persentase pemakaian CPU pada ketiga metode transfer"
            >
              <line x1={padLeft} y1={padTop + innerH} x2={padLeft + innerW} y2={padTop + innerH} stroke="var(--color-border)" strokeWidth="1.5" />
              <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + innerH} stroke="var(--color-border)" strokeWidth="1.5" />

              {[0, 25, 50, 75, 100].map((pct) => {
                const yPos = padTop + ((100 - pct) / 100) * innerH;
                return (
                  <g key={`pct-${pct}`}>
                    <line x1={padLeft} y1={yPos} x2={padLeft + innerW} y2={yPos} stroke="var(--color-border-subtle)" strokeDasharray="2 2" />
                    <text x={padLeft - 8} y={yPos + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-dim)">
                      {pct}%
                    </text>
                  </g>
                );
              })}

              <text x={14} y={padTop + innerH / 2} textAnchor="middle" transform={`rotate(-90 14 ${padTop + innerH / 2})`} fontSize="10" fontFamily="var(--font-sans)" fill="var(--color-text-muted)">
                Persen (%)
              </text>

              {results.map((r, i) => {
                const bH = (r.metrics.cpuUtilization / 100) * innerH;
                const bX = padLeft + i * (innerW / results.length) + 16;
                const bY = padTop + innerH - bH;
                const isBest = r.metrics.cpuUtilization === minCpuUtil;

                let barColor = 'var(--color-idle)';
                if (r.metrics.cpuUtilization < 20) barColor = 'var(--color-served)';
                else if (r.metrics.cpuUtilization < 70) barColor = 'var(--color-waiting)';

                return (
                  <g key={`bar-transfer-${r.methodName}`}>
                    <rect
                      x={bX}
                      y={bY}
                      width={barWidth}
                      height={bH}
                      fill={barColor}
                      opacity={isBest ? 1 : 0.9}
                    />
                    <text
                      x={bX + barWidth / 2}
                      y={bY - 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                      fontWeight="700"
                      fill={barColor}
                    >
                      {r.metrics.cpuUtilization}%
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
                Metode Transfer Data
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

import React from 'react';
import type { TransferMetrics } from '../../core/transfer';

export interface TransferMetricsViewProps {
  metrics: TransferMetrics;
  methodName: string;
  onCompareClick: () => void;
  onExportCsvClick: () => void;
}

export const TransferMetricsView: React.FC<TransferMetricsViewProps> = ({
  metrics,
  methodName,
  onCompareClick,
  onExportCsvClick
}) => {
  return (
    <div className="panel-body">
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
        Hasil Metrik: {methodName}
      </div>

      <table className="table-compact">
        <tbody>
          <tr>
            <th>Total Waktu Transfer</th>
            <td className="metric-value">
              <strong style={{ color: 'var(--color-active)', fontSize: '14px' }}>
                {metrics.totalTransferTime}
              </strong>{' '}
              ms
            </td>
          </tr>
          <tr>
            <th>Utilisasi CPU (Pemakaian)</th>
            <td className="metric-value">
              <strong style={{
                color: metrics.cpuUtilization > 75 ? 'var(--color-idle)' : (metrics.cpuUtilization < 20 ? 'var(--color-served)' : 'var(--color-waiting)'),
                fontSize: '13px'
              }}>
                {metrics.cpuUtilization}%
              </strong>
              {metrics.cpuUtilization >= 100 && (
                <div style={{ fontSize: '10px', color: 'var(--color-idle)' }}>
                  ▲ 100% CPU terbuang untuk polling
                </div>
              )}
              {metrics.cpuUtilization < 20 && (
                <div style={{ fontSize: '10px', color: 'var(--color-served)' }}>
                  ✓ Sangat efisien, CPU bebas komputasi
                </div>
              )}
            </td>
          </tr>
          <tr>
            <th>Waktu CPU Sibuk</th>
            <td className="metric-value">
              {metrics.cpuBusyTime} ms
            </td>
          </tr>
          <tr>
            <th>Waktu CPU Bebas (Free)</th>
            <td className="metric-value">
              <strong style={{ color: metrics.cpuFreeTime > 0 ? 'var(--color-served)' : 'var(--color-idle)' }}>
                {metrics.cpuFreeTime} ms
              </strong>
            </td>
          </tr>
          <tr>
            <th>Jumlah Interrupt Dipicu</th>
            <td className="metric-value">
              {metrics.interruptCount} kali
            </td>
          </tr>
          <tr>
            <th>Throughput Efektif</th>
            <td className="metric-value">
              {metrics.effectiveThroughput.toFixed(3)} KB/ms
            </td>
          </tr>
          <tr>
            <th>Total Blok Ditransfer</th>
            <td className="metric-value">
              {metrics.blocksCount} blok
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tombol Aksi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onCompareClick}
          title="Bandingkan efisiensi CPU dan waktu ketiga metode transfer"
        >
          Bandingkan Ketiga Metode
        </button>
        <button
          type="button"
          className="btn"
          onClick={onExportCsvClick}
          title="Unduh metrik perbandingan transfer data dalam CSV"
        >
          Ekspor Hasil ke CSV
        </button>
      </div>
    </div>
  );
};

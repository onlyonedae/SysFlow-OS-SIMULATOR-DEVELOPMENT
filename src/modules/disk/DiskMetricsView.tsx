import React from 'react';
import type { DiskMetrics } from '../../core/disk';

export interface DiskMetricsViewProps {
  metrics: DiskMetrics;
  algorithmName: string;
  onCompareClick: () => void;
  onExportCsvClick: () => void;
}

export const DiskMetricsView: React.FC<DiskMetricsViewProps> = ({
  metrics,
  algorithmName,
  onCompareClick,
  onExportCsvClick
}) => {
  return (
    <div className="panel-body">
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
        Hasil Metrik: {algorithmName}
      </div>

      <table className="table-compact">
        <tbody>
          <tr>
            <th>Total Pergerakan Head</th>
            <td className="metric-value">
              <strong style={{ color: 'var(--color-active)', fontSize: '14px' }}>
                {metrics.totalHeadMovement}
              </strong>{' '}
              silinder
            </td>
          </tr>
          <tr>
            <th>Estimasi Seek Time</th>
            <td className="metric-value">
              {metrics.estimatedSeekTime.toFixed(1)} ms
            </td>
          </tr>
          <tr>
            <th>Rata-rata Waktu Tunggu</th>
            <td className="metric-value">
              {metrics.avgWaitingTime.toFixed(2)} silinder
            </td>
          </tr>
          <tr>
            <th>Maksimum Waktu Tunggu</th>
            <td className="metric-value">
              <span style={{ color: metrics.maxWaitingTime > 300 ? 'var(--color-idle)' : 'inherit' }}>
                {metrics.maxWaitingTime} silinder
              </span>
              {metrics.maxWaitingTime > 300 && (
                <div style={{ fontSize: '10px', color: 'var(--color-idle)' }}>
                  ▲ Potensi starvation tinggi
                </div>
              )}
            </td>
          </tr>
          <tr>
            <th>Throughput Efektif</th>
            <td className="metric-value">
              {metrics.throughput.toFixed(4)} req/ms
            </td>
          </tr>
          <tr>
            <th>Jumlah Request Dilayani</th>
            <td className="metric-value">
              {metrics.requestsCount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tombol Aksi Tambahan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onCompareClick}
          title="Bandingkan semua metode pada antrean ini"
        >
          Bandingkan Semua Metode
        </button>
        <button
          type="button"
          className="btn"
          onClick={onExportCsvClick}
          title="Unduh metrik dalam format CSV untuk laporan"
        >
          Ekspor Hasil ke CSV
        </button>
      </div>
    </div>
  );
};

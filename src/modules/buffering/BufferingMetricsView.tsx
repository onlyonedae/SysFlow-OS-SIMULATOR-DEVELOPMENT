import React from 'react';
import type { BufferingMetrics } from '../../core/buffering';

export interface BufferingMetricsViewProps {
  metrics: BufferingMetrics;
  methodName: string;
  onCompareClick: () => void;
  onExportCsvClick: () => void;
}

export const BufferingMetricsView: React.FC<BufferingMetricsViewProps> = ({
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
            <th>Total Waktu Selesai</th>
            <td className="metric-value">
              <strong style={{ color: 'var(--color-active)', fontSize: '14px' }}>
                {metrics.totalCompletionTime}
              </strong>{' '}
              ms
            </td>
          </tr>
          <tr>
            <th>Throughput Sistem</th>
            <td className="metric-value">
              {metrics.throughput.toFixed(4)} item/ms
            </td>
          </tr>
          <tr>
            <th>Speedup Relatif</th>
            <td className="metric-value">
              <strong style={{ color: metrics.speedupFactor > 1 ? 'var(--color-served)' : 'inherit' }}>
                {metrics.speedupFactor.toFixed(2)}x
              </strong>{' '}
              vs Unbuffered
            </td>
          </tr>
          <tr>
            <th>Idle Time Producer (I/O)</th>
            <td className="metric-value">
              <span style={{ color: metrics.producerIdleTime > 0 ? 'var(--color-idle)' : 'inherit' }}>
                {metrics.producerIdleTime} ms
              </span>{' '}
              ({metrics.producerUtilization}% aktif)
            </td>
          </tr>
          <tr>
            <th>Idle Time Consumer (CPU)</th>
            <td className="metric-value">
              <span style={{ color: metrics.consumerIdleTime > 0 ? 'var(--color-idle)' : 'inherit' }}>
                {metrics.consumerIdleTime} ms
              </span>{' '}
              ({metrics.consumerUtilization}% aktif)
            </td>
          </tr>
          <tr>
            <th>Rata-rata Keterisian Buffer</th>
            <td className="metric-value">
              {metrics.avgBufferOccupancy}%
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
          title="Bandingkan performa keempat strategi buffering"
        >
          Bandingkan Semua Strategi
        </button>
        <button
          type="button"
          className="btn"
          onClick={onExportCsvClick}
          title="Unduh metrik perbandingan buffering dalam CSV"
        >
          Ekspor Hasil ke CSV
        </button>
      </div>
    </div>
  );
};

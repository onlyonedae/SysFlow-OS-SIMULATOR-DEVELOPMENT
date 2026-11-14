import React from 'react';
import type { BufferingMetrics } from '../../core/buffering';
import { MetricTooltip } from '../../shared/MetricTooltip';

export interface BufferingMetricsViewProps {
  metrics: BufferingMetrics;
  methodName?: string;
  onCompareClick?: () => void;
  onExportCsvClick?: () => void;
}

export const BufferingMetricsView: React.FC<BufferingMetricsViewProps> = ({
  metrics
}) => {
  return (
    <div className="evaluation-strip-body">
      {/* ─── Strip 4 Metrik Horizontal Bersekat Garis Sesuai Figma ─── */}
      <div className="metrics-strip">
        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">TOTAL WAKTU SELESAI</span>
            <MetricTooltip text="Total durasi siklus diskret yang dibutuhkan hingga seluruh item selesai diproduksi dan dikonsumsi." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.totalCompletionTime.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">THROUGHPUT</span>
            <MetricTooltip text="Jumlah item data yang selesai diproses per milidetik (Item Selesai ÷ Total Waktu)." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.throughput.toFixed(4).replace('.', ',')}</span>
            <span className="metric-unit">item/ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">SPEEDUP VS TANPA BUFFER</span>
            <MetricTooltip text="Faktor percepatan rasio total waktu strategi ini dibandingkan konfigurasi unbuffered (tanpa buffer)." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.speedupFactor.toFixed(2).replace('.', ',')}</span>
            <span className="metric-unit">×</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">KETERISIAN RATA-RATA</span>
            <MetricTooltip text="Persentase rata-rata slot buffer yang terisi data sepanjang seluruh siklus eksekusi." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.avgBufferOccupancy.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">%</span>
          </div>
        </div>
      </div>

      <div className="metric-footer-strip">
        <span>Double dan Circular seri pada total waktu; Circular menghapus idle producer saat pola burst.</span>
        <span className="mono">semua durasi 1 desimal</span>
      </div>
    </div>
  );
};

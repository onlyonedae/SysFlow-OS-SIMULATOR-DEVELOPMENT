import React from 'react';
import type { DiskMetrics, DiskStepTrace } from '../../core/disk';
import { MetricTooltip } from '../../shared/MetricTooltip';

export interface DiskMetricsViewProps {
  metrics: DiskMetrics;
  algorithmName?: string;
  currentStep?: number;
  totalSteps?: number;
  currentTrace?: DiskStepTrace | undefined;
  onCompareClick?: () => void;
  onExportCsvClick?: () => void;
}

export const DiskMetricsView: React.FC<DiskMetricsViewProps> = ({
  metrics
}) => {
  const hasStarvation = metrics.maxWaitingTime > 300;
  const ratioToAvg = metrics.avgWaitingTime > 0 ? (metrics.maxWaitingTime / metrics.avgWaitingTime).toFixed(2).replace('.', ',') : '1,00';

  return (
    <div className="evaluation-strip-body">
      {/* ─── Strip 4 Metrik Horizontal Bersekat Garis (Sesuai Figma) ─── */}
      <div className="metrics-strip">
        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">TOTAL GERAK HEAD</span>
            <MetricTooltip text="Total jarak fisik silinder (track) yang harus ditempuh lengan disk untuk melayani seluruh antrean." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.totalHeadMovement}</span>
            <span className="metric-unit">track</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">ESTIMASI SEEK</span>
            <MetricTooltip text="Estimasi waktu pencarian fisik lengan aktuator = Total gerak silinder × waktu tempuh per track (default 0,5 ms/track)." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.estimatedSeekTime.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">TUNGGU RATA-RATA</span>
            <MetricTooltip text="Rata-rata waktu tunggu setiap request dari saat simulasi dimulai (t=0) sampai request selesai dilayani." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.avgWaitingTime.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">TUNGGU MAKSIMUM</span>
            <MetricTooltip text="Waktu tunggu terlama sebuah request dalam antrean." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big" style={{ color: hasStarvation ? 'var(--color-danger)' : undefined }}>
              {metrics.maxWaitingTime.toFixed ? metrics.maxWaitingTime.toFixed(1).replace('.', ',') : metrics.maxWaitingTime}
            </span>
            <span className="metric-unit">ms</span>
          </div>
          <span className="metric-caption-sub">
            {ratioToAvg}× rata-rata
          </span>
        </div>
      </div>

      <div className="metric-footer-strip">
        <span>Seek = total gerak × 0,5 ms/track. Tunggu dihitung dari t=0 sampai head tiba di request.</span>
        <span className="mono">semua durasi 1 desimal</span>
      </div>
    </div>
  );
};

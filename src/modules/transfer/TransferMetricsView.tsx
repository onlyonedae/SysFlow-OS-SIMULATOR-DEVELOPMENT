import React from 'react';
import type { TransferMetrics } from '../../core/transfer';
import { MetricTooltip } from '../../shared/MetricTooltip';

export interface TransferMetricsViewProps {
  metrics: TransferMetrics;
  methodName?: string;
  onCompareClick?: () => void;
  onExportCsvClick?: () => void;
}

export const TransferMetricsView: React.FC<TransferMetricsViewProps> = ({
  metrics
}) => {
  return (
    <div className="evaluation-strip-body">
      {/* ─── Strip 4 Metrik Horizontal Bersekat Garis Sesuai Figma ─── */}
      <div className="metrics-strip">
        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">TOTAL WAKTU TRANSFER</span>
            <MetricTooltip text="Total durasi siklus diskret yang dibutuhkan untuk mentransfer seluruh blok data ke memori." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.totalTransferTime.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">CPU SIBUK</span>
            <MetricTooltip text="Total waktu prosesor tersita untuk polling, mengeksekusi rutin interrupt (ISR), atau menyalin blok data." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.cpuBusyTime.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">CPU BEBAS</span>
            <MetricTooltip text="Waktu di mana prosesor terbebas dari operasi I/O dan dapat menjalankan instruksi komputasi aplikasi lain." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.cpuFreeTime.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">ms</span>
          </div>
        </div>

        <div className="metric-strip-cell">
          <div className="metric-label-row">
            <span className="metric-label">UTILISASI CPU</span>
            <MetricTooltip text="Persentase keterikatan CPU terhadap operasi I/O (CPU Sibuk ÷ Total Waktu Transfer)." />
          </div>
          <div className="metric-value-row">
            <span className="metric-value-big">{metrics.cpuUtilization.toFixed(1).replace('.', ',')}</span>
            <span className="metric-unit">%</span>
          </div>
        </div>
      </div>

      <div className="metric-footer-strip">
        <span>Programmed I/O selesai lebih cepat tetapi mengunci 100% CPU. DMA melepas CPU untuk tugas komputasi lain.</span>
        <span className="mono">semua durasi 1 desimal</span>
      </div>
    </div>
  );
};

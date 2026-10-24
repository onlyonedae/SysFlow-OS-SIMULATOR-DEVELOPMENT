import React from 'react';
import type { DiskMetrics, DiskStepTrace } from '../../core/disk';

export interface DiskMetricsViewProps {
  metrics: DiskMetrics;
  algorithmName: string;
  currentStep: number;
  totalSteps: number;
  currentTrace: DiskStepTrace | undefined;
  onCompareClick: () => void;
  onExportCsvClick: () => void;
}

export const DiskMetricsView: React.FC<DiskMetricsViewProps> = ({
  metrics,
  algorithmName,
  currentStep,
  totalSteps,
  currentTrace,
  onExportCsvClick
}) => {
  const isPartial = currentStep < totalSteps;
  const hasStarvation = metrics.maxWaitingTime > 300;

  return (
    <div className="panel-body">
      {/* Deskripsi proyeksi */}
      <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '-4px' }}>
        Proyeksi seluruh antrean ({metrics.requestsCount} request).
      </p>

      {/* ─── Grid Metrik 2×2 ─── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total gerak head</span>
          <span className="metric-value-big">
            {metrics.totalHeadMovement}
            <span className="metric-unit"> track</span>
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Estimasi seek</span>
          <span className="metric-value-big">
            {metrics.estimatedSeekTime.toFixed(1).replace('.', ',')}
            <span className="metric-unit"> ms</span>
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Tunggu rata-rata</span>
          <span className="metric-value-big">
            {metrics.avgWaitingTime.toFixed(2).replace('.', ',')}
            <span className="metric-unit"> ms</span>
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Tunggu maksimum</span>
          <span className="metric-value-big" style={{ color: hasStarvation ? 'var(--color-idle)' : undefined }}>
            {metrics.maxWaitingTime.toFixed ? metrics.maxWaitingTime.toFixed(1).replace('.', ',') : metrics.maxWaitingTime}
            <span className="metric-unit"> ms</span>
          </span>
        </div>
      </div>

      <p className="metric-note">
        Seek = 0,1 ms/track. Tunggu dihitung dari t=0 hingga head tiba pada request.
      </p>

      <hr className="divider" />

      {/* ─── Status Cuplikan ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="snapshot-badge">
          {isPartial ? (
            <>
              <span className="snapshot-dot" />
              CUPLIKAN PARSIAL
            </>
          ) : (
            <>
              <span className="snapshot-dot" style={{ backgroundColor: 'var(--color-served)' }} />
              SELESAI
            </>
          )}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--color-text-dim)',
        }}>
          · {isPartial ? 'DIJEDA' : 'LENGKAP'}
        </span>
      </div>

      {/* ─── Step Aktif Detail Card ─── */}
      {currentTrace && currentTrace.stepIndex > 0 && (
        <div className="step-card">
          <span className="step-card-label">
            LANGKAH {currentTrace.stepIndex} / {totalSteps}
            {currentTrace.servedTrack !== null && (
              <span style={{ color: 'var(--color-text-muted)' }}>
                {' '}→ {currentTrace.headPosition}
              </span>
            )}
          </span>
          <div className="step-card-body">
            {currentTrace.explanation}
          </div>
          {currentTrace.distance > 0 && (
            <span className="step-card-footer">
              Kumulatif:{' '}
              {currentTrace.visitedTracks.length >= 2
                ? currentTrace.visitedTracks.reduce((acc, t, i, arr) =>
                    i === 0 ? 0 : acc + Math.abs(t - arr[i - 1]), 0)
                : currentTrace.distance}{' '}
              track •{' '}
              {((currentTrace.visitedTracks.length >= 2
                ? currentTrace.visitedTracks.reduce((acc, t, i, arr) =>
                    i === 0 ? 0 : acc + Math.abs(t - arr[i - 1]), 0)
                : currentTrace.distance) * (metrics.estimatedSeekTime / Math.max(metrics.totalHeadMovement, 1))).toFixed(1)}{' '}
              ms
            </span>
          )}
        </div>
      )}

      {/* ─── Starvation Info ─── */}
      {!hasStarvation ? (
        <div className="step-starvation-ok">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Tidak ada starvation pada antrean ini
        </div>
      ) : (
        <div className="step-starvation-ok" style={{
          color: 'var(--color-idle)',
          backgroundColor: 'var(--color-idle-bg)',
          borderColor: 'var(--color-idle-border)'
        }}>
          ▲ Potensi starvation tinggi ({algorithmName})
        </div>
      )}

      {/* ─── Aksi ─── */}
      <button
        type="button"
        className="btn btn-sm"
        onClick={onExportCsvClick}
        title="Unduh metrik dalam format CSV"
        style={{ marginTop: 'auto' }}
      >
        ↓ Ekspor CSV
      </button>
    </div>
  );
};

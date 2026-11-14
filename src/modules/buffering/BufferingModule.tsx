import React, { useState, useEffect, useMemo, useRef } from 'react';
import { simulateBuffering } from '../../core/buffering';
import type { BufferingSimulationInput } from '../../core/buffering';
import { BufferingParamsForm } from './BufferingParamsForm';
import { BufferSlotsView } from './BufferSlotsView';
import { BufferTimeline } from './BufferTimeline';
import { BufferingMetricsView } from './BufferingMetricsView';
import { BufferingComparePanel } from './BufferingComparePanel';
import { downloadCsv } from '../../utils/exportCsv';

export const BufferingModule: React.FC = () => {
  const [input, setInput] = useState<BufferingSimulationInput>({
    method: 'double',
    itemCount: 8,
    produceTime: 4,
    consumeTime: 6,
    bufferCapacity: 4
  });

  const simulationResult = useMemo(() => {
    return simulateBuffering(input);
  }, [input]);

  const totalSteps = simulationResult.traces.length - 1;

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const playTimerRef = useRef<number | null>(null);

  // Reset step ketika input berubah
  const prevInputRef = useRef(input);
  useEffect(() => {
    if (prevInputRef.current !== input) {
      prevInputRef.current = input;
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [input]);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(150, Math.floor(1000 / speed));
      playTimerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, speed, totalSteps]);

  const handlePlay = () => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const currentTrace = simulationResult.traces[currentStep];

  const handleExportCsv = () => {
    const methods: BufferingSimulationInput['method'][] = ['unbuffered', 'single', 'double', 'circular'];
    const results = methods.map((m) => simulateBuffering({ ...input, method: m }));

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

    downloadCsv(`sysflow-buffering-${Date.now()}.csv`, headers, rows);
  };

  return (
    <div className="instrument-shell">
      {/* ─── Header Halaman Sesuai Figma ─── */}
      <header className="instrument-page-header">
        <div>
          <h1 className="instrument-page-title">Buffering</h1>
          <div className="instrument-page-subtitle">
            Bandingkan empat strategi buffer pada pola producer–consumer yang sama.
          </div>
        </div>
        <div className="instrument-header-meta">
          <div>{input.itemCount} item · T={input.produceTime} ms · C={input.consumeTime} ms</div>
          <div>{simulationResult.methodName} · {input.method === 'circular' ? `${input.bufferCapacity ?? 4} slot` : (input.method === 'double' ? '2 slot' : (input.method === 'single' ? '1 slot' : '0 slot'))}</div>
        </div>
      </header>

      {/* ─── Baris Utama: Tahap 1 (Rel Kiri) & Tahap 2 (Panel Kanan) ─── */}
      <div className="instrument-main-row">
        {/* Tahap 1: Rel Kiri (~360px) */}
        <section className="instrument-card stage-rail" aria-label="1. Pola & parameter">
          <div className="instrument-stage-header">
            <span>1. Pola & parameter</span>
          </div>
          <BufferingParamsForm
            input={input}
            onInputChange={setInput}
          />
        </section>

        {/* Tahap 2: Visualisasi Simultan & Timeline */}
        <section className="instrument-card stage-main" aria-label="2. Slot & timeline">
          <div className="instrument-stage-header">
            <span>2. Slot & timeline</span>
            <span className="stage-header-meta mono">
              {simulationResult.methodName.toLowerCase()} · langkah {currentStep} / {totalSteps}
            </span>
          </div>

          {/* Slot Cards & Telemetri Aktor */}
          <BufferSlotsView
            slots={currentTrace?.slots || []}
            currentTrace={currentTrace}
            method={input.method}
          />

          {/* Timeline Diagram */}
          <BufferTimeline
            timeline={simulationResult.timeline}
            currentTime={currentTrace?.currentTime ?? 0}
            totalTime={simulationResult.metrics.totalCompletionTime}
          />

          {/* Bar Kontrol Playback */}
          <div className="instrument-playback-bar">
            <div className="playback-btns">
              <button
                type="button"
                className="btn-playback"
                onClick={handleStepBackward}
                disabled={currentStep <= 0}
                title="Langkah sebelumnya"
              >
                ◀
              </button>
              <button
                type="button"
                className="btn-playback primary"
                onClick={isPlaying ? handlePause : handlePlay}
                title={isPlaying ? 'Jeda simulasi' : 'Jalankan simulasi'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                className="btn-playback"
                onClick={handleStepForward}
                disabled={currentStep >= totalSteps}
                title="Langkah berikutnya"
              >
                ▶
              </button>
              <button
                type="button"
                className="btn-playback"
                onClick={handleReset}
                title="Reset simulasi ke awal"
              >
                ↺
              </button>
            </div>

            <div className="playback-status mono">
              <span>LANGKAH {currentStep} / {totalSteps}</span>
              <span className="playback-sub">· t = {currentTrace?.currentTime ?? 0} ms</span>
            </div>

            <div className="playback-speed">
              <span className="speed-label">Kecepatan:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="speed-slider"
              />
              <span className="speed-value mono">{speed.toFixed(1)}×</span>
            </div>
          </div>

          {/* Kotak Narasi Penjelasan Langkah */}
          <div className="instrument-narration-box">
            <div className="narration-accent-line" />
            <div className="narration-content">
              <div className="narration-step-tag">LANGKAH {currentStep}</div>
              <div className="narration-text">
                {currentTrace?.explanation || 'Simulasi dimulai pada t=0.'}
              </div>
            </div>
            <div className="narration-meta mono">
              <div>selesai {currentTrace?.completedItemsCount ?? 0} / {input.itemCount}</div>
              <div>t = {currentTrace?.currentTime ?? 0} ms</div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Baris Bawah: Tahap 3 (Evaluasi Lebar Penuh) ─── */}
      <section className="instrument-card stage-evaluation" aria-label="3. Evaluasi">
        <div className="instrument-stage-header">
          <span>3. Evaluasi</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="stage-header-meta mono">proyeksi seluruh {input.itemCount} item</span>
            <button
              type="button"
              className="action-btn"
              onClick={handleExportCsv}
              title="Unduh seluruh metrik perbandingan buffering dalam format CSV"
            >
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* 4 Metrik Raksasa Bersekat Garis */}
        <BufferingMetricsView
          metrics={simulationResult.metrics}
        />

        {/* Tabel Komparasi 4 Strategi Lebar Penuh dengan Batang Relatif */}
        <div style={{ padding: '0 24px 20px' }}>
          <BufferingComparePanel
            input={input}
            activeMethod={input.method}
            onSelectMethod={(m) => setInput({ ...input, method: m })}
          />
        </div>
      </section>

      {/* ─── Footer Halaman Sesuai Figma ─── */}
      <footer className="instrument-footer">
        <span>Model deterministik: producer dan consumer berjalan pada waktu diskret; tidak ada waktu setup.</span>
        <span className="mono">SYSFLOW 1.9</span>
      </footer>
    </div>
  );
};

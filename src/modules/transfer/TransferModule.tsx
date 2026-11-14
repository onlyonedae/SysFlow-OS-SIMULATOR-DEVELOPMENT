import React, { useState, useEffect, useMemo, useRef } from 'react';
import { simulateTransfer } from '../../core/transfer';
import type { TransferSimulationInput, TransferMethod } from '../../core/transfer';
import { TransferParamsForm } from './TransferParamsForm';
import { TransferHardwareView } from './TransferHardwareView';
import { TimingDiagram } from './TimingDiagram';
import { TransferMetricsView } from './TransferMetricsView';
import { TransferComparePanel } from './TransferComparePanel';
import { PlaybackControls } from '../../shared/PlaybackControls';
import { downloadCsv } from '../../utils/exportCsv';

export const TransferModule: React.FC = () => {
  const [input, setInput] = useState<TransferSimulationInput>({
    method: 'interrupt_driven',
    dataSizeKb: 64,
    blockSizeKb: 4,
    deviceSpeedMsPerBlock: 5,
    interruptCostMs: 2,
    dmaSetupTimeMs: 3,
    cpuCopyTimePerBlockMs: 1
  });

  const simulationResult = useMemo(() => {
    return simulateTransfer(input);
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
    const methods: TransferMethod[] = ['programmed_io', 'interrupt_driven', 'dma'];
    const results = methods.map((m) => simulateTransfer({ ...input, method: m }));

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

    downloadCsv(`sysflow-transfer-${Date.now()}.csv`, headers, rows);
  };

  const totalBlocks = Math.max(1, Math.ceil(input.dataSizeKb / Math.max(1, input.blockSizeKb)));

  return (
    <div className="instrument-shell">
      {/* ─── Header Halaman Sesuai Figma ─── */}
      <header className="instrument-page-header">
        <div>
          <h1 className="instrument-page-title">Transfer Data</h1>
          <div className="instrument-page-subtitle">
            Bandingkan tiga metode transfer pada ukuran data dan perangkat yang sama.
          </div>
        </div>
        <div className="instrument-header-meta">
          <div>{input.dataSizeKb} KB · {totalBlocks} blok · {input.blockSizeKb} KB/blok</div>
          <div>{input.deviceSpeedMsPerBlock} ms/blok · interrupt {input.interruptCostMs} ms</div>
        </div>
      </header>

      {/* ─── Baris Utama: Tahap 1 (Rel Kiri) & Tahap 2 (Panel Kanan) ─── */}
      <div className="instrument-main-row">
        {/* Tahap 1: Rel Kiri (~360px) */}
        <section className="instrument-card stage-rail" aria-label="1. Metode & perangkat">
          <div className="instrument-stage-header">
            <span>1. Metode &amp; perangkat</span>
          </div>
          <TransferParamsForm
            input={input}
            onInputChange={setInput}
          />
        </section>

        {/* Tahap 2: Bus & Timing Simultan */}
        <section className="instrument-card stage-main" aria-label="2. Bus & timing">
          <div className="instrument-stage-header">
            <span>2. Bus &amp; timing</span>
            <span className="stage-header-meta mono">
              {simulationResult.methodName.toLowerCase()} · langkah {currentStep} / {totalSteps}
            </span>
          </div>

          {/* Arsitektur Bus & Node Hardware */}
          <TransferHardwareView
            currentTrace={currentTrace}
            method={input.method}
            dataSizeKb={input.dataSizeKb}
          />

          {/* Timing Diagram 3 Jalur */}
          <TimingDiagram
            timeline={simulationResult.timeline}
            currentTime={currentTrace?.currentTime ?? 0}
            totalTime={simulationResult.metrics.totalTransferTime}
          />

          {/* Bar Kontrol Playback */}
          <PlaybackControls
            isPlaying={isPlaying}
            currentStep={currentStep}
            totalSteps={totalSteps}
            speed={speed}
            timeMs={currentTrace?.currentTime ?? 0}
            onPlay={handlePlay}
            onPause={handlePause}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            onSpeedChange={setSpeed}
          />

          {/* Kotak Narasi Penjelasan Langkah */}
          <div className="stage-narration-bar">
            <div className="narration-accent-line" />
            <div className="narration-content">
              <div className="narration-step-tag">LANGKAH {currentStep}</div>
              <div className="narration-text">
                {currentTrace?.explanation || 'Proses inisialisasi transfer data dimulai.'}
              </div>
            </div>
            <div className="narration-meta mono">
              <div>blok {currentTrace?.transferredBlocks ?? 0} / {totalBlocks}</div>
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
            <span className="stage-header-meta mono">proyeksi seluruh {totalBlocks} blok</span>
            <button
              type="button"
              className="action-btn"
              onClick={handleExportCsv}
              title="Unduh seluruh metrik perbandingan transfer data dalam format CSV"
            >
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* 4 Metrik Raksasa Bersekat Garis */}
        <TransferMetricsView
          metrics={simulationResult.metrics}
        />

        {/* Tabel Komparasi 3 Metode Lebar Penuh dengan Batang Relatif */}
        <div style={{ padding: '0 24px 20px' }}>
          <TransferComparePanel
            input={input}
            activeMethod={input.method}
            onSelectMethod={(m) => setInput({ ...input, method: m })}
          />
        </div>
      </section>

      {/* ─── Footer Halaman Sesuai Figma ─── */}
      <footer className="instrument-footer">
        <span>Model: waktu perangkat konstan per blok; CPU tidak menjalankan proses lain selama menunggu.</span>
        <span className="mono">SYSFLOW 1.9</span>
      </footer>
    </div>
  );
};

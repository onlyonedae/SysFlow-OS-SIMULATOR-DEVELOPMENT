import React, { useState, useEffect, useMemo, useRef } from 'react';
import { runDiskSimulation, DEFAULT_SEEK_TIME_PER_CYLINDER } from '../../core/disk';
import type {
  DiskAlgorithm,
  DiskSimulationInput,
  DiskSimulationResult
} from '../../core/disk';
import { DiskParamsForm } from './DiskParamsForm';
import { DiskTrackChart } from './DiskTrackChart';
import { DiskPlatterView } from './DiskPlatterView';
import { DiskMetricsView } from './DiskMetricsView';
import { PlaybackControls } from '../../shared/PlaybackControls';
import { DiskComparePanel } from './DiskComparePanel';

export interface DiskModuleProps {
  onOpenCompare: (input: DiskSimulationInput) => void;
  onExportCsv: (results: DiskSimulationResult[]) => void;
}

export const DiskModule: React.FC<DiskModuleProps> = ({ onExportCsv }) => {
  // Input Default: Kasus Buku Teks Silberschatz
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('SSTF');
  const [input, setInput] = useState<DiskSimulationInput>({
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    initialHead: 53,
    minTrack: 0,
    maxTrack: 199,
    direction: 'left',
    countJumpReturn: true,
    seekTimePerCylinder: DEFAULT_SEEK_TIME_PER_CYLINDER
  });

  // Jalankan simulasi murni saat input atau algoritma berubah
  const simulationResult = useMemo(() => {
    return runDiskSimulation(algorithm, input);
  }, [algorithm, input]);

  const totalSteps = simulationResult.traces.length - 1;

  // State Pemutaran
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const playTimerRef = useRef<number | null>(null);

  // Reset step ketika algoritma atau parameter berubah
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, input]);

  // Loop Timer Pemutaran
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

  // Kumulatif jarak sampai langkah saat ini
  const cumulativeDistance = useMemo(() => {
    return simulationResult.traces.slice(1, currentStep + 1).reduce((acc, s) => acc + s.distance, 0);
  }, [simulationResult.traces, currentStep]);

  // Handler ekspor semua metode
  const handleExportCsv = () => {
    const algos: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];
    const allResults = algos.map((alg) => runDiskSimulation(alg, input));
    onExportCsv(allResults);
  };

  return (
    <div className="instrument-shell">
      {/* ─── Page Header Sesuai Figma ─── */}
      <div className="instrument-page-header">
        <div>
          <h1 className="instrument-page-title">Penjadwalan Disk</h1>
          <p className="instrument-page-subtitle">Bandingkan enam algoritma penjadwalan pada antrean yang sama.</p>
        </div>
        <div className="instrument-header-meta">
          <div>{input.requests.length} request · silinder {input.minTrack}–{input.maxTrack}</div>
          <div>seek {(input.seekTimePerCylinder ?? DEFAULT_SEEK_TIME_PER_CYLINDER).toFixed(1).replace('.', ',')} ms/track</div>
        </div>
      </div>

      {/* ─── Baris Atas (Stage 1 & Stage 2) ─── */}
      <div className="instrument-main-row">

        {/* ── 1. Antrean & parameter (Left Rail ~360px) ── */}
        <section className="instrument-card stage-rail" aria-label="1. Antrean & parameter">
          <div className="instrument-stage-header">
            <span>1. Antrean &amp; parameter</span>
          </div>
          <DiskParamsForm
            algorithm={algorithm}
            onAlgorithmChange={setAlgorithm}
            input={input}
            onInputChange={setInput}
          />
        </section>

        {/* ── 2. Jalur head (Right Panel) ── */}
        <section className="instrument-card stage-main" aria-label="2. Jalur head">
          <div className="instrument-stage-header">
            <span>2. Jalur head</span>
            <span className="stage-header-meta mono">
              {algorithm} · langkah {currentStep} / {totalSteps}
            </span>
          </div>

          {/* Visual Split: Chart di Kiri, Platter di Kanan Berdampingan */}
          <div className="stage-visual-split">
            <div className="stage-chart-area">
              <DiskTrackChart
                traces={simulationResult.traces}
                currentStep={currentStep}
                minTrack={input.minTrack}
                maxTrack={input.maxTrack}
                allRequests={input.requests}
              />
            </div>
            <div className="stage-platter-area">
              <DiskPlatterView
                currentTrace={currentTrace}
                minTrack={input.minTrack}
                maxTrack={input.maxTrack}
                allRequests={input.requests}
                isPlaying={isPlaying}
                seekTimePerCylinder={input.seekTimePerCylinder ?? DEFAULT_SEEK_TIME_PER_CYLINDER}
                cumulativeDistance={cumulativeDistance}
              />
            </div>
          </div>

          {/* Kontrol Pemutaran */}
          <div className="instrument-playback-bar">
            <PlaybackControls
              isPlaying={isPlaying}
              currentStep={currentStep}
              totalSteps={totalSteps}
              speed={speed}
              onPlay={handlePlay}
              onPause={handlePause}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* Bar Narasi Sesuai Figma */}
          <div className="stage-narration-bar">
            <div className="narration-accent-line" />
            <div className="narration-content">
              <div className="narration-step-tag">LANGKAH {currentStep}</div>
              <div className="narration-text">
                {currentTrace?.explanation || 'Head disk berada di posisi awal.'}
              </div>
            </div>
            <div className="narration-meta mono">
              <div>+{currentTrace?.distance ?? 0} track</div>
              <div>{((cumulativeDistance) * (input.seekTimePerCylinder ?? DEFAULT_SEEK_TIME_PER_CYLINDER)).toFixed(1).replace('.', ',')} ms kumulatif</div>
            </div>
          </div>
        </section>

      </div>

      {/* ─── Baris Bawah: 3. Evaluasi (Lebar Penuh) ─── */}
      <section className="instrument-card stage-evaluation" aria-label="3. Evaluasi">
        <div className="instrument-stage-header">
          <span>3. Evaluasi</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="stage-header-meta mono">proyeksi seluruh {input.requests.length} request</span>
            <button
              type="button"
              className="action-btn"
              onClick={handleExportCsv}
              title="Unduh seluruh metrik perbandingan dalam format CSV"
            >
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* 4 Metrik Raksasa Bersekat Garis */}
        <DiskMetricsView
          metrics={simulationResult.metrics}
          algorithmName={simulationResult.algorithmName}
          currentStep={currentStep}
          totalSteps={totalSteps}
          currentTrace={currentTrace}
          onExportCsvClick={handleExportCsv}
        />

        {/* Tabel Komparasi 6 Algoritma Lebar Penuh dengan Batang Relatif */}
        <div style={{ padding: '0 24px 20px' }}>
          <DiskComparePanel
            input={input}
            activeAlgorithm={algorithm}
          />
        </div>
      </section>

      {/* ─── Footer Halaman Sesuai Figma ─── */}
      <footer className="instrument-footer">
        <span>Model: semua request tiba pada t=0; tanpa latensi rotasi dan transfer. Starvation tidak dimodelkan.</span>
        <span className="mono">SYSFLOW 1.9</span>
      </footer>
    </div>
  );
};

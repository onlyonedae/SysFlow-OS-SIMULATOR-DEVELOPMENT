import React, { useState, useEffect, useMemo, useRef } from 'react';
import { runDiskSimulation } from '../../core/disk';
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
import { StepExplanation } from '../../shared/StepExplanation';

export interface DiskModuleProps {
  onOpenCompare: (input: DiskSimulationInput) => void;
  onExportCsv: (results: DiskSimulationResult[]) => void;
}

export const DiskModule: React.FC<DiskModuleProps> = ({ onOpenCompare, onExportCsv }) => {
  // Input Default: Kasus Buku Teks Silberschatz
  const [algorithm, setAlgorithm] = useState<DiskAlgorithm>('FCFS');
  const [input, setInput] = useState<DiskSimulationInput>({
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    initialHead: 53,
    minTrack: 0,
    maxTrack: 199,
    direction: 'left',
    countJumpReturn: true,
    seekTimePerCylinder: 0.5
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

  // Handler ekspor semua metode
  const handleExportCsv = () => {
    const algos: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];
    const allResults = algos.map((alg) => runDiskSimulation(alg, input));
    onExportCsv(allResults);
  };

  return (
    <div className="workspace-grid">
      {/* Kolom 1: Panel Parameter */}
      <section className="panel" aria-label="Pengaturan Parameter Simulasi">
        <div className="panel-header">
          <span>Parameter Penjadwalan Disk</span>
        </div>
        <DiskParamsForm
          algorithm={algorithm}
          onAlgorithmChange={setAlgorithm}
          input={input}
          onInputChange={setInput}
        />
      </section>

      {/* Kolom 2: Kanvas Visualisasi Dominan & Kontrol */}
      <section className="panel" aria-label="Visualisasi Interaktif Disk" style={{ overflowY: 'auto' }}>
        <div className="panel-header">
          <span>Visualisasi Pergerakan Head Disk</span>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--color-active)' }}>
            Metode: {algorithm}
          </span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Visualisasi Piringan & Lengan Head */}
          <DiskPlatterView
            currentTrace={currentTrace}
            minTrack={input.minTrack}
            maxTrack={input.maxTrack}
            allRequests={input.requests}
            isPlaying={isPlaying}
          />

          {/* Grafik Jalur Head (X: Track, Y: Step) */}
          <DiskTrackChart
            traces={simulationResult.traces}
            currentStep={currentStep}
            minTrack={input.minTrack}
            maxTrack={input.maxTrack}
            allRequests={input.requests}
          />
        </div>

        {/* Kontrol Putar di Bawah Kanvas */}
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

        {/* Panel Penjelasan Langkah */}
        <StepExplanation
          currentStep={currentStep}
          totalSteps={totalSteps}
          explanation={currentTrace?.explanation || ''}
          headPosition={currentTrace?.headPosition}
          distance={currentTrace?.distance}
          isJump={currentTrace?.isJump}
        />
      </section>

      {/* Kolom 3: Panel Metrik Hasil */}
      <section className="panel" aria-label="Metrik Kinerja Algoritma">
        <div className="panel-header">
          <span>Metrik Evaluasi Kinerja</span>
        </div>
        <DiskMetricsView
          metrics={simulationResult.metrics}
          algorithmName={simulationResult.algorithmName}
          onCompareClick={() => onOpenCompare(input)}
          onExportCsvClick={handleExportCsv}
        />
      </section>
    </div>
  );
};

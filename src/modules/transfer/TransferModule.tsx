import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  simulateTransfer
} from '../../core/transfer';
import type {
  TransferSimulationInput,
  TransferMethod
} from '../../core/transfer';
import { TransferParamsForm } from './TransferParamsForm';
import { TransferHardwareView } from './TransferHardwareView';
import { TimingDiagram } from './TimingDiagram';
import { TransferMetricsView } from './TransferMetricsView';
import { PlaybackControls } from '../../shared/PlaybackControls';
import { StepExplanation } from '../../shared/StepExplanation';
import { TransferCompareModal } from './TransferCompareModal';
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

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Jalankan simulasi murni
  const simulationResult = useMemo(() => {
    return simulateTransfer(input);
  }, [input]);

  const totalSteps = simulationResult.traces.length - 1;

  // State Pemutaran
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const playTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
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

  return (
    <div className="workspace-grid">
      {/* Kolom 1: Parameter */}
      <section className="panel" aria-label="Parameter Transfer Data">
        <div className="panel-header">
          <span>Parameter Transfer Data</span>
        </div>
        <TransferParamsForm input={input} onInputChange={setInput} />
      </section>

      {/* Kolom 2: Visualisasi Dominan & Diagram Timing 3 Jalur */}
      <section className="panel" aria-label="Visualisasi Transfer Data" style={{ overflowY: 'auto' }}>
        <div className="panel-header">
          <span>Timing Diagram & Arsitektur Bus</span>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--color-active)' }}>
            Metode: {simulationResult.methodName}
          </span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Topologi Arsitektur Hardware Bus */}
          <TransferHardwareView
            currentTrace={currentTrace}
            method={input.method}
            dataSizeKb={input.dataSizeKb}
          />

          {/* Timing Diagram 3 Jalur (CPU, Device, Memori) */}
          <TimingDiagram
            timeline={simulationResult.timeline}
            currentTime={currentTrace?.currentTime ?? 0}
            totalTime={simulationResult.metrics.totalTransferTime}
          />
        </div>

        {/* Kontrol Putar */}
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
        />
      </section>

      {/* Kolom 3: Metrik */}
      <section className="panel" aria-label="Metrik Transfer Data">
        <div className="panel-header">
          <span>Metrik Utilisasi CPU & Waktu</span>
        </div>
        <TransferMetricsView
          metrics={simulationResult.metrics}
          methodName={simulationResult.methodName}
          onCompareClick={() => setIsCompareOpen(true)}
          onExportCsvClick={handleExportCsv}
        />
      </section>

      {/* Modal Bandingkan */}
      {isCompareOpen && (
        <TransferCompareModal
          input={input}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
};

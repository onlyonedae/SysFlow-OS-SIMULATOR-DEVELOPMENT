import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  simulateBuffering
} from '../../core/buffering';
import type {
  BufferingSimulationInput
} from '../../core/buffering';
import { BufferingParamsForm } from './BufferingParamsForm';
import { BufferSlotsView } from './BufferSlotsView';
import { BufferTimeline } from './BufferTimeline';
import { BufferingMetricsView } from './BufferingMetricsView';
import { PlaybackControls } from '../../shared/PlaybackControls';
import { StepExplanation } from '../../shared/StepExplanation';
import { BufferingCompareModal } from './BufferingCompareModal';
import { downloadCsv } from '../../utils/exportCsv';

export const BufferingModule: React.FC = () => {
  const [input, setInput] = useState<BufferingSimulationInput>({
    method: 'double',
    itemCount: 8,
    produceTime: 4,
    consumeTime: 6,
    bufferCapacity: 4
  });

  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Jalankan simulasi murni
  const simulationResult = useMemo(() => {
    return simulateBuffering(input);
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
    <div className="workspace-grid">
      {/* Kolom 1: Parameter */}
      <section className="panel" aria-label="Parameter Buffering">
        <div className="panel-header">
          <span>Parameter Strategi Buffering</span>
        </div>
        <BufferingParamsForm input={input} onInputChange={setInput} />
      </section>

      {/* Kolom 2: Visualisasi Dominan & Timeline */}
      <section className="panel" aria-label="Visualisasi Buffering" style={{ overflowY: 'auto' }}>
        <div className="panel-header">
          <span>Visualisasi Slot Buffer & Timeline</span>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--color-active)' }}>
            Metode: {simulationResult.methodName}
          </span>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Tampilan Status Slot Buffer */}
          <BufferSlotsView
            slots={currentTrace?.slots || []}
            currentTrace={currentTrace}
            method={input.method}
          />

          {/* Timeline Aktivitas Producer dan Consumer */}
          <BufferTimeline
            timeline={simulationResult.timeline}
            currentTime={currentTrace?.currentTime ?? 0}
            totalTime={simulationResult.metrics.totalCompletionTime}
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
      <section className="panel" aria-label="Metrik Buffering">
        <div className="panel-header">
          <span>Metrik Kinerja Buffering</span>
        </div>
        <BufferingMetricsView
          metrics={simulationResult.metrics}
          methodName={simulationResult.methodName}
          onCompareClick={() => setIsCompareOpen(true)}
          onExportCsvClick={handleExportCsv}
        />
      </section>

      {/* Modal Bandingkan */}
      {isCompareOpen && (
        <BufferingCompareModal
          input={input}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
};

export type BufferingMethod = 'unbuffered' | 'single' | 'double' | 'circular';

export type SlotStatus = 'empty' | 'filling' | 'full' | 'emptying';

export interface BufferSlotState {
  index: number;
  status: SlotStatus;
  itemId: number | null;
  progressPercent: number; // 0 - 100%
}

export type WorkerState = 'working' | 'idle' | 'waiting';

export interface BufferingStepTrace {
  stepIndex: number;
  currentTime: number; // Time unit (ms atau tick)
  producerState: WorkerState;
  producerCurrentItem: number | null;
  consumerState: WorkerState;
  consumerCurrentItem: number | null;
  slots: BufferSlotState[];
  completedItemsCount: number;
  explanation: string;
  producerIdleTotal: number;
  consumerIdleTotal: number;
}

export interface BufferingTimelineInterval {
  actor: 'producer' | 'consumer';
  state: 'working' | 'idle';
  startTime: number;
  endTime: number;
  itemId?: number;
}

export interface BufferingSimulationInput {
  method: BufferingMethod;
  itemCount: number;         // Jumlah item data (default 8)
  produceTime: number;       // Waktu produce / transfer ke buffer per item (T, default 4 ms)
  consumeTime: number;       // Waktu consume / pemrosesan CPU per item (C, default 6 ms)
  bufferCapacity?: number;   // Kapasitas slot (khusus circular buffer, default 4)
}

export interface BufferingMetrics {
  totalCompletionTime: number;
  throughput: number;          // item / waktu
  producerIdleTime: number;
  consumerIdleTime: number;
  producerUtilization: number; // %
  consumerUtilization: number; // %
  avgBufferOccupancy: number;  // % slot rata-rata terisi
  speedupFactor: number;       // Relatif terhadap unbuffered
}

export interface BufferingSimulationResult {
  methodName: string;
  traces: BufferingStepTrace[];
  timeline: BufferingTimelineInterval[];
  metrics: BufferingMetrics;
  input: BufferingSimulationInput;
}

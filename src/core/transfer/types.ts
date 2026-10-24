export type TransferMethod = 'programmed_io' | 'interrupt_driven' | 'dma';

export type CpuActivity = 'busy_polling' | 'interrupt_handler' | 'dma_setup' | 'data_copy' | 'free';
export type DeviceActivity = 'busy_transfer' | 'idle';
export type MemoryActivity = 'dma_transfer' | 'cpu_write' | 'idle';

export interface TimingInterval {
  track: 'cpu' | 'device' | 'memory';
  status: 'busy_transfer' | 'polling' | 'interrupt_handler' | 'free' | 'dma_setup' | 'memory_write';
  startTime: number;
  endTime: number;
  label: string;
  blockIndex?: number;
}

export interface TransferStepTrace {
  stepIndex: number;
  currentTime: number;
  cpuStatus: 'busy_polling' | 'interrupt_handler' | 'dma_setup' | 'data_copy' | 'free';
  deviceStatus: 'busy_transfer' | 'idle';
  memoryStatus: 'dma_transfer' | 'cpu_write' | 'idle';
  transferredBlocks: number;
  totalBlocks: number;
  explanation: string;
  cumulativeCpuBusy: number;
  cumulativeInterrupts: number;
}

export interface TransferSimulationInput {
  method: TransferMethod;
  dataSizeKb: number;                // Ukuran total data (misal 64 KB)
  blockSizeKb: number;               // Ukuran per blok (misal 4 KB)
  deviceSpeedMsPerBlock: number;     // Waktu I/O hardware membaca blok (Tdev, misal 6 ms)
  interruptCostMs: number;           // Biaya satu interrupt handler (Tint, misal 2 ms)
  dmaSetupTimeMs: number;            // Waktu setup DMA oleh CPU (Tsetup, misal 3 ms)
  cpuCopyTimePerBlockMs?: number;    // Waktu CPU menyalin blok ke memori (misal 1 ms)
}

export interface TransferMetrics {
  totalTransferTime: number;         // ms
  cpuBusyTime: number;               // ms
  cpuFreeTime: number;               // ms
  cpuUtilization: number;            // %
  interruptCount: number;            // jumlah interrupt yang dipicu
  effectiveThroughput: number;       // KB / ms
  blocksCount: number;
}

export interface TransferSimulationResult {
  methodName: string;
  traces: TransferStepTrace[];
  timeline: TimingInterval[];
  metrics: TransferMetrics;
  input: TransferSimulationInput;
}

export type Direction = 'left' | 'right'; // 'left' = menuju 0 (menurun), 'right' = menuju maxTrack (menaik)

export interface DiskRequest {
  id: string;
  track: number;
}

export interface DiskSimulationInput {
  requests: number[];
  initialHead: number;
  minTrack: number;
  maxTrack: number;
  direction: Direction;
  countJumpReturn: boolean; // Khusus C-SCAN dan C-LOOK
  seekTimePerCylinder?: number; // ms per track, default 0.5 ms
}

export interface DiskStepTrace {
  stepIndex: number;
  headPosition: number;
  previousPosition: number;
  distance: number;
  servedRequestId: string | null;
  servedTrack: number | null;
  isJump: boolean; // Lompatan C-SCAN/C-LOOK tanpa melayani
  explanation: string;
  remainingRequests: number[];
  visitedTracks: number[]; // Riwayat posisi head sejauh ini
}

export interface DiskMetrics {
  totalHeadMovement: number;
  estimatedSeekTime: number; // ms
  avgWaitingTime: number;    // satuan silinder/waktu sampai request dilayani
  maxWaitingTime: number;    // silinder/waktu terlama sebuah request menunggu (indikasi starvation)
  throughput: number;        // request per 1000 silinder atau request/ms
  requestsCount: number;
}

export interface DiskSimulationResult {
  algorithmName: string;
  traces: DiskStepTrace[];
  metrics: DiskMetrics;
  input: DiskSimulationInput;
}

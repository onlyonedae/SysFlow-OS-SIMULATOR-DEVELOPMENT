import type { DiskSimulationInput, DiskSimulationResult, DiskStepTrace, DiskMetrics } from './types';

export function simulateFCFS(input: DiskSimulationInput): DiskSimulationResult {
  const { requests, initialHead, seekTimePerCylinder = 0.5 } = input;
  const traces: DiskStepTrace[] = [];
  
  let currentHead = initialHead;
  let totalMovement = 0;
  const visitedTracks: number[] = [initialHead];
  const remaining = [...requests];
  const waitingTimes: number[] = [];

  // Langkah 0: Posisi Awal
  traces.push({
    stepIndex: 0,
    headPosition: currentHead,
    previousPosition: currentHead,
    distance: 0,
    servedRequestId: null,
    servedTrack: null,
    isJump: false,
    explanation: `Head disk berada di posisi awal track ${currentHead}.`,
    remainingRequests: [...remaining],
    visitedTracks: [...visitedTracks]
  });

  for (let i = 0; i < requests.length; i++) {
    const targetTrack = requests[i];
    const distance = Math.abs(targetTrack - currentHead);
    totalMovement += distance;
    waitingTimes.push(totalMovement);

    const prev = currentHead;
    currentHead = targetTrack;
    visitedTracks.push(currentHead);

    // Hapus satu instance targetTrack dari remaining
    const idx = remaining.indexOf(targetTrack);
    if (idx !== -1) remaining.splice(idx, 1);

    traces.push({
      stepIndex: i + 1,
      headPosition: currentHead,
      previousPosition: prev,
      distance,
      servedRequestId: `req-${i}`,
      servedTrack: targetTrack,
      isJump: false,
      explanation: `FCFS melayani request antrean ke-${i + 1} pada track ${targetTrack} (jarak tempuh ${distance} track).`,
      remainingRequests: [...remaining],
      visitedTracks: [...visitedTracks]
    });
  }

  const seekTime = totalMovement * seekTimePerCylinder;
  const avgWait = waitingTimes.length > 0 
    ? waitingTimes.reduce((a, b) => a + b, 0) / waitingTimes.length 
    : 0;
  const maxWait = waitingTimes.length > 0 ? Math.max(...waitingTimes) : 0;
  const throughput = seekTime > 0 ? (requests.length / seekTime) : 0;

  const metrics: DiskMetrics = {
    totalHeadMovement: totalMovement,
    estimatedSeekTime: seekTime,
    avgWaitingTime: Number(avgWait.toFixed(2)),
    maxWaitingTime: maxWait,
    throughput: Number(throughput.toFixed(4)),
    requestsCount: requests.length
  };

  return {
    algorithmName: 'FCFS (First-Come, First-Served)',
    traces,
    metrics,
    input
  };
}

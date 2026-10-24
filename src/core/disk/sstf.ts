import type { DiskSimulationInput, DiskSimulationResult, DiskStepTrace, DiskMetrics } from './types';

export function simulateSSTF(input: DiskSimulationInput): DiskSimulationResult {
  const { requests, initialHead, seekTimePerCylinder = 0.5 } = input;
  const traces: DiskStepTrace[] = [];
  
  let currentHead = initialHead;
  let totalMovement = 0;
  const visitedTracks: number[] = [initialHead];
  const remaining = [...requests];
  const waitingTimes: number[] = [];

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

  let stepCount = 0;
  while (remaining.length > 0) {
    stepCount++;
    // Cari request dengan jarak terdekat dari posisi head saat ini
    let closestIndex = 0;
    let minDistance = Math.abs(remaining[0] - currentHead);

    for (let i = 1; i < remaining.length; i++) {
      const dist = Math.abs(remaining[i] - currentHead);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    const targetTrack = remaining[closestIndex];
    remaining.splice(closestIndex, 1);

    totalMovement += minDistance;
    waitingTimes.push(totalMovement);

    const prev = currentHead;
    currentHead = targetTrack;
    visitedTracks.push(currentHead);

    traces.push({
      stepIndex: stepCount,
      headPosition: currentHead,
      previousPosition: prev,
      distance: minDistance,
      servedRequestId: `req-${stepCount}`,
      servedTrack: targetTrack,
      isJump: false,
      explanation: `SSTF memilih track ${targetTrack} karena paling dekat dari posisi head (${prev}), jarak tempuh ${minDistance} track.`,
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
    algorithmName: 'SSTF (Shortest Seek Time First)',
    traces,
    metrics,
    input
  };
}

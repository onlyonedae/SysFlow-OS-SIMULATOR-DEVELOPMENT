import type { DiskSimulationInput, DiskSimulationResult, DiskStepTrace, DiskMetrics } from './types';

export function simulateLOOK(input: DiskSimulationInput): DiskSimulationResult {
  const { requests, initialHead, direction, seekTimePerCylinder = 0.5 } = input;
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
    explanation: `Head disk berada di posisi awal track ${currentHead}, arah LOOK: ${direction === 'left' ? 'menurun' : 'menaik'}.`,
    remainingRequests: [...remaining],
    visitedTracks: [...visitedTracks]
  });

  const left = requests.filter(r => r < initialHead).sort((a, b) => b - a); // descending
  const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

  let stepCount = 0;

  if (direction === 'left') {
    // Layani sisi kiri terlebih dahulu sampai request terkecil (tanpa menyentuh track 0)
    for (const track of left) {
      stepCount++;
      const dist = Math.abs(track - currentHead);
      totalMovement += dist;
      waitingTimes.push(totalMovement);

      const prev = currentHead;
      currentHead = track;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(track);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: `req-${stepCount}`,
        servedTrack: track,
        isJump: false,
        explanation: `LOOK melayani track ${track} ke arah menurun (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    // Berbalik arah melayani sisi kanan
    for (const track of right) {
      stepCount++;
      const dist = Math.abs(track - currentHead);
      totalMovement += dist;
      waitingTimes.push(totalMovement);

      const prev = currentHead;
      currentHead = track;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(track);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: `req-${stepCount}`,
        servedTrack: track,
        isJump: false,
        explanation: `LOOK berbalik arah pada request terakhir dan melayani track ${track} (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }
  } else {
    // Arah kanan (menaik)
    for (const track of right) {
      stepCount++;
      const dist = Math.abs(track - currentHead);
      totalMovement += dist;
      waitingTimes.push(totalMovement);

      const prev = currentHead;
      currentHead = track;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(track);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: `req-${stepCount}`,
        servedTrack: track,
        isJump: false,
        explanation: `LOOK melayani track ${track} ke arah menaik (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    for (const track of left) {
      stepCount++;
      const dist = Math.abs(track - currentHead);
      totalMovement += dist;
      waitingTimes.push(totalMovement);

      const prev = currentHead;
      currentHead = track;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(track);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: `req-${stepCount}`,
        servedTrack: track,
        isJump: false,
        explanation: `LOOK berbalik arah pada request terakhir dan melayani track ${track} (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }
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
    algorithmName: 'LOOK',
    traces,
    metrics,
    input
  };
}

export function simulateCLOOK(input: DiskSimulationInput): DiskSimulationResult {
  const { requests, initialHead, direction, countJumpReturn, seekTimePerCylinder = 0.5 } = input;
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
    explanation: `Head disk berada di posisi awal track ${currentHead}, arah C-LOOK: ${direction === 'right' ? 'menaik' : 'menurun'}.`,
    remainingRequests: [...remaining],
    visitedTracks: [...visitedTracks]
  });

  const left = requests.filter(r => r < initialHead).sort((a, b) => a - b); // ascending
  const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

  let stepCount = 0;

  if (direction === 'right') {
    // 1. Layani request >= initialHead secara ascending
    for (const track of right) {
      stepCount++;
      const dist = Math.abs(track - currentHead);
      totalMovement += dist;
      waitingTimes.push(totalMovement);

      const prev = currentHead;
      currentHead = track;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(track);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: `req-${stepCount}`,
        servedTrack: track,
        isJump: false,
        explanation: `C-LOOK melayani track ${track} ke arah menaik (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    // 2. Lompat ke request terendah pada sisi kiri (bukan ke track 0)
    if (left.length > 0) {
      stepCount++;
      const lowestTrack = left[0];
      const jumpDist = Math.abs(currentHead - lowestTrack);
      if (countJumpReturn) {
        totalMovement += jumpDist;
      }

      const prev = currentHead;
      currentHead = lowestTrack;
      visitedTracks.push(currentHead);

      // Sisi kiri belum dilayani saat melompat, tapi langsung dilayani pada posisi target
      const idx = remaining.indexOf(lowestTrack);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: countJumpReturn ? jumpDist : 0,
        servedRequestId: `req-${stepCount}`,
        servedTrack: lowestTrack,
        isJump: true,
        explanation: `C-LOOK melompat langsung ke request terendah track ${lowestTrack} dan melayaninya. ${countJumpReturn ? `Jarak lompat ${jumpDist} dihitung.` : 'Jarak lompat diabaikan dari metrik.'}`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });

      // 3. Layani sisa request sisi kiri
      for (let i = 1; i < left.length; i++) {
        const track = left[i];
        stepCount++;
        const dist = Math.abs(track - currentHead);
        totalMovement += dist;
        waitingTimes.push(totalMovement);

        const prevHead = currentHead;
        currentHead = track;
        visitedTracks.push(currentHead);

        const rIdx = remaining.indexOf(track);
        if (rIdx !== -1) remaining.splice(rIdx, 1);

        traces.push({
          stepIndex: stepCount,
          headPosition: currentHead,
          previousPosition: prevHead,
          distance: dist,
          servedRequestId: `req-${stepCount}`,
          servedTrack: track,
          isJump: false,
          explanation: `C-LOOK melayani track ${track} (jarak ${dist} track).`,
          remainingRequests: [...remaining],
          visitedTracks: [...visitedTracks]
        });
      }
    }
  } else {
    // Arah kiri (menurun)
    const leftDesc = requests.filter(r => r <= initialHead).sort((a, b) => b - a);
    const rightDesc = requests.filter(r => r > initialHead).sort((a, b) => b - a);

    for (const track of leftDesc) {
      stepCount++;
      const dist = Math.abs(track - currentHead);
      totalMovement += dist;
      waitingTimes.push(totalMovement);

      const prev = currentHead;
      currentHead = track;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(track);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: `req-${stepCount}`,
        servedTrack: track,
        isJump: false,
        explanation: `C-LOOK melayani track ${track} ke arah menurun (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    if (rightDesc.length > 0) {
      stepCount++;
      const highestTrack = rightDesc[0];
      const jumpDist = Math.abs(currentHead - highestTrack);
      if (countJumpReturn) {
        totalMovement += jumpDist;
      }

      const prev = currentHead;
      currentHead = highestTrack;
      visitedTracks.push(currentHead);

      const idx = remaining.indexOf(highestTrack);
      if (idx !== -1) remaining.splice(idx, 1);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: countJumpReturn ? jumpDist : 0,
        servedRequestId: `req-${stepCount}`,
        servedTrack: highestTrack,
        isJump: true,
        explanation: `C-LOOK melompat langsung ke request tertinggi track ${highestTrack} dan melayaninya. ${countJumpReturn ? `Jarak lompat ${jumpDist} dihitung.` : 'Jarak lompat diabaikan dari metrik.'}`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });

      for (let i = 1; i < rightDesc.length; i++) {
        const track = rightDesc[i];
        stepCount++;
        const dist = Math.abs(track - currentHead);
        totalMovement += dist;
        waitingTimes.push(totalMovement);

        const prevHead = currentHead;
        currentHead = track;
        visitedTracks.push(currentHead);

        const rIdx = remaining.indexOf(track);
        if (rIdx !== -1) remaining.splice(rIdx, 1);

        traces.push({
          stepIndex: stepCount,
          headPosition: currentHead,
          previousPosition: prevHead,
          distance: dist,
          servedRequestId: `req-${stepCount}`,
          servedTrack: track,
          isJump: false,
          explanation: `C-LOOK melayani track ${track} (jarak ${dist} track).`,
          remainingRequests: [...remaining],
          visitedTracks: [...visitedTracks]
        });
      }
    }
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
    algorithmName: 'C-LOOK',
    traces,
    metrics,
    input
  };
}

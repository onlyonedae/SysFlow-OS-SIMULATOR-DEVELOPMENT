import type { DiskSimulationInput, DiskSimulationResult, DiskStepTrace, DiskMetrics } from './types';

export function simulateSCAN(input: DiskSimulationInput): DiskSimulationResult {
  const { requests, initialHead, minTrack, maxTrack, direction, seekTimePerCylinder = 0.5 } = input;
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
    explanation: `Head disk berada di posisi awal track ${currentHead}, arah awal: ${direction === 'left' ? 'menurun (menuju track 0)' : 'menaik (menuju track akhir)'}.`,
    remainingRequests: [...remaining],
    visitedTracks: [...visitedTracks]
  });

  // Pisahkan request: lebih kecil dan lebih besar dari posisi awal
  const left = requests.filter(r => r < initialHead).sort((a, b) => b - a); // descending
  const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

  let stepCount = 0;

  if (direction === 'left') {
    // Layani ke arah kiri menuju track minTrack (0)
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
        explanation: `SCAN melayani track ${track} ke arah batas bawah (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    // Jika masih ada request di sisi kanan, head harus menyentuh batas minTrack sebelum membalik arah
    if (right.length > 0 && currentHead !== minTrack) {
      stepCount++;
      const dist = Math.abs(minTrack - currentHead);
      totalMovement += dist;

      const prev = currentHead;
      currentHead = minTrack;
      visitedTracks.push(currentHead);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: null,
        servedTrack: null,
        isJump: false,
        explanation: `SCAN mencapai batas bawah silinder (${minTrack}) dan membalikkan arah pergerakan ke atas.`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    // Layani sisa request di sisi kanan
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
        explanation: `SCAN berbalik arah dan melayani track ${track} (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }
  } else {
    // Arah kanan (menaik menuju maxTrack)
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
        explanation: `SCAN melayani track ${track} ke arah batas atas (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    if (left.length > 0 && currentHead !== maxTrack) {
      stepCount++;
      const dist = Math.abs(maxTrack - currentHead);
      totalMovement += dist;

      const prev = currentHead;
      currentHead = maxTrack;
      visitedTracks.push(currentHead);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: null,
        servedTrack: null,
        isJump: false,
        explanation: `SCAN mencapai batas atas silinder (${maxTrack}) dan membalikkan arah pergerakan ke bawah.`,
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
        explanation: `SCAN berbalik arah dan melayani track ${track} (jarak ${dist} track).`,
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
    algorithmName: 'SCAN (Elevator Algorithm)',
    traces,
    metrics,
    input
  };
}

export function simulateCSCAN(input: DiskSimulationInput): DiskSimulationResult {
  const { requests, initialHead, minTrack, maxTrack, direction, countJumpReturn, seekTimePerCylinder = 0.5 } = input;
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
    explanation: `Head disk berada di posisi awal track ${currentHead}, arah C-SCAN: ${direction === 'right' ? 'menaik ke track akhir' : 'menurun ke track 0'}.`,
    remainingRequests: [...remaining],
    visitedTracks: [...visitedTracks]
  });

  const left = requests.filter(r => r < initialHead).sort((a, b) => a - b); // ascending untuk arah kanan
  const right = requests.filter(r => r >= initialHead).sort((a, b) => a - b); // ascending

  let stepCount = 0;

  if (direction === 'right') {
    // 1. Bergerak ke kanan melayani request >= head
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
        explanation: `C-SCAN melayani track ${track} menuju batas atas (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    // 2. Capai ujung maxTrack jika masih ada sisa request di sisi kiri
    if (left.length > 0 && currentHead !== maxTrack) {
      stepCount++;
      const dist = Math.abs(maxTrack - currentHead);
      totalMovement += dist;

      const prev = currentHead;
      currentHead = maxTrack;
      visitedTracks.push(currentHead);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: null,
        servedTrack: null,
        isJump: false,
        explanation: `C-SCAN mencapai batas atas silinder (${maxTrack}).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    // 3. Lompat kembali ke minTrack (0) tanpa melayani request
    if (left.length > 0) {
      stepCount++;
      const jumpDist = Math.abs(maxTrack - minTrack);
      if (countJumpReturn) {
        totalMovement += jumpDist;
      }

      const prev = currentHead;
      currentHead = minTrack;
      visitedTracks.push(currentHead);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: countJumpReturn ? jumpDist : 0,
        servedRequestId: null,
        servedTrack: null,
        isJump: true,
        explanation: `C-SCAN melompat kembali ke batas bawah (${minTrack}) tanpa melayani request. ${countJumpReturn ? `Jarak lompat ${jumpDist} dihitung.` : 'Jarak lompat diabaikan dari metrik.'}`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });

      // 4. Lanjutkan melayani sisa request dari minTrack ke arah kanan
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
          explanation: `C-SCAN melayani track ${track} dari putaran awal (jarak ${dist} track).`,
          remainingRequests: [...remaining],
          visitedTracks: [...visitedTracks]
        });
      }
    }
  } else {
    // Arah kiri (menuju minTrack)
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
        explanation: `C-SCAN melayani track ${track} menuju batas bawah (jarak ${dist} track).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    if (rightDesc.length > 0 && currentHead !== minTrack) {
      stepCount++;
      const dist = Math.abs(minTrack - currentHead);
      totalMovement += dist;

      const prev = currentHead;
      currentHead = minTrack;
      visitedTracks.push(currentHead);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: dist,
        servedRequestId: null,
        servedTrack: null,
        isJump: false,
        explanation: `C-SCAN mencapai batas bawah silinder (${minTrack}).`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });
    }

    if (rightDesc.length > 0) {
      stepCount++;
      const jumpDist = Math.abs(maxTrack - minTrack);
      if (countJumpReturn) {
        totalMovement += jumpDist;
      }

      const prev = currentHead;
      currentHead = maxTrack;
      visitedTracks.push(currentHead);

      traces.push({
        stepIndex: stepCount,
        headPosition: currentHead,
        previousPosition: prev,
        distance: countJumpReturn ? jumpDist : 0,
        servedRequestId: null,
        servedTrack: null,
        isJump: true,
        explanation: `C-SCAN melompat kembali ke batas atas (${maxTrack}) tanpa melayani request. ${countJumpReturn ? `Jarak lompat ${jumpDist} dihitung.` : 'Jarak lompat diabaikan dari metrik.'}`,
        remainingRequests: [...remaining],
        visitedTracks: [...visitedTracks]
      });

      for (const track of rightDesc) {
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
          explanation: `C-SCAN melayani track ${track} setelah lompatan (jarak ${dist} track).`,
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
    algorithmName: 'C-SCAN (Circular SCAN)',
    traces,
    metrics,
    input
  };
}

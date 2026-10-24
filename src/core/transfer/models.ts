import type {
  TransferSimulationInput,
  TransferSimulationResult,
  TransferStepTrace,
  TimingInterval,
  TransferMetrics
} from './types';

export function simulateTransfer(input: TransferSimulationInput): TransferSimulationResult {
  const {
    method,
    dataSizeKb,
    blockSizeKb,
    deviceSpeedMsPerBlock,
    interruptCostMs,
    dmaSetupTimeMs,
    cpuCopyTimePerBlockMs = 1
  } = input;

  const totalBlocks = Math.max(1, Math.ceil(dataSizeKb / blockSizeKb));
  const traces: TransferStepTrace[] = [];
  const timeline: TimingInterval[] = [];

  let curTime = 0;
  let cpuBusyTotal = 0;
  let interruptCount = 0;

  // Langkah 0: Awal
  traces.push({
    stepIndex: 0,
    currentTime: 0,
    cpuStatus: 'free',
    deviceStatus: 'idle',
    memoryStatus: 'idle',
    transferredBlocks: 0,
    totalBlocks,
    explanation: `Memulai simulasi transfer ${dataSizeKb} KB (${totalBlocks} blok @ ${blockSizeKb} KB) menggunakan ${getMethodDisplayName(method)}.`,
    cumulativeCpuBusy: 0,
    cumulativeInterrupts: 0
  });

  if (method === 'programmed_io') {
    // PROGRAMMED I/O (POLLING)
    for (let b = 1; b <= totalBlocks; b++) {
      // 1. Polling Phase
      const pollStart = curTime;
      const pollEnd = curTime + deviceSpeedMsPerBlock;
      cpuBusyTotal += deviceSpeedMsPerBlock;

      timeline.push({ track: 'cpu', status: 'polling', startTime: pollStart, endTime: pollEnd, label: `Polling Blok #${b}`, blockIndex: b });
      timeline.push({ track: 'device', status: 'busy_transfer', startTime: pollStart, endTime: pollEnd, label: `Read Blok #${b}`, blockIndex: b });
      timeline.push({ track: 'memory', status: 'free', startTime: pollStart, endTime: pollEnd, label: 'Idle' });

      curTime = pollEnd;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        cpuStatus: 'busy_polling',
        deviceStatus: 'busy_transfer',
        memoryStatus: 'idle',
        transferredBlocks: b - 1,
        totalBlocks,
        explanation: `Pada t=${curTime} ms: CPU selesai polling blok #${b}. Selama ${deviceSpeedMsPerBlock} ms CPU terkunci dalam busy-wait loop membaca status register perangkat.`,
        cumulativeCpuBusy: cpuBusyTotal,
        cumulativeInterrupts: 0
      });

      // 2. Data Copy Phase (CPU memindahkan data dari controller buffer ke RAM)
      const copyStart = curTime;
      const copyEnd = curTime + cpuCopyTimePerBlockMs;
      cpuBusyTotal += cpuCopyTimePerBlockMs;

      timeline.push({ track: 'cpu', status: 'busy_transfer', startTime: copyStart, endTime: copyEnd, label: `Copy Blok #${b} ke RAM`, blockIndex: b });
      timeline.push({ track: 'device', status: 'free', startTime: copyStart, endTime: copyEnd, label: 'Idle' });
      timeline.push({ track: 'memory', status: 'memory_write', startTime: copyStart, endTime: copyEnd, label: `Write Blok #${b}`, blockIndex: b });

      curTime = copyEnd;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        cpuStatus: 'data_copy',
        deviceStatus: 'idle',
        memoryStatus: 'cpu_write',
        transferredBlocks: b,
        totalBlocks,
        explanation: `Pada t=${curTime} ms: CPU menyalin blok #${b} ke memori utama (durasi ${cpuCopyTimePerBlockMs} ms). Blok selesai: ${b}/${totalBlocks}.`,
        cumulativeCpuBusy: cpuBusyTotal,
        cumulativeInterrupts: 0
      });
    }
  } else if (method === 'interrupt_driven') {
    // INTERRUPT-DRIVEN I/O
    for (let b = 1; b <= totalBlocks; b++) {
      // 1. Device Transfer Phase (CPU BEBAS mengerjakan proses lain!)
      const devStart = curTime;
      const devEnd = curTime + deviceSpeedMsPerBlock;

      timeline.push({ track: 'cpu', status: 'free', startTime: devStart, endTime: devEnd, label: 'CPU Bebas (Tugas Lain)' });
      timeline.push({ track: 'device', status: 'busy_transfer', startTime: devStart, endTime: devEnd, label: `Read Blok #${b}`, blockIndex: b });
      timeline.push({ track: 'memory', status: 'free', startTime: devStart, endTime: devEnd, label: 'Idle' });

      curTime = devEnd;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        cpuStatus: 'free',
        deviceStatus: 'busy_transfer',
        memoryStatus: 'idle',
        transferredBlocks: b - 1,
        totalBlocks,
        explanation: `Pada t=${curTime} ms: Device controller selesai membaca blok #${b}. CPU BEBAS selama ${deviceSpeedMsPerBlock} ms ini. Device sekarang memicu sinyal Interrupt!`,
        cumulativeCpuBusy: cpuBusyTotal,
        cumulativeInterrupts: interruptCount
      });

      // 2. Interrupt Service Routine (ISR) & Copy Phase
      interruptCount++;
      const isrStart = curTime;
      const isrDuration = interruptCostMs + cpuCopyTimePerBlockMs;
      const isrEnd = curTime + isrDuration;
      cpuBusyTotal += isrDuration;

      timeline.push({ track: 'cpu', status: 'interrupt_handler', startTime: isrStart, endTime: isrEnd, label: `ISR Blok #${b}`, blockIndex: b });
      timeline.push({ track: 'device', status: 'free', startTime: isrStart, endTime: isrEnd, label: 'Idle' });
      timeline.push({ track: 'memory', status: 'memory_write', startTime: isrStart, endTime: isrEnd, label: `Write Blok #${b}`, blockIndex: b });

      curTime = isrEnd;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        cpuStatus: 'interrupt_handler',
        deviceStatus: 'idle',
        memoryStatus: 'cpu_write',
        transferredBlocks: b,
        totalBlocks,
        explanation: `Pada t=${curTime} ms: CPU melayani interrupt #${interruptCount} untuk blok #${b} (durasi ${isrDuration} ms). Blok selesai: ${b}/${totalBlocks}.`,
        cumulativeCpuBusy: cpuBusyTotal,
        cumulativeInterrupts: interruptCount
      });
    }
  } else {
    // DIRECT MEMORY ACCESS (DMA)
    // 1. DMA Setup Phase oleh CPU di awal
    const setupStart = curTime;
    const setupEnd = curTime + dmaSetupTimeMs;
    cpuBusyTotal += dmaSetupTimeMs;

    timeline.push({ track: 'cpu', status: 'dma_setup', startTime: setupStart, endTime: setupEnd, label: 'DMA Init Setup' });
    timeline.push({ track: 'device', status: 'free', startTime: setupStart, endTime: setupEnd, label: 'Idle' });
    timeline.push({ track: 'memory', status: 'free', startTime: setupStart, endTime: setupEnd, label: 'Idle' });

    curTime = setupEnd;

    traces.push({
      stepIndex: traces.length,
      currentTime: curTime,
      cpuStatus: 'dma_setup',
      deviceStatus: 'idle',
      memoryStatus: 'idle',
      transferredBlocks: 0,
      totalBlocks,
      explanation: `Pada t=${curTime} ms: CPU mengonfigurasi DMA Controller (alamat memori, register counter, arah transfer) selama ${dmaSetupTimeMs} ms. CPU langsung bebas setelah ini!`,
      cumulativeCpuBusy: cpuBusyTotal,
      cumulativeInterrupts: 0
    });

    // 2. DMA Transfer Autonomous Phase (Per blok ditransfer langsung DMA <-> Memori)
    for (let b = 1; b <= totalBlocks; b++) {
      const bStart = curTime;
      const bEnd = curTime + deviceSpeedMsPerBlock;

      timeline.push({ track: 'cpu', status: 'free', startTime: bStart, endTime: bEnd, label: 'CPU Bebas Komputasi' });
      timeline.push({ track: 'device', status: 'busy_transfer', startTime: bStart, endTime: bEnd, label: `DMA Read #${b}`, blockIndex: b });
      timeline.push({ track: 'memory', status: 'busy_transfer', startTime: bStart, endTime: bEnd, label: `DMA Direct Write #${b}`, blockIndex: b });

      curTime = bEnd;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        cpuStatus: 'free',
        deviceStatus: 'busy_transfer',
        memoryStatus: 'dma_transfer',
        transferredBlocks: b,
        totalBlocks,
        explanation: `Pada t=${curTime} ms: DMA Controller mentransfer blok #${b} langsung ke RAM tanpa keterlibatan CPU (CPU 100% bebas). Progress: ${b}/${totalBlocks} blok.`,
        cumulativeCpuBusy: cpuBusyTotal,
        cumulativeInterrupts: 0
      });
    }

    // 3. Completion Interrupt Phase (Hanya 1 kali di akhir seluruh transfer!)
    interruptCount = 1;
    const intStart = curTime;
    const intEnd = curTime + interruptCostMs;
    cpuBusyTotal += interruptCostMs;

    timeline.push({ track: 'cpu', status: 'interrupt_handler', startTime: intStart, endTime: intEnd, label: 'DMA Done Interrupt' });
    timeline.push({ track: 'device', status: 'free', startTime: intStart, endTime: intEnd, label: 'Idle' });
    timeline.push({ track: 'memory', status: 'free', startTime: intStart, endTime: intEnd, label: 'Idle' });

    curTime = intEnd;

    traces.push({
      stepIndex: traces.length,
      currentTime: curTime,
      cpuStatus: 'interrupt_handler',
      deviceStatus: 'idle',
      memoryStatus: 'idle',
      transferredBlocks: totalBlocks,
      totalBlocks,
      explanation: `Pada t=${curTime} ms: DMA Controller memicu satu interrupt akhir tanda seluruh ${totalBlocks} blok data (${dataSizeKb} KB) selesai ditransfer ke RAM.`,
      cumulativeCpuBusy: cpuBusyTotal,
      cumulativeInterrupts: 1
    });
  }

  const totalTransferTime = curTime;
  const cpuFreeTime = Math.max(0, totalTransferTime - cpuBusyTotal);
  const cpuUtilization = totalTransferTime > 0
    ? Number(((cpuBusyTotal / totalTransferTime) * 100).toFixed(1))
    : 0;

  const effectiveThroughput = totalTransferTime > 0
    ? Number((dataSizeKb / totalTransferTime).toFixed(4))
    : 0;

  const metrics: TransferMetrics = {
    totalTransferTime,
    cpuBusyTime: cpuBusyTotal,
    cpuFreeTime,
    cpuUtilization,
    interruptCount,
    effectiveThroughput,
    blocksCount: totalBlocks
  };

  return {
    methodName: getMethodDisplayName(method),
    traces,
    timeline,
    metrics,
    input
  };
}

function getMethodDisplayName(method: string): string {
  switch (method) {
    case 'programmed_io': return 'Programmed I/O (Polling)';
    case 'interrupt_driven': return 'Interrupt-Driven I/O';
    case 'dma': return 'Direct Memory Access (DMA)';
    default: return method;
  }
}

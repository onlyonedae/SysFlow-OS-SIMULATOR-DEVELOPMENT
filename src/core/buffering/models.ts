import type {
  BufferingSimulationInput,
  BufferingSimulationResult,
  BufferingStepTrace,
  BufferingTimelineInterval,
  BufferingMetrics,
  BufferSlotState
} from './types';

export function simulateBuffering(input: BufferingSimulationInput): BufferingSimulationResult {
  const { method, itemCount, produceTime, consumeTime } = input;
  
  // Kapasitas buffer sistem
  let capacity = 0;
  if (method === 'single') capacity = 1;
  else if (method === 'double') capacity = 2;
  else if (method === 'circular') capacity = input.bufferCapacity ?? 4;

  const traces: BufferingStepTrace[] = [];
  const producerTimeline: BufferingTimelineInterval[] = [];
  const consumerTimeline: BufferingTimelineInterval[] = [];

  const slots: BufferSlotState[] = Array.from({ length: Math.max(capacity, 1) }, (_, i) => ({
    index: i,
    status: 'empty',
    itemId: null,
    progressPercent: 0
  }));

  let time = 0;
  let producerItemIndex = 1;

  let producerBusyUntil = 0;
  let consumerBusyUntil = 0;

  let producerCurrentItem: number | null = null;
  let consumerCurrentItem: number | null = null;

  let producerIdleTotal = 0;
  let consumerIdleTotal = 0;

  // Antrean buffer yang terisi dan siap diambil oleh consumer
  const filledBuffers: { itemId: number; slotIndex: number }[] = [];
  const emptySlots: number[] = Array.from({ length: capacity }, (_, i) => i);
  const occupancySamples: number[] = [];

  // Langkah 0: Awal
  traces.push({
    stepIndex: 0,
    currentTime: 0,
    producerState: 'working',
    producerCurrentItem: 1,
    consumerState: 'idle',
    consumerCurrentItem: null,
    slots: JSON.parse(JSON.stringify(slots)),
    completedItemsCount: 0,
    explanation: `Simulasi dimulai pada t=0 ms. Metode: ${getMethodDisplayName(method)}. Producer mulai memproduksi item 1.`,
    producerIdleTotal: 0,
    consumerIdleTotal: 0
  });

  if (method === 'unbuffered') {
    // UNBUFFERED: Sekuensial murni tanpa tumpang tindih I/O dan CPU
    let curTime = 0;
    for (let i = 1; i <= itemCount; i++) {
      // 1. Producer bekerja
      const pStart = curTime;
      const pEnd = curTime + produceTime;
      producerTimeline.push({ actor: 'producer', state: 'working', startTime: pStart, endTime: pEnd, itemId: i });
      consumerTimeline.push({ actor: 'consumer', state: 'idle', startTime: pStart, endTime: pEnd });
      consumerIdleTotal += produceTime;

      curTime = pEnd;
      slots[0].status = 'full';
      slots[0].itemId = i;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        producerState: 'idle',
        producerCurrentItem: null,
        consumerState: 'working',
        consumerCurrentItem: i,
        slots: JSON.parse(JSON.stringify(slots)),
        completedItemsCount: i - 1,
        explanation: `Pada t=${curTime} ms: Producer selesai mentransfer item ${i}. Tanpa buffer, Producer harus idle menunggu Consumer selesai memproses.`,
        producerIdleTotal,
        consumerIdleTotal
      });

      // 2. Consumer bekerja
      const cStart = curTime;
      const cEnd = curTime + consumeTime;
      consumerTimeline.push({ actor: 'consumer', state: 'working', startTime: cStart, endTime: cEnd, itemId: i });
      producerTimeline.push({ actor: 'producer', state: 'idle', startTime: cStart, endTime: cEnd });
      producerIdleTotal += consumeTime;

      curTime = cEnd;
      slots[0].status = 'empty';
      slots[0].itemId = null;

      traces.push({
        stepIndex: traces.length,
        currentTime: curTime,
        producerState: i < itemCount ? 'working' : 'idle',
        producerCurrentItem: i < itemCount ? i + 1 : null,
        consumerState: 'idle',
        consumerCurrentItem: null,
        slots: JSON.parse(JSON.stringify(slots)),
        completedItemsCount: i,
        explanation: `Pada t=${curTime} ms: Consumer selesai memproses item ${i}. Total selesai: ${i}/${itemCount} item.`,
        producerIdleTotal,
        consumerIdleTotal
      });
    }
    time = curTime;
  } else {
    // BUFFERED (Single, Double, Circular) - Event Driven Discrete Simulation
    let completedCount = 0;
    let producerSlot: number | null = null;

    // Mulai produce item 1 jika ada slot kosong
    if (emptySlots.length > 0 && producerItemIndex <= itemCount) {
      producerSlot = emptySlots.shift()!;
      slots[producerSlot].status = 'filling';
      slots[producerSlot].itemId = producerItemIndex;
      producerCurrentItem = producerItemIndex;
      producerBusyUntil = time + produceTime;
      producerTimeline.push({ actor: 'producer', state: 'working', startTime: time, endTime: producerBusyUntil, itemId: producerItemIndex });
      producerItemIndex++;
    }

    while (completedCount < itemCount) {
      const events: number[] = [];
      if (producerBusyUntil > time) events.push(producerBusyUntil);
      if (consumerBusyUntil > time) events.push(consumerBusyUntil);

      if (events.length === 0) break;

      const nextTime = Math.min(...events);
      const timeDelta = nextTime - time;

      // Hitung keterisian buffer
      const filledCount = slots.filter(s => s.status === 'full' || s.status === 'filling').length;
      occupancySamples.push(filledCount / capacity);

      time = nextTime;

      // 1. Event: Consumer selesai memproses item di user space
      if (consumerBusyUntil === time && consumerCurrentItem !== null) {
        completedCount++;
        const prevItem = consumerCurrentItem;
        consumerCurrentItem = null;

        traces.push({
          stepIndex: traces.length,
          currentTime: time,
          producerState: producerBusyUntil > time ? 'working' : 'idle',
          producerCurrentItem,
          consumerState: 'idle',
          consumerCurrentItem: null,
          slots: JSON.parse(JSON.stringify(slots)),
          completedItemsCount: completedCount,
          explanation: `Pada t=${time} ms: Consumer selesai memproses item ${prevItem}. Total selesai: ${completedCount}/${itemCount}.`,
          producerIdleTotal,
          consumerIdleTotal
        });
      }

      // 2. Event: Producer selesai mengisi buffer slot
      if (producerBusyUntil === time && producerCurrentItem !== null) {
        const slotIdx = producerSlot!;
        slots[slotIdx].status = 'full';
        filledBuffers.push({ itemId: producerCurrentItem, slotIndex: slotIdx });

        traces.push({
          stepIndex: traces.length,
          currentTime: time,
          producerState: 'idle',
          producerCurrentItem: null,
          consumerState: consumerBusyUntil > time ? 'working' : 'idle',
          consumerCurrentItem,
          slots: JSON.parse(JSON.stringify(slots)),
          completedItemsCount: completedCount,
          explanation: `Pada t=${time} ms: Producer selesai mengisi slot ${slotIdx + 1} dengan item ${producerCurrentItem}. Slot sekarang PENUH.`,
          producerIdleTotal,
          consumerIdleTotal
        });

        producerSlot = null;
        producerCurrentItem = null;
      }

      // 3. Jika Consumer menganggur dan ada buffer terisi:
      // OS memindahkan data ke ruang proses user (slot buffer kembali KOSONG untuk producer berikutnya)
      if (consumerCurrentItem === null && filledBuffers.length > 0) {
        const buf = filledBuffers.shift()!;
        consumerCurrentItem = buf.itemId;
        consumerBusyUntil = time + consumeTime;
        consumerTimeline.push({ actor: 'consumer', state: 'working', startTime: time, endTime: consumerBusyUntil, itemId: consumerCurrentItem });

        // Slot buffer sistem langsung bebas untuk diisi kembali oleh producer
        slots[buf.slotIndex].status = 'empty';
        slots[buf.slotIndex].itemId = null;
        emptySlots.push(buf.slotIndex);

        traces.push({
          stepIndex: traces.length,
          currentTime: time,
          producerState: producerBusyUntil > time ? 'working' : 'idle',
          producerCurrentItem,
          consumerState: 'working',
          consumerCurrentItem,
          slots: JSON.parse(JSON.stringify(slots)),
          completedItemsCount: completedCount,
          explanation: `Pada t=${time} ms: Consumer mengambil item ${consumerCurrentItem} dari slot ${buf.slotIndex + 1}. Slot sistem bebas kembali, Consumer mulai komputasi (${consumeTime} ms).`,
          producerIdleTotal,
          consumerIdleTotal
        });
      }

      // 4. Jika Producer menganggur dan masih ada item yang perlu diproduksi:
      if (producerCurrentItem === null && producerItemIndex <= itemCount) {
        if (emptySlots.length > 0) {
          producerSlot = emptySlots.shift()!;
          producerCurrentItem = producerItemIndex;
          slots[producerSlot].status = 'filling';
          slots[producerSlot].itemId = producerCurrentItem;
          producerBusyUntil = time + produceTime;
          producerTimeline.push({ actor: 'producer', state: 'working', startTime: time, endTime: producerBusyUntil, itemId: producerCurrentItem });
          producerItemIndex++;
        } else {
          // Buffer penuh, producer idle menunggu consumer mengambil data
          producerTimeline.push({ actor: 'producer', state: 'idle', startTime: time, endTime: time + timeDelta });
          producerIdleTotal += timeDelta;
        }
      }

      // Catat consumer idle jika tidak ada item yang siap dikonsumsi
      if (consumerCurrentItem === null && completedCount < itemCount && filledBuffers.length === 0) {
        consumerTimeline.push({ actor: 'consumer', state: 'idle', startTime: time, endTime: time + timeDelta });
        consumerIdleTotal += timeDelta;
      }
    }
  }

  const totalCompletionTime = time;
  const throughput = totalCompletionTime > 0 ? (itemCount / totalCompletionTime) : 0;
  
  const unbufferedRefTime = itemCount * (produceTime + consumeTime);
  const speedupFactor = totalCompletionTime > 0 ? Number((unbufferedRefTime / totalCompletionTime).toFixed(2)) : 1;

  const producerUtilization = totalCompletionTime > 0
    ? Number((((totalCompletionTime - producerIdleTotal) / totalCompletionTime) * 100).toFixed(1))
    : 0;

  const consumerUtilization = totalCompletionTime > 0
    ? Number((((totalCompletionTime - consumerIdleTotal) / totalCompletionTime) * 100).toFixed(1))
    : 0;

  const avgBufferOccupancy = occupancySamples.length > 0
    ? Number(((occupancySamples.reduce((a, b) => a + b, 0) / occupancySamples.length) * 100).toFixed(1))
    : 0;

  // Gabungkan interval timeline berurutan
  const consolidatedTimeline: BufferingTimelineInterval[] = [];
  const mergeIntervals = (list: BufferingTimelineInterval[]) => {
    if (list.length === 0) return;
    let cur = { ...list[0] };
    for (let i = 1; i < list.length; i++) {
      const next = list[i];
      if (next.state === cur.state && next.actor === cur.actor && next.itemId === cur.itemId && next.startTime === cur.endTime) {
        cur.endTime = next.endTime;
      } else {
        consolidatedTimeline.push(cur);
        cur = { ...next };
      }
    }
    consolidatedTimeline.push(cur);
  };

  mergeIntervals(producerTimeline);
  mergeIntervals(consumerTimeline);

  const metrics: BufferingMetrics = {
    totalCompletionTime,
    throughput: Number(throughput.toFixed(4)),
    producerIdleTime: producerIdleTotal,
    consumerIdleTime: consumerIdleTotal,
    producerUtilization,
    consumerUtilization,
    avgBufferOccupancy,
    speedupFactor
  };

  return {
    methodName: getMethodDisplayName(method),
    traces,
    timeline: consolidatedTimeline,
    metrics,
    input
  };
}

function getMethodDisplayName(method: string): string {
  switch (method) {
    case 'unbuffered': return 'Tanpa Buffer (Unbuffered)';
    case 'single': return 'Single Buffer (Buffer Tunggal)';
    case 'double': return 'Double Buffer (Buffer Ganda)';
    case 'circular': return 'Circular Buffer (Buffer Melingkar)';
    default: return method;
  }
}

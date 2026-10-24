import React from 'react';
import type { TransferStepTrace, TransferMethod } from '../../core/transfer';

export interface TransferHardwareViewProps {
  currentTrace: TransferStepTrace | undefined;
  method: TransferMethod;
  dataSizeKb: number;
}

export const TransferHardwareView: React.FC<TransferHardwareViewProps> = ({
  currentTrace,
  method,
  dataSizeKb
}) => {
  const cpuStatus = currentTrace?.cpuStatus || 'free';
  const devStatus = currentTrace?.deviceStatus || 'idle';
  const memStatus = currentTrace?.memoryStatus || 'idle';
  const progress = currentTrace ? Math.round((currentTrace.transferredBlocks / Math.max(currentTrace.totalBlocks, 1)) * 100) : 0;

  return (
    <div className="hardware-chassis">
      <div className="hardware-chassis-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot active"></span>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
            TOPOLOGI ARSITEKTUR BUS & PENGENDALI I/O
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--color-chassis-muted)' }}>
            WAKTU: <strong style={{ color: 'var(--color-active-bright)' }}>{currentTrace?.currentTime ?? 0} ms</strong>
          </span>
          <span style={{ color: 'var(--color-chassis-muted)' }}>
            INTERRUPT: <strong style={{ color: 'var(--color-waiting-bright)' }}>{currentTrace?.cumulativeInterrupts ?? 0}</strong>
          </span>
          <span style={{ color: 'var(--color-chassis-muted)' }}>
            PROGRESS: <strong style={{ color: 'var(--color-served-bright)' }}>{progress}% ({currentTrace?.transferredBlocks ?? 0}/{currentTrace?.totalBlocks ?? 0} blok)</strong>
          </span>
        </div>
      </div>

      <div style={{ padding: '16px', backgroundColor: 'var(--color-chassis-inner)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '12px',
          alignItems: 'stretch'
        }}>
          {/* Node 1: CPU */}
          <div style={{
            backgroundColor: 'var(--color-chassis-node)',
            border: `1.5px solid ${cpuStatus === 'busy_polling' ? 'var(--color-idle-bright)' : (cpuStatus === 'interrupt_handler' ? 'var(--color-waiting-bright)' : (cpuStatus === 'free' ? 'var(--color-served-bright)' : 'var(--color-active-bright)'))}`,
            borderRadius: 'var(--border-radius)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-chassis-muted)' }}>
              PROCESSOR (CPU)
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: cpuStatus === 'busy_polling' ? 'var(--color-idle-bright)' : (cpuStatus === 'interrupt_handler' ? 'var(--color-waiting-bright)' : (cpuStatus === 'free' ? 'var(--color-served-bright)' : 'var(--color-active-bright)'))
            }}>
              {cpuStatus === 'busy_polling' ? 'BUSY POLLING' : (cpuStatus === 'interrupt_handler' ? 'EXEC ISR' : (cpuStatus === 'dma_setup' ? 'DMA SETUP' : (cpuStatus === 'data_copy' ? 'COPY DATA' : 'BEBAS (USER TASK)')))}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted-2)' }}>
              {cpuStatus === 'free' ? '✓ Produktif untuk komputasi lain' : '▲ Terkunci operasi I/O'}
            </div>
          </div>

          {/* Node 2: System Bus / DMA Controller */}
          <div style={{
            backgroundColor: 'var(--color-chassis-node)',
            border: '1.5px solid var(--color-chassis-border)',
            borderRadius: 'var(--border-radius)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-chassis-muted)' }}>
              {method === 'dma' ? 'DMA CONTROLLER' : 'SYSTEM BUS'}
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: method === 'dma' ? 'var(--color-active-bright)' : 'var(--color-chassis-text)'
            }}>
              {method === 'dma' ? (memStatus === 'dma_transfer' ? 'BUS MASTER AKTIF' : 'STANDBY') : 'SHARED BUS'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted-2)' }}>
              {method === 'dma' ? 'Bypass CPU langsung ke RAM' : 'CPU mengontrol transfer'}
            </div>
          </div>

          {/* Node 3: Device Controller */}
          <div style={{
            backgroundColor: 'var(--color-chassis-node)',
            border: `1.5px solid ${devStatus === 'busy_transfer' ? 'var(--color-active-bright)' : 'var(--color-chassis-border)'}`,
            borderRadius: 'var(--border-radius)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-chassis-muted)' }}>
              DEVICE CONTROLLER (DISK)
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: devStatus === 'busy_transfer' ? 'var(--color-active-bright)' : 'var(--color-chassis-muted)'
            }}>
              {devStatus === 'busy_transfer' ? 'READING HARDWARE' : 'IDLE'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted-2)' }}>
              Buffer register transfer
            </div>
          </div>

          {/* Node 4: Main Memory (RAM) */}
          <div style={{
            backgroundColor: 'var(--color-chassis-node)',
            border: `1.5px solid ${memStatus !== 'idle' ? 'var(--color-served-bright)' : 'var(--color-chassis-border)'}`,
            borderRadius: 'var(--border-radius)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-chassis-muted)' }}>
              MAIN MEMORY (RAM)
            </div>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: memStatus !== 'idle' ? 'var(--color-served-bright)' : 'var(--color-chassis-muted)'
            }}>
              {memStatus !== 'idle' ? 'DATA BUFFER WRITTEN' : 'READY'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-chassis-muted-2)' }}>
              Kapasitas: {dataSizeKb} KB total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

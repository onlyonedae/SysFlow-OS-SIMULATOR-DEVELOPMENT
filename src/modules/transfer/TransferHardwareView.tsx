import React from 'react';
import type { TransferStepTrace, TransferMethod } from '../../core/transfer';

export interface TransferHardwareViewProps {
  currentTrace: TransferStepTrace | undefined;
  method: TransferMethod;
  dataSizeKb: number;
}

export const TransferHardwareView: React.FC<TransferHardwareViewProps> = ({
  currentTrace
}) => {
  const cpuStatus = currentTrace?.cpuStatus || 'free';
  const devStatus = currentTrace?.deviceStatus || 'idle';
  const memStatus = currentTrace?.memoryStatus || 'idle';

  const isCpuActive = cpuStatus !== 'free';
  const isDevActive = devStatus === 'busy_transfer';
  const isMemActive = memStatus !== 'idle';

  const getCpuTaskLabel = () => {
    switch (cpuStatus) {
      case 'busy_polling':
        return 'busy polling';
      case 'interrupt_handler':
        return `ISR blok #${currentTrace?.transferredBlocks ?? 1}`;
      case 'dma_setup':
        return 'setup DMA';
      case 'data_copy':
        return 'salin memori';
      case 'free':
      default:
        return 'bebas';
    }
  };

  const getMemTaskLabel = () => {
    switch (memStatus) {
      case 'dma_transfer':
        return 'DMA transfer';
      case 'cpu_write':
        return `tulis blok #${currentTrace?.transferredBlocks ?? 1}`;
      case 'idle':
      default:
        return 'idle';
    }
  };

  const getDevTaskLabel = () => {
    return isDevActive ? 'baca blok' : 'idle';
  };

  return (
    <div className="bus-topology-section">
      <div className="bus-topology-header">
        <span className="bus-topology-title">Arsitektur bus</span>
        <span className="mono" style={{ fontSize: '12px', color: 'var(--color-ink3)' }}>
          t = {currentTrace?.currentTime ?? 0} ms
        </span>
      </div>

      <div className="bus-diagram-wrapper">
        <div className="bus-nodes-row">
          {/* Node CPU */}
          <div className={`bus-node-box ${isCpuActive ? 'active' : ''}`}>
            <span className="bus-node-name">CPU</span>
            <span className="bus-node-task">{getCpuTaskLabel()}</span>
          </div>

          {/* Node Memori */}
          <div className={`bus-node-box ${isMemActive ? 'active' : ''}`}>
            <span className="bus-node-name">Memori</span>
            <span className="bus-node-task">{getMemTaskLabel()}</span>
          </div>

          {/* Node Device Controller */}
          <div className={`bus-node-box ${isDevActive ? 'active' : ''}`}>
            <span className="bus-node-name">Device controller</span>
            <span className="bus-node-task">{getDevTaskLabel()}</span>
          </div>
        </div>

        {/* Garis Bus Sistem */}
        <div className="bus-line-horizontal" />
        <span className="bus-line-label">bus sistem</span>
      </div>
    </div>
  );
};

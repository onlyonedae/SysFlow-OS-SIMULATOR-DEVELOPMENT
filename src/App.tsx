import React, { useState } from 'react';
import { DiskModule } from './modules/disk/DiskModule';
import { BufferingModule } from './modules/buffering/BufferingModule';
import { TransferModule } from './modules/transfer/TransferModule';
import { FormulasView } from './modules/formulas/FormulasView';
import { DiskCompareModal } from './modules/disk/DiskCompareModal';
import type { DiskSimulationInput, DiskSimulationResult } from './core/disk';
import { downloadCsv } from './utils/exportCsv';

type ActiveTab = 'disk' | 'buffering' | 'transfer' | 'formulas';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('disk');
  const [diskCompareInput, setDiskCompareInput] = useState<DiskSimulationInput | null>(null);

  const handleExportDiskCsv = (results: DiskSimulationResult[]) => {
    const headers = [
      'Metode',
      'Total Head Movement (silinder)',
      'Estimasi Seek Time (ms)',
      'Rata-rata Waktu Tunggu (silinder)',
      'Maksimum Waktu Tunggu (silinder)',
      'Throughput (req/ms)'
    ];

    const rows = results.map((r) => [
      r.algorithmName,
      r.metrics.totalHeadMovement,
      r.metrics.estimatedSeekTime.toFixed(1),
      r.metrics.avgWaitingTime.toFixed(2),
      r.metrics.maxWaitingTime,
      r.metrics.throughput.toFixed(4)
    ]);

    downloadCsv(`sysflow-disk-metrics-${Date.now()}.csv`, headers, rows);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Aplikasi Tool */}
      <header className="app-header">
        <div className="brand-section">
          <span className="brand-name">
            SysFlow
          </span>
          <span className="brand-badge">Simulator I/O Sistem Operasi</span>
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>SIMULATOR SIAP</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Navigasi Modul Simulasi">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'disk' ? 'active' : ''}`}
            onClick={() => setActiveTab('disk')}
          >
            Penjadwalan Disk
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'buffering' ? 'active' : ''}`}
            onClick={() => setActiveTab('buffering')}
          >
            Strategi Buffering
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'transfer' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            Transfer Data
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'formulas' ? 'active' : ''}`}
            onClick={() => setActiveTab('formulas')}
          >
            Rumus & Asumsi
          </button>
        </nav>
      </header>

      {/* Konten Utama */}
      <main style={{ flex: 1 }}>
        {activeTab === 'disk' && (
          <DiskModule
            onOpenCompare={(input) => setDiskCompareInput(input)}
            onExportCsv={handleExportDiskCsv}
          />
        )}
        {activeTab === 'buffering' && <BufferingModule />}
        {activeTab === 'transfer' && <TransferModule />}
        {activeTab === 'formulas' && <FormulasView />}
      </main>

      {/* Modal Bandingkan Modul Disk */}
      {diskCompareInput && (
        <DiskCompareModal
          input={diskCompareInput}
          onClose={() => setDiskCompareInput(null)}
        />
      )}
    </div>
  );
};

export default App;

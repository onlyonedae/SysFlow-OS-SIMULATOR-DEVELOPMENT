import React, { useState, useEffect } from 'react';
import { DiskModule } from './modules/disk/DiskModule';
import { BufferingModule } from './modules/buffering/BufferingModule';
import { TransferModule } from './modules/transfer/TransferModule';
import { FormulasView } from './modules/formulas/FormulasView';
import { DiskCompareModal } from './modules/disk/DiskCompareModal';
import type { DiskSimulationInput, DiskSimulationResult } from './core/disk';
import { downloadCsv } from './utils/exportCsv';

type ActiveTab = 'disk' | 'buffering' | 'transfer' | 'formulas';
type Theme = 'dark' | 'light';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('disk');
  const [diskCompareInput, setDiskCompareInput] = useState<DiskSimulationInput | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    // Baca preferensi tersimpan, default dark
    return (localStorage.getItem('sysflow-theme') as Theme) ?? 'dark';
  });

  // Terapkan data-theme ke <html> setiap kali tema berubah
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'dark' ? '#0d1117' : '#f1f5f9';
    localStorage.setItem('sysflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', transition: 'background-color var(--transition-normal)' }}>

      {/* ─── Header ─── */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="#2dd4bf" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.5" />
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.5" />
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.8" />
            </svg>
          </div>
          <span className="brand-name">SysFlow</span>
          <span className="brand-badge">LAB / I/O</span>
          <div className="status-indicator">
            <span className="status-dot active" />
            <span>SIMULATOR SIAP</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Navigasi Modul Simulasi">
          <button type="button" id="tab-disk" className={`nav-tab ${activeTab === 'disk' ? 'active' : ''}`} onClick={() => setActiveTab('disk')}>
            Penjadwalan Disk
          </button>
          <button type="button" id="tab-buffering" className={`nav-tab ${activeTab === 'buffering' ? 'active' : ''}`} onClick={() => setActiveTab('buffering')}>
            Buffering
          </button>
          <button type="button" id="tab-transfer" className={`nav-tab ${activeTab === 'transfer' ? 'active' : ''}`} onClick={() => setActiveTab('transfer')}>
            Transfer Data
          </button>
          <button type="button" id="tab-formulas" className={`nav-tab ${activeTab === 'formulas' ? 'active' : ''}`} onClick={() => setActiveTab('formulas')}>
            Rumus &amp; Asumsi
          </button>
        </nav>

        <div className="header-actions">
          {/* ─── Theme Toggle ─── */}
          <button
            type="button"
            id="theme-toggle-btn"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          >
            {theme === 'dark' ? (
              /* Sun icon — switch to light */
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Terang
              </>
            ) : (
              /* Moon icon — switch to dark */
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                Gelap
              </>
            )}
          </button>
        </div>
      </header>

      {/* ─── Konten Utama ─── */}
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

      {/* ─── Footer ─── */}
      <footer className="app-footer">
        <span>Model deterministik • Semua request tiba pada t = 0 • Tanpa latensi rotasi dan transfer</span>
        <span>SYSFLOW / 1.8</span>
      </footer>

      {/* ─── Modal Bandingkan Disk ─── */}
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

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

  // Terapkan data-theme dan color-scheme ke <html> setiap kali tema berubah
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('sysflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const handleExportDiskCsv = (results: DiskSimulationResult[]) => {
    const headers = [
      'Metode',
      'Total Head Movement (silinder)',
      'Estimasi Seek Time (ms)',
      'Rata-rata Waktu Tunggu (ms)',
      'Maksimum Waktu Tunggu (ms)',
      'Throughput (req/ms)'
    ];
    const rows = results.map((r) => [
      r.algorithmName,
      r.metrics.totalHeadMovement,
      r.metrics.estimatedSeekTime.toFixed(1),
      r.metrics.avgWaitingTime.toFixed(2),
      r.metrics.maxWaitingTime.toFixed(2),
      r.metrics.throughput.toFixed(4)
    ]);
    downloadCsv(`sysflow-disk-metrics-${Date.now()}.csv`, headers, rows);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', transition: 'background-color var(--transition-normal)' }}>

      {/* ─── Header Sesuai Figma ─── */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="1.5" width="15" height="15" stroke="var(--color-ink)" strokeWidth="1.5" rx="1.5" />
              <line x1="3" y1="15" x2="15" y2="3" stroke="var(--color-ink)" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="brand-name">SysFlow</span>
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
          {/* ─── Theme Toggle Sesuai Figma ─── */}
          <button
            type="button"
            id="theme-toggle-btn"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          >
            {theme === 'dark' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                <span>Terang</span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>⌵</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span>Gelap</span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>⌵</span>
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

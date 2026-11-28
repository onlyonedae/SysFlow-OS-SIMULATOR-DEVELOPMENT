import React, { useState } from 'react';

type SectionId = 'disk' | 'buffering' | 'transfer' | 'assumptions' | 'team';

export const FormulasView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('disk');

  const navItems: { id: SectionId; label: string }[] = [
    { id: 'disk', label: '1. Penjadwalan disk' },
    { id: 'buffering', label: '2. Strategi buffering' },
    { id: 'transfer', label: '3. Transfer data' },
    { id: 'assumptions', label: '4. Asumsi & batasan' },
    { id: 'team', label: 'Tim & pembagian kerja' }
  ];

  return (
    <div className="instrument-shell">
      {/* ─── Header Halaman Sesuai Figma ─── */}
      <header className="instrument-page-header">
        <div>
          <h1 className="instrument-page-title">Rumus &amp; Asumsi</h1>
          <div className="instrument-page-subtitle">
            Model waktu dan perhitungan yang dipakai SysFlow.
          </div>
        </div>
        <div className="instrument-header-meta">
          <div>3 modul · 12 rumus</div>
          <div>pertanggungjawaban matematis UAS</div>
        </div>
      </header>

      {/* ─── Layout Permukaan Membaca (Reading Surface Sesuai Figma 07-formulas.png) ─── */}
      <div className="formulas-reading-shell">
        {/* Kolom Kiri: Navigasi Modul (~240px) */}
        <aside className="formulas-nav-col">
          <span className="formulas-nav-title">MODUL</span>
          <div className="formulas-nav-list">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`formulas-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="formulas-nav-note">
            Halaman ini adalah rujukan nilai yang dipakai tabel evaluasi. Angka pada tabel dihitung dari rumus di sini.
          </div>
        </aside>

        {/* Kolom Kanan: Konten Pembacaan Utama */}
        <main className="formulas-content-col">
          {/* Section 1: Penjadwalan Disk */}
          {(activeSection === 'disk' || activeSection === 'assumptions') && (
            <section className="formula-section-block">
              <h2 className="formula-section-title">1. Penjadwalan disk</h2>
              <p className="formula-section-p">
                Total pergerakan head adalah jumlah jarak absolut antar posisi silinder yang dikunjungi, dari head awal sampai request terakhir.
              </p>
              <div className="formula-callout-box">
                <div>Total gerak = Σ |T[i] − T[i−1]|   untuk i = 1 … N</div>
                <div>Seek (ms)   = total gerak × 0,5 ms/track</div>
              </div>
              <p className="formula-section-p">
                Waktu tunggu sebuah request adalah jarak kumulatif sejak t=0 sampai head tiba di request itu. Rata-rata dan maksimum dilaporkan terpisah karena keduanya menjawab pertanyaan berbeda: efisiensi dan keadilan.
              </p>
              <div className="formula-callout-box">
                <div>Tunggu[k]   = jarak kumulatif saat request k dilayani</div>
                <div>Rata-rata   = Σ tunggu / N</div>
                <div>Maksimum    = max(tunggu)</div>
              </div>
              <p className="formula-section-p">
                Untuk C-SCAN dan C-LOOK, lompatan balik dari ujung ke awal dihitung sebagai jarak penuh 0–199 kecuali opsi dimatikan. Opsi ini mengubah total gerak, jadi selalu sebutkan pilihannya saat membandingkan.
              </p>
            </section>
          )}

          {/* Section 2: Strategi Buffering */}
          {(activeSection === 'buffering' || activeSection === 'assumptions') && (
            <section className="formula-section-block">
              <h2 className="formula-section-title">2. Strategi buffering</h2>
              <p className="formula-section-p">
                T = waktu mengisi satu blok ke buffer, C = waktu CPU memproses satu blok, M = jumlah item.
              </p>
              <div className="formula-callout-box">
                <div>Tanpa buffer   : T_total = M × (T + C)</div>
                <div>Single buffer  : T_total ≈ T + (M − 1) × max(C, T) + C</div>
                <div>Throughput     : M / T_total</div>
                <div>Speedup        : T_total(tanpa) / T_total(buffer)</div>
              </div>
              <p className="formula-section-p">
                Double buffer memakai dua slot bergantian sehingga producer dapat mengisi slot B saat CPU memproses slot A. Circular buffer memperluas pola itu ke N slot antrean melingkar FIFO.
              </p>
            </section>
          )}

          {/* Section 3: Transfer Data */}
          {(activeSection === 'transfer' || activeSection === 'assumptions') && (
            <section className="formula-section-block">
              <h2 className="formula-section-title">3. Transfer data</h2>
              <p className="formula-section-p">
                B = jumlah blok = ⌈ukuran data / ukuran blok⌉. Setiap metode memakai asumsi CPU yang berbeda, dan itulah inti perbandingannya: waktu total bukan satu-satunya ukuran.
              </p>
              <div className="formula-callout-box">
                <div>Programmed : T_total = B × (T_dev + T_copy)          → CPU 100%</div>
                <div>Interrupt  : T_total = B × (T_dev + T_int + T_copy)  → CPU = B × (T_int + T_copy)</div>
                <div>DMA        : T_total = T_setup + B × T_dev + T_int   → CPU = T_setup + T_int</div>
              </div>
              <p className="formula-section-p">
                DMA lebih cepat pada contoh bawaan (85 ms vs 96 ms pada Programmed I/O dan 128 ms pada Interrupt-Driven) sekaligus hanya memakai 5 ms waktu CPU. Programmed I/O mengunci 100% siklus CPU untuk menunggu perangkat melalui polling.
              </p>
            </section>
          )}

          {/* Section 4: Asumsi & Batasan */}
          {activeSection === 'assumptions' && (
            <section className="formula-section-block">
              <h2 className="formula-section-title">4. Asumsi &amp; batasan</h2>
              <p className="formula-section-p">
                Angka pada simulator ini hanya sah untuk model di bawah. Setiap batasan mengubah hasil, jadi sebutkan saat membandingkan hasil presentasi.
              </p>
              <table className="assumption-table">
                <tbody>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Kedatangan</td>
                    <td className="assumption-cell-desc">
                      Semua request tiba pada t=0. Tidak ada request baru selama simulasi — karena itu starvation tidak dapat muncul dan tidak diklaim.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Rotasi</td>
                    <td className="assumption-cell-desc">
                      Latensi rotasi dan waktu transfer per sektor diabaikan. Gerak head murni seek silinder linier.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Seek</td>
                    <td className="assumption-cell-desc">
                      Linear 0,5 ms per track, tanpa model kurva percepatan atau deselerasi mekanik.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Buffer</td>
                    <td className="assumption-cell-desc">
                      Waktu produksi dan konsumsi konstan; tidak ada waktu setup atau interupsi sistem tambahan.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Metrik</td>
                    <td className="assumption-cell-desc">
                      Rata-rata dan maksimum dilaporkan terpisah; throughput = N ÷ total waktu eksekusi.
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

                    {/* Section 5: Tim & Pembagian Kerja */}
          {activeSection === 'team' && (
            <section className="formula-section-block">
              <h2 className="formula-section-title">Tim &amp; Pembagian Kerja</h2>
              <p className="formula-section-p">
                Proyek Rekayasa Perangkat Lunak Simulator Sistem Operasi (SysFlow) untuk Ujian Akhir Semester (UAS) mata kuliah Sistem Operasi — Program Studi Informatika, Universitas Siliwangi (2026).
              </p>
              <table className="assumption-table">
                <tbody>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Anggota 1</td>
                    <td className="assumption-cell-desc">
                      <strong>Febriana Nugraha</strong> (NPM: 257006111129) — GitHub: <strong>onlyonedae</strong><br />
                      Core Engine Developer (Disk Scheduling) — Perancangan model matematika &amp; logika murni 6 algoritma disk (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK), sanitasi input, dan unit testing Silberschatz.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Anggota 2</td>
                    <td className="assumption-cell-desc">
                      <strong>Muhamad Alfian Holidi</strong> (NPM: 257006111136) — GitHub: <strong>Mhyre</strong><br />
                      Lead Front-End UI/UX, Systems Integrator &amp; Laporan — Pengembangan UI panel instrumen (React 19 / CSS Tokens), visualisasi piringan &amp; buffer, integrasi antar-modul, halaman rumus, dan ekspor CSV.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Anggota 3</td>
                    <td className="assumption-cell-desc">
                      <strong>Nadhif Ali Zuhdi</strong> (NPM: 257006111155) — GitHub: <strong>nanakimi75</strong><br />
                      Core Engine Developer (I/O Buffering Strategy) — Perancangan model producer-consumer &amp; antrean slot (Unbuffered, Single, Double, Circular), kalkulasi speedup &amp; idle time, dan unit testing.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Anggota 4</td>
                    <td className="assumption-cell-desc">
                      <strong>Diva Hendra</strong> (NPM: 257006111182) — GitHub: <strong>divahendraramadhan</strong><br />
                      Core Engine Developer (Hardware Data Transfer) — Implementasi simulasi transfer data bus (Programmed I/O, Interrupt-Driven, DMA), kalkulasi siklus CPU vs controller, overhead ISR, dan unit testing.
                    </td>
                  </tr>
                  <tr className="assumption-row">
                    <td className="assumption-cell-name">Teknologi</td>
                    <td className="assumption-cell-desc">
                      React 19, TypeScript, Vite, Vitest, CSS Tokens murni tanpa ketergantungan library UI pihak ketiga.
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>

      {/* ─── Footer Halaman Sesuai Figma ─── */}
      <footer className="instrument-footer">
        <span>Semua nilai pada halaman modul dihitung ulang setiap input berubah; tidak ada angka yang ditulis tangan.</span>
        <span className="mono">SYSFLOW 1.9</span>
      </footer>
    </div>
  );
};

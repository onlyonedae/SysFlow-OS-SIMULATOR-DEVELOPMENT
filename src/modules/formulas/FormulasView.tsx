import React, { useState } from 'react';

type SectionTab = 'disk' | 'buffering' | 'transfer' | 'team';

export const FormulasView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SectionTab>('disk');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Halaman */}
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
          Rumus Matematika & Asumsi Model Waktu Simulasi
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Landasan teoritis dan model waktu yang digunakan SysFlow untuk pertanggungjawaban akademis dan presentasi tugas UAS Sistem Operasi.
        </p>
      </div>

      {/* Sub-navigasi Modul */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'disk' ? 'btn-primary' : ''}`}
          onClick={() => setActiveSubTab('disk')}
        >
          1. Penjadwalan Disk
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'buffering' ? 'btn-primary' : ''}`}
          onClick={() => setActiveSubTab('buffering')}
        >
          2. Strategi Buffering
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'transfer' ? 'btn-primary' : ''}`}
          onClick={() => setActiveSubTab('transfer')}
        >
          3. Transfer Data
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeSubTab === 'team' ? 'btn-primary' : ''}`}
          onClick={() => setActiveSubTab('team')}
        >
          Daftar Anggota Tim & Proyek
        </button>
      </div>

      {/* Konten Tab 1: Penjadwalan Disk */}
      {activeSubTab === 'disk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--border-radius)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text)' }}>
              Model Perhitungan Penjadwalan Disk
            </h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)' }}>
              <li>
                <strong>Total Head Movement (Jarak Tempuh):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  Total Movement = Σ |Track[i] - Track[i-1]| untuk i = 1 s/d N
                </div>
                Menghitung total silinder yang dilewati lengan mekanik head dari posisi awal hingga seluruh request terlayani.
              </li>
              <li>
                <strong>Estimasi Seek Time (ms):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  Seek Time = Total Head Movement × t_seek_per_cylinder (default: 0.5 ms/silinder)
                </div>
                Mengasumsikan pergerakan linear rata-rata pergeseran track actuator voice-coil motor.
              </li>
              <li>
                <strong>Rata-rata & Maksimum Waktu Tunggu (Indikasi Starvation):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  Waktu Tunggu Request_k = Jarak tempuh kumulatif sejak t=0 hingga Request_k dilayani
                  <br />
                  Avg Wait = (Σ Waktu Tunggu) / N
                  <br />
                  Max Wait = max(Waktu Tunggu)
                </div>
                Pada algoritma SSTF, request yang berada jauh di ujung disk berpotensi mengalami <em>starvation</em> jika request baru terus berdatangan di dekat posisi head saat itu.
              </li>
              <li>
                <strong>Opsi Lompatan Kembali (C-SCAN & C-LOOK):</strong>
                Pada literatur sistem operasi standar (Silberschatz dkk.), gerakan kembali dari ujung disk ke titik awal dapat dihitung sebagai jarak fisik silinder penuh, atau dimatikan (zero-cost) jika hanya membandingkan pergerakan aktif yang melayani I/O.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Strategi Buffering */}
      {activeSubTab === 'buffering' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--border-radius)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text)' }}>
              Model Waktu Pipeline Buffering (Stallings Ch. 11)
            </h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)' }}>
              <li>
                <strong>Parameter Masukan:</strong>
                <br />T = Waktu transfer I/O memasukkan 1 blok ke buffer sistem.
                <br />C = Waktu komputasi CPU memproses 1 blok data di ruang kerja user.
                <br />M = Jumlah total item data.
              </li>
              <li>
                <strong>Tanpa Buffer (Unbuffered):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  T_total = M × (T + C)
                </div>
                I/O dan CPU berjalan strictly sekuensial. Selama I/O mentransfer, CPU terpaksa menganggur (idle). Selama CPU memproses, I/O terpaksa menganggur.
              </li>
              <li>
                <strong>Single Buffer (Buffer Tunggal):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  T_total ≈ T + (M - 1) × max(C, T) + C
                </div>
                Saat data pertama selesai dibaca ke buffer (T), OS menyalin data ke proses user. Producer dapat segera mengisi kembali buffer dengan item ke-2 secara paralel saat CPU sedang memproses item ke-1.
              </li>
              <li>
                <strong>Double Buffer (Ping-Pong Buffer):</strong>
                Dua buffer sistem (A dan B) bergantian diisi dan dikosongkan. Memperkecil waktu tunggu ketika selisih antara T dan C signifikan.
              </li>
              <li>
                <strong>Throughput & Utilisasi:</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  Throughput = M / T_total
                  <br />
                  Utilisasi Worker = ((T_total - IdleTime) / T_total) × 100%
                  <br />
                  Speedup Factor = T_total_unbuffered / T_total_buffered
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Konten Tab 3: Transfer Data */}
      {activeSubTab === 'transfer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--border-radius)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text)' }}>
              Model Perbandingan Utilisasi CPU pada Metode Transfer Data
            </h2>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)' }}>
              <li>
                <strong>Jumlah Blok Data:</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  B = ⌈ DataSize (KB) / BlockSize (KB) ⌉
                </div>
              </li>
              <li>
                <strong>1. Programmed I/O (Polling / Busy-Waiting):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  T_total = B × (T_dev + T_copy)
                  <br />
                  CPU_Busy = B × (T_dev + T_copy)  →  Utilisasi CPU = 100%
                  <br />
                  Interrupt Count = 0
                </div>
                CPU terikat dalam loop polling membaca status register perangkat. 100% siklus CPU terbuang sia-sia dan tidak dapat menjalankan program lain.
              </li>
              <li>
                <strong>2. Interrupt-Driven I/O:</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  T_total = B × (T_dev + T_int + T_copy)
                  <br />
                  CPU_Busy = B × (T_int + T_copy)
                  <br />
                  CPU_Free = B × T_dev (CPU bebas mengeksekusi program pengguna)
                  <br />
                  Interrupt Count = B (1 interrupt per setiap blok data)
                </div>
                CPU bebas selama perangkat membaca blok (T_dev), tetapi terbebani context switch dan Interrupt Service Routine (ISR) sebanyak B kali.
              </li>
              <li>
                <strong>3. Direct Memory Access (DMA):</strong>
                <div className="mono" style={{ backgroundColor: 'var(--color-bg)', padding: '6px 10px', marginTop: '4px', border: '1px solid var(--color-border)' }}>
                  T_total = T_setup + B × T_dev + T_int
                  <br />
                  CPU_Busy = T_setup + T_int (hanya inisialisasi di awal dan 1 interrupt di akhir)
                  <br />
                  Interrupt Count = 1
                  <br />
                  Utilisasi CPU = ((T_setup + T_int) / T_total) × 100% (biasanya &lt; 5%)
                </div>
                DMA Controller mengendalikan bus dan memindahkan seluruh data langsung ke memori. CPU hanya mengonfigurasi DMA sekali di awal dan menerima satu sinyal interrupt saat transfer selesai secara keseluruhan.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Konten Tab 4: Tim & Proyek */}
      {activeSubTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--border-radius)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text)' }}>
              Struktur Tim Proyek & Pembagian Kerja Paralel
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>
              Proyek SysFlow dirancang dengan arsitektur modul terpisah (pure functions & isolated UI folders) sehingga 6 orang anggota tim dapat berkolaborasi paralel tanpa konflik Git.
            </p>

            <table className="table-compact">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Peran & Modul</th>
                  <th>Lingkup Berkas / Fitur</th>
                  <th>Status Git</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 & 2</td>
                  <td><strong>Modul 1: Penjadwalan Disk</strong></td>
                  <td><code>src/core/disk/</code> & <code>src/modules/disk/</code> (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK)</td>
                  <td style={{ color: 'var(--color-served)' }}>✓ Selesai & Lolos Test</td>
                </tr>
                <tr>
                  <td>3 & 4</td>
                  <td><strong>Modul 2: Strategi Buffering</strong></td>
                  <td><code>src/core/buffering/</code> & <code>src/modules/buffering/</code> (Unbuffered, Single, Double, Circular)</td>
                  <td style={{ color: 'var(--color-served)' }}>✓ Selesai & Lolos Test</td>
                </tr>
                <tr>
                  <td>5 & 6</td>
                  <td><strong>Modul 3: Metode Transfer Data</strong></td>
                  <td><code>src/core/transfer/</code> & <code>src/modules/transfer/</code> (Programmed I/O, Interrupt, DMA)</td>
                  <td style={{ color: 'var(--color-served)' }}>✓ Selesai & Lolos Test</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

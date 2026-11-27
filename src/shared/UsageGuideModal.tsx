import React from 'react';
import { Modal } from './Modal';

export interface UsageGuideModalProps {
  onClose: () => void;
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  color: 'var(--color-ink)',
  fontSize: '14px'
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '20px',
  color: 'var(--color-ink2)',
  fontSize: '13px',
  lineHeight: 1.6
};

const keyStyle: React.CSSProperties = {
  display: 'inline-block',
  minWidth: '24px',
  padding: '1px 5px',
  border: '1px solid var(--color-border)',
  borderRadius: '3px',
  backgroundColor: 'var(--color-surface-2)',
  color: 'var(--color-ink)',
  textAlign: 'center'
};

export const UsageGuideModal: React.FC<UsageGuideModalProps> = ({ onClose }) => (
  <Modal
    title="Panduan Penggunaan"
    onClose={onClose}
    maxWidth="680px"
    closeButtonContent={<span aria-hidden="true">×</span>}
  >
    <section style={sectionStyle}>
      <h2 style={headingStyle}>Menggunakan SysFlow</h2>
      <ol style={listStyle}>
        <li>Pilih Penjadwalan Disk, Buffering, atau Transfer Data melalui navigasi di header.</li>
        <li>Atur metode dan parameter pada panel simulasi. Visualisasi dan metrik diperbarui mengikuti input.</li>
        <li>Gunakan kontrol pemutaran untuk menjalankan simulasi, melihat langkah, atau mengatur kecepatannya.</li>
        <li>Buka Rumus &amp; Asumsi dari navigasi untuk melihat rumus dan asumsi simulasi.</li>
      </ol>
    </section>

    <section style={sectionStyle}>
      <h2 style={headingStyle}>Shortcut keyboard</h2>
      <ul style={listStyle}>
        <li><kbd style={keyStyle}>Spasi</kbd> Putar atau jeda simulasi.</li>
        <li><kbd style={keyStyle}>←</kbd> Mundur satu langkah.</li>
        <li><kbd style={keyStyle}>→</kbd> Maju satu langkah.</li>
        <li><kbd style={keyStyle}>R</kbd> Reset simulasi ke awal.</li>
        <li><kbd style={keyStyle}>Esc</kbd> Tutup modal yang sedang terbuka.</li>
      </ul>
      <div style={{ color: 'var(--color-ink3)', fontSize: '12px', lineHeight: 1.5 }}>
        Shortcut playback aktif saat fokus tidak berada pada kontrol atau kolom input, dan tidak ada modal terbuka.
      </div>
    </section>
  </Modal>
);

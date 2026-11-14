export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCsv = (val: string | number) => {
    let str = String(val ?? '');
    // Perlindungan formula injection di spreadsheet (Excel/LibreOffice)
    if (typeof val === 'string' && /^[=+\-@]/.test(str) && isNaN(Number(str))) {
      str = `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(','))
  ].join('\r\n');

  // Gunakan BOM UTF-8 (\uFEFF) agar aplikasi seperti Microsoft Excel mengenali encoding karakter
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Berikan jeda sebelum revoke untuk mencegah download terhenti di beberapa peramban (mis. Safari)
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

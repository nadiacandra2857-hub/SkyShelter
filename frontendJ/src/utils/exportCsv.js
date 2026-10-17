/**
 * Mengonversi array of objects ke string CSV dan mengunduhnya di browser
 * @param {Array<Object>} data 
 * @param {string} filename 
 */
export function exportToCsv(data, filename = 'export.csv') {
  if (!data || !data.length) {
    throw new Error('Tidak ada data untuk diekspor');
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(item => {
    return headers.map(header => {
      let val = item[header];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') {
        try {
          val = JSON.stringify(val);
        } catch {
          val = '';
        }
      }
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val}"`;
      }
      return val;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

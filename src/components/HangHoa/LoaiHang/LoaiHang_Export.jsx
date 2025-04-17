import * as XLSX from 'xlsx';

const LoaiHang_Export = (data, filename = 'LoaiHang.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[address]) continue;
    worksheet[address].s = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
    };
  }

  const colWidths = data.reduce((widths, row) => {
    Object.keys(row).forEach((key, i) => {
      const valueLength = String(row[key] || '').length;
      widths[i] = Math.max(widths[i] || 10, valueLength + 2);
    });
    return widths;
  }, []);

  worksheet['!cols'] = colWidths.map((w) => ({ wch: w }));

  for (let R = 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: R, c: C });
      if (worksheet[address]) {
        worksheet[address].s = { alignment: { horizontal: 'center' } };
      }
    }
  }

  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'LoaiHang');
  XLSX.writeFile(workbook, filename);
};

export default LoaiHang_Export;

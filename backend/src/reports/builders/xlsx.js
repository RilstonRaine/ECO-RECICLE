const ExcelJS = require('exceljs');

exports.render = async (res, sheetName, columns, rows) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName || 'Relatório');

  ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.w || 18 }));
  rows.forEach(r => {
    const row = {};
    columns.forEach(c => { row[c.key] = r[c.key]; });
    ws.addRow(row);
  });

  await wb.xlsx.write(res);
  res.end();
};

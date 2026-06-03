export const exportToCSV = (data, filename = 'transactions.csv') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const prepareExpensesForExport = (expenses) => {
  return expenses.map(e => ({
    Date: e.date,
    Title: e.title,
    Category: e.category,
    Amount: e.amount,
    Note: e.note || '',
  }));
};

export const prepareIncomeForExport = (incomes) => {
  return incomes.map(i => ({
    Date: i.date,
    Source: i.source,
    Category: i.category,
    Amount: i.amount,
    Note: i.note || '',
  }));
};

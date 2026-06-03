import { Doughnut } from 'react-chartjs-2';
import '../charts/chartConfig';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import { useCurrency } from '../../context/CurrencyContext';

const ExpensePieChart = ({ expenses }) => {
  const { format } = useCurrency();

  const categoryTotals = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    const total = expenses
      .filter(e => e.category === cat.id)
      .reduce((s, e) => s + e.amount, 0);
    if (total > 0) acc.push({ ...cat, total });
    return acc;
  }, []);

  if (categoryTotals.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
        No expense data yet
      </div>
    );
  }

  const data = {
    labels: categoryTotals.map(c => c.label),
    datasets: [{
      data: categoryTotals.map(c => c.total),
      backgroundColor: categoryTotals.map(c => c.color),
      borderColor: 'transparent',
      hoverOffset: 8,
      borderRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${format(ctx.raw)}`,
        },
      },
    },
  };

  const total = categoryTotals.reduce((s, c) => s + c.total, 0);

  return (
    <div className="space-y-4">
      <div className="relative h-52">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-slate-400 dark:text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{format(total)}</p>
        </div>
      </div>
      {/* Legend */}
      <div className="space-y-2">
        {categoryTotals.map(cat => (
          <div key={cat.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-600 dark:text-slate-400 text-xs">{cat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(cat.total / total) * 100}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-xs font-medium text-slate-900 dark:text-white w-16 text-right">{format(cat.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensePieChart;

import { Line } from 'react-chartjs-2';
import '../charts/chartConfig';
import { format, subMonths } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const IncomeExpenseLineChart = ({ expenses, incomes }) => {
  const { isDark } = useTheme();
  const { format: fmt } = useCurrency();

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { label: format(d, 'MMM'), key: format(d, 'yyyy-MM') };
  });

  const expData = months.map(m =>
    expenses.filter(e => e.date.startsWith(m.key)).reduce((s, e) => s + e.amount, 0)
  );
  const incData = months.map(m =>
    incomes.filter(i => i.date.startsWith(m.key)).reduce((s, i) => s + i.amount, 0)
  );

  const gridColor = isDark ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,0.1)';
  const tickColor = isDark ? '#64748b' : '#94a3b8';

  const data = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        data: incData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: expData,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244,63,94,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: tickColor,
          font: { size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 8,
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: tickColor, font: { size: 11 },
          callback: (v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`,
        },
        border: { display: false },
      },
    },
    interaction: { mode: 'index', intersect: false },
  };

  return (
    <div className="h-52">
      <Line data={data} options={options} />
    </div>
  );
};

export default IncomeExpenseLineChart;

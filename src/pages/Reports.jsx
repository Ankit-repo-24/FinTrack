import { useState, useMemo } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import TransactionItem from '../components/shared/TransactionItem';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import { exportToCSV, prepareExpensesForExport, prepareIncomeForExport } from '../utils/exportCSV';
import toast from 'react-hot-toast';

const Reports = () => {
  const { expenses, incomes, currentMonth } = useFinance();
  const { format: fmt } = useCurrency();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), i);
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
  });

  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date.startsWith(selectedMonth)),
    [expenses, selectedMonth]
  );
  const monthIncomes = useMemo(() =>
    incomes.filter(i => i.date.startsWith(selectedMonth)),
    [incomes, selectedMonth]
  );

  const totalIncome = monthIncomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0.0';

  const exportExpenses = () => {
    if (monthExpenses.length === 0) { toast.error('No expenses to export'); return; }
    exportToCSV(prepareExpensesForExport(monthExpenses), `expenses-${selectedMonth}.csv`);
    toast.success('Expenses exported!');
  };

  const exportIncomes = () => {
    if (monthIncomes.length === 0) { toast.error('No income to export'); return; }
    exportToCSV(prepareIncomeForExport(monthIncomes), `income-${selectedMonth}.csv`);
    toast.success('Income exported!');
  };

  const exportAll = () => {
    const all = [
      ...prepareExpensesForExport(monthExpenses).map(r => ({ Type: 'Expense', ...r })),
      ...prepareIncomeForExport(monthIncomes).map(r => ({ Type: 'Income', ...r })),
    ].sort((a, b) => new Date(b.Date) - new Date(a.Date));
    if (all.length === 0) { toast.error('No data to export'); return; }
    exportToCSV(all, `report-${selectedMonth}.csv`);
    toast.success('Full report exported!');
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monthly financial summary</p>
        </div>
        <Button variant="primary" size="sm" icon={Download} onClick={exportAll}>
          Export Report
        </Button>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {months.map(m => (
          <button
            key={m.key}
            onClick={() => setSelectedMonth(m.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedMonth === m.key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: fmt(totalIncome), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
          { label: 'Total Expenses', value: fmt(totalExpenses), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/10' },
          { label: 'Net Savings', value: fmt(savings), color: savings >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-rose-600', bg: 'bg-primary-50 dark:bg-primary-900/10' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-50 dark:bg-slate-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-slate-100 dark:border-slate-700 p-4 ${s.bg}`}>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + exports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Expense Breakdown</h3>
          <ExpensePieChart expenses={monthExpenses} />
        </div>

        <div className="card p-5 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Export Data</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Expenses CSV', count: monthExpenses.length, fn: exportExpenses, color: 'rose' },
              { label: 'Income CSV', count: monthIncomes.length, fn: exportIncomes, color: 'emerald' },
              { label: 'Full Report', count: monthExpenses.length + monthIncomes.length, fn: exportAll, color: 'primary' },
            ].map(e => (
              <button
                key={e.label}
                onClick={e.fn}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 text-left transition-all hover:shadow-sm group"
              >
                <FileText className={`w-5 h-5 text-${e.color}-500 mb-2`} />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{e.label}</p>
                <p className="text-xs text-slate-400">{e.count} records</p>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Summary for {months.find(m => m.key === selectedMonth)?.label}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transactions</span>
                <span className="font-medium text-slate-900 dark:text-white">{monthExpenses.length + monthIncomes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Avg daily expense</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {fmt(monthExpenses.length > 0 ? totalExpenses / 30 : 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Largest expense</span>
                <span className="font-medium text-rose-600 dark:text-rose-400">
                  {monthExpenses.length > 0 ? fmt(Math.max(...monthExpenses.map(e => e.amount))) : fmt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">All Transactions</h3>
        {monthExpenses.length === 0 && monthIncomes.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No transactions for this month</div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {[
              ...monthExpenses.map(e => ({ ...e, _type: 'expense' })),
              ...monthIncomes.map(i => ({ ...i, _type: 'income' })),
            ]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(t => (
                <TransactionItem key={t.id} transaction={t} type={t._type} showActions={false} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

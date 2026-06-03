import { useState, useMemo } from 'react';
import { Plus, Download, TrendingUp } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TransactionItem from '../components/shared/TransactionItem';
import IncomeForm from '../components/shared/IncomeForm';
import { exportToCSV, prepareIncomeForExport } from '../utils/exportCSV';
import { INCOME_CATEGORIES } from '../utils/categories';
import toast from 'react-hot-toast';

const Income = () => {
  const { incomes, deleteIncome, currentMonth } = useFinance();
  const { format: fmt } = useCurrency();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), i);
      return format(d, 'yyyy-MM');
    });
    return months.map(month => ({
      month,
      label: format(new Date(month + '-01'), 'MMM yyyy'),
      items: incomes.filter(i => i.date.startsWith(month)),
      total: incomes.filter(i => i.date.startsWith(month)).reduce((s, i) => s + i.amount, 0),
    }));
  }, [incomes]);

  const selectedData = monthlyData.find(m => m.month === selectedMonth) || { items: [], total: 0 };

  const categoryBreakdown = useMemo(() => {
    return INCOME_CATEGORIES.map(cat => ({
      ...cat,
      total: selectedData.items.filter(i => i.category === cat.id).reduce((s, i) => s + i.amount, 0),
    })).filter(c => c.total > 0);
  }, [selectedData]);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);

  const handleDelete = (id) => {
    if (window.confirm('Delete this income entry?')) {
      deleteIncome(id);
      toast.success('Income deleted');
    }
  };

  const handleExport = () => {
    exportToCSV(prepareIncomeForExport(incomes), `income-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('CSV exported!');
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Income</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            All time total: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(totalIncome)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>Export CSV</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditingIncome(null); setModalOpen(true); }}>
            Add Income
          </Button>
        </div>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {monthlyData.map(m => (
          <button
            key={m.month}
            onClick={() => setSelectedMonth(m.month)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedMonth === m.month
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {m.label}
            <span className={`ml-1.5 text-xs ${selectedMonth === m.month ? 'text-white/70' : 'text-slate-400'}`}>
              {fmt(m.total)}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Source Breakdown</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No income this month</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(cat => {
                const pct = selectedData.total > 0 ? (cat.total / selectedData.total) * 100 : 0;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{cat.label}</span>
                      <span className="font-medium text-slate-900 dark:text-white">{fmt(cat.total)}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(selectedData.total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Transactions list */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Income for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
          </h3>
          {selectedData.items.length === 0 ? (
            <div className="py-10 text-center">
              <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No income recorded this month</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {[...selectedData.items]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(income => (
                  <TransactionItem
                    key={income.id} transaction={income} type="income"
                    onEdit={inc => { setEditingIncome(inc); setModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingIncome(null); }}
        title={editingIncome ? 'Edit Income' : 'Add Income'}
      >
        <IncomeForm
          income={editingIncome}
          onClose={() => { setModalOpen(false); setEditingIncome(null); }}
        />
      </Modal>
    </div>
  );
};

export default Income;

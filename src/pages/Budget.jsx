import { useState, useMemo } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Input';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import toast from 'react-hot-toast';

const Budget = () => {
  const { expenses, budgets, setBudget, deleteBudget, currentMonth } = useFinance();
  const { format: fmt } = useCurrency();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ category: 'food', limit: '' });
  const [errors, setErrors] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const budgetData = useMemo(() => {
    return budgets
      .filter(b => b.month === selectedMonth)
      .map(b => {
        const spent = expenses
          .filter(e => e.category === b.category && e.date.startsWith(selectedMonth))
          .reduce((s, e) => s + e.amount, 0);
        const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
        const rawPct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
        const cat = EXPENSE_CATEGORIES.find(c => c.id === b.category);
        return { ...b, spent, pct, rawPct, cat };
      })
      .sort((a, b) => b.rawPct - a.rawPct);
  }, [budgets, expenses, selectedMonth]);

  const totalBudget = budgetData.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgetData.filter(b => b.rawPct >= 100).length;
  const nearLimit = budgetData.filter(b => b.rawPct >= 80 && b.rawPct < 100).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.limit || parseFloat(form.limit) <= 0) {
      setErrors({ limit: 'Enter a valid limit' });
      return;
    }
    setBudget(form.category, form.limit, selectedMonth);
    toast.success('Budget set!');
    setModalOpen(false);
    setForm({ category: 'food', limit: '' });
    setErrors({});
  };

  const handleDelete = (id) => {
    deleteBudget(id);
    toast.success('Budget removed');
  };

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-rose-500';
    if (pct >= 80) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return format(d, 'yyyy-MM');
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Planning</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')} budget overview
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          Set Budget
        </Button>
      </div>

      {/* Month tabs */}
      <div className="flex gap-2">
        {months.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedMonth === m
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            }`}
          >
            {format(new Date(m + '-01'), 'MMM yyyy')}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: fmt(totalBudget), color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Total Spent', value: fmt(totalSpent), color: 'text-slate-900 dark:text-white' },
          { label: 'Remaining', value: fmt(Math.max(0, totalBudget - totalSpent)), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Over Budget', value: `${overBudget} ${overBudget === 1 ? 'category' : 'categories'}`, color: overBudget > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Budget items */}
      {budgetData.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No budgets set</h3>
          <p className="text-sm text-slate-400 mb-4">Set a budget for each spending category</p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>Set Your First Budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetData.map(b => (
            <div key={b.id} className="card p-5 animate-slide-up">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${b.cat?.light || 'bg-gray-100 text-gray-600'} flex items-center justify-center`}>
                    <span className="text-sm">{b.cat?.label?.charAt(0) || '?'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{b.cat?.label || b.category}</p>
                    <p className="text-xs text-slate-400">{fmt(b.spent)} of {fmt(b.limit)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.rawPct >= 100 && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                  {b.rawPct < 50 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="progress-bar mb-2">
                <div
                  className={`progress-fill ${getBarColor(b.rawPct)}`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs">
                <span className={`font-medium ${b.rawPct >= 100 ? 'text-rose-600 dark:text-rose-400' : b.rawPct >= 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {Math.round(b.rawPct)}% used
                </span>
                <span className="text-slate-400">{fmt(Math.max(0, b.limit - b.spent))} left</span>
              </div>

              {b.rawPct >= 100 && (
                <p className="text-xs text-rose-500 mt-2 font-medium">⚠️ Over budget by {fmt(b.spent - b.limit)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category" id="budget-category"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          >
            {EXPENSE_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </Select>
          <Input
            label="Monthly Limit" id="budget-limit" type="number"
            placeholder="e.g. 500" min="1" step="0.01"
            value={form.limit}
            onChange={e => { setForm(p => ({ ...p, limit: e.target.value })); setErrors({}); }}
            error={errors.limit}
          />
          <p className="text-xs text-slate-400">
            For: {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Set Budget</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budget;

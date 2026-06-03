import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Select } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import TransactionItem from '../components/shared/TransactionItem';
import ExpenseForm from '../components/shared/ExpenseForm';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { exportToCSV, prepareExpensesForExport } from '../utils/exportCSV';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 12;

const Expenses = () => {
  const { expenses, deleteExpense, getTotalExpenses, currentMonth } = useFinance();
  const { format: fmt } = useCurrency();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      const matchMonth = !monthFilter || e.date.startsWith(monthFilter);
      return matchSearch && matchCat && matchMonth;
    });
  }, [expenses, search, categoryFilter, monthFilter]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filtered]
  );

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense?')) {
      deleteExpense(id);
      toast.success('Expense deleted');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleExport = () => {
    exportToCSV(prepareExpensesForExport(filtered), `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success('CSV exported!');
  };

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const thisMonth = getTotalExpenses(currentMonth);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            This month: <span className="font-semibold text-rose-600 dark:text-rose-400">{fmt(thisMonth)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>Export CSV</Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => { setEditingExpense(null); setModalOpen(true); }}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Search expenses..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-9"
            />
          </div>
          <select
            value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input
            type="month" value={monthFilter}
            onChange={e => { setMonthFilter(e.target.value); setPage(1); }}
            className="input-field"
            placeholder="Filter by month"
          />
        </div>
        {(search || categoryFilter !== 'all' || monthFilter) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500">
              Showing <strong>{filtered.length}</strong> results · Total: <strong>{fmt(totalFiltered)}</strong>
            </p>
            <button
              onClick={() => { setSearch(''); setCategoryFilter('all'); setMonthFilter(''); setPage(1); }}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="card p-5">
        {paginated.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No expenses found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {expenses.length === 0 ? 'Add your first expense!' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {paginated.map(expense => (
                <TransactionItem
                  key={expense.id} transaction={expense} type="expense"
                  onEdit={handleEdit} onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages} · {sorted.length} total
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null); }}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          expense={editingExpense}
          onClose={() => { setModalOpen(false); setEditingExpense(null); }}
        />
      </Modal>
    </div>
  );
};

export default Expenses;

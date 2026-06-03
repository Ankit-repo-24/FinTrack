import { format } from 'date-fns';
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getCategoryById } from '../../utils/categories';
import { useCurrency } from '../../context/CurrencyContext';

const TransactionItem = ({ transaction, type = 'expense', onEdit, onDelete, showActions = true }) => {
  const { format: fmt } = useCurrency();
  const isExpense = type === 'expense';
  const category = isExpense ? getCategoryById(transaction.category) : null;

  return (
    <div className="flex items-center gap-3 py-3 group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl px-2 -mx-2 transition-colors">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isExpense
          ? category?.light || 'bg-gray-100 text-gray-600'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      }`}>
        {isExpense
          ? <ArrowDownRight className="w-4 h-4" />
          : <ArrowUpRight className="w-4 h-4" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {isExpense ? transaction.title : transaction.source}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isExpense && category && (
            <span className={`badge text-[10px] ${category.light}`}>{category.label}</span>
          )}
          {!isExpense && transaction.category && (
            <span className="badge text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">{transaction.category}</span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {transaction.date ? format(new Date(transaction.date + 'T00:00:00'), 'MMM dd, yyyy') : ''}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-sm font-semibold ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isExpense ? '-' : '+'}{fmt(transaction.amount)}
        </span>

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="p-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;

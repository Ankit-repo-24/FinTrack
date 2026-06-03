import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Input, { Select, Textarea } from '../ui/Input';
import Button from '../ui/Button';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import { validateExpenseForm } from '../../utils/validators';
import { useFinance } from '../../context/FinanceContext';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '', amount: '', category: 'food',
  date: format(new Date(), 'yyyy-MM-dd'), note: ''
};

const ExpenseForm = ({ expense, onClose }) => {
  const { addExpense, updateExpense } = useFinance();
  const [form, setForm] = useState(expense ? {
    title: expense.title, amount: String(expense.amount),
    category: expense.category, date: expense.date, note: expense.note || ''
  } : defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateExpenseForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const data = { ...form, amount: parseFloat(form.amount) };
    if (expense) {
      updateExpense(expense.id, data);
      toast.success('Expense updated!');
    } else {
      addExpense(data);
      toast.success('Expense added!');
    }
    setLoading(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title" id="exp-title" placeholder="e.g. Grocery Store"
        value={form.title} onChange={set('title')} error={errors.title}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount" id="exp-amount" type="number" placeholder="0.00"
          min="0" step="0.01" value={form.amount} onChange={set('amount')} error={errors.amount}
        />
        <Input
          label="Date" id="exp-date" type="date"
          value={form.date} onChange={set('date')} error={errors.date}
        />
      </div>
      <Select label="Category" id="exp-category" value={form.category} onChange={set('category')} error={errors.category}>
        {EXPENSE_CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.label}</option>
        ))}
      </Select>
      <Textarea label="Note (optional)" id="exp-note" placeholder="Additional details..."
        value={form.note} onChange={set('note')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          {expense ? 'Update' : 'Add'} Expense
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;

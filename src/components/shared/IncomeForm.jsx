import { useState } from 'react';
import { format } from 'date-fns';
import Input, { Select, Textarea } from '../ui/Input';
import Button from '../ui/Button';
import { INCOME_CATEGORIES } from '../../utils/categories';
import { validateIncomeForm } from '../../utils/validators';
import { useFinance } from '../../context/FinanceContext';
import toast from 'react-hot-toast';

const defaultForm = {
  source: '', amount: '', category: 'salary',
  date: format(new Date(), 'yyyy-MM-dd'), note: ''
};

const IncomeForm = ({ income, onClose }) => {
  const { addIncome, updateIncome } = useFinance();
  const [form, setForm] = useState(income ? {
    source: income.source, amount: String(income.amount),
    category: income.category, date: income.date, note: income.note || ''
  } : defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateIncomeForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const data = { ...form, amount: parseFloat(form.amount) };
    if (income) {
      updateIncome(income.id, data);
      toast.success('Income updated!');
    } else {
      addIncome(data);
      toast.success('Income added!');
    }
    setLoading(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Source" id="inc-source" placeholder="e.g. Monthly Salary"
        value={form.source} onChange={set('source')} error={errors.source}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Amount" id="inc-amount" type="number" placeholder="0.00"
          min="0" step="0.01" value={form.amount} onChange={set('amount')} error={errors.amount}
        />
        <Input
          label="Date" id="inc-date" type="date"
          value={form.date} onChange={set('date')} error={errors.date}
        />
      </div>
      <Select label="Category" id="inc-category" value={form.category} onChange={set('category')}>
        {INCOME_CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.label}</option>
        ))}
      </Select>
      <Textarea label="Note (optional)" id="inc-note" placeholder="Additional details..."
        value={form.note} onChange={set('note')} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          {income ? 'Update' : 'Add'} Income
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;

import { useState } from 'react';
import { Plus, Target, Trash2, Edit2, Plus as PlusIcon } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Textarea } from '../components/ui/Input';
import { validateGoalForm } from '../utils/validators';
import toast from 'react-hot-toast';

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance();
  const { format: fmt } = useCurrency();

  const [modalOpen, setModalOpen] = useState(false);
  const [contributeModal, setContributeModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [form, setForm] = useState({ title: '', targetAmount: '', deadline: '', note: '' });
  const [contribution, setContribution] = useState('');
  const [errors, setErrors] = useState({});

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  const openAdd = () => {
    setEditingGoal(null);
    setForm({ title: '', targetAmount: '', deadline: '', note: '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      deadline: goal.deadline,
      note: goal.note || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateGoalForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = { ...form, targetAmount: parseFloat(form.targetAmount) };
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
      toast.success('Goal updated!');
    } else {
      addGoal(data);
      toast.success('Goal created! 🎯');
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this goal?')) {
      deleteGoal(id);
      toast.success('Goal deleted');
    }
  };

  const handleContribute = (e) => {
    e.preventDefault();
    const amount = parseFloat(contribution);
    if (!amount || amount <= 0) return;
    contributeToGoal(contributeGoal.id, amount);
    toast.success(`Added ${fmt(amount)} to "${contributeGoal.title}"!`);
    setContributeModal(false);
    setContribution('');
    setContributeGoal(null);
  };

  const GoalCard = ({ goal }) => {
    const pct = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
    const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
    const remaining = goal.targetAmount - goal.savedAmount;

    return (
      <div className={`card p-5 animate-slide-up ${goal.completed ? 'ring-2 ring-emerald-300 dark:ring-emerald-700' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              goal.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'gradient-primary'
            }`}>
              <Target className={`w-5 h-5 ${goal.completed ? '' : 'text-white'}`} />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{goal.title}</p>
              {goal.completed ? (
                <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">✓ Completed</span>
              ) : (
                <p className="text-xs text-slate-400">
                  {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today!' : `${Math.abs(daysLeft)}d overdue`}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-600 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500">{fmt(goal.savedAmount)} saved</span>
            <span className="font-semibold text-slate-900 dark:text-white">{Math.round(pct)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${goal.completed ? 'bg-emerald-500' : 'gradient-primary'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-slate-400">Target: {fmt(goal.targetAmount)}</span>
            {!goal.completed && <span className="text-slate-400">{fmt(remaining)} remaining</span>}
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Deadline: {format(new Date(goal.deadline + 'T00:00:00'), 'MMM dd, yyyy')}
          </span>
          {!goal.completed && (
            <button
              onClick={() => { setContributeGoal(goal); setContributeModal(true); }}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              <PlusIcon className="w-3 h-3" /> Add funds
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {active.length} active · {completed.length} completed
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>New Goal</Button>
      </div>

      {/* Active Goals */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Active Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Completed Goals 🎉</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(g => <GoalCard key={g.id} goal={g} />)}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No goals yet</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first savings goal and start tracking progress</p>
          <Button variant="primary" onClick={openAdd}>Create Goal</Button>
        </div>
      )}

      {/* Goal Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingGoal ? 'Edit Goal' : 'New Goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Goal Title" id="goal-title" placeholder="e.g. Emergency Fund"
            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} error={errors.title}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Amount" id="goal-target" type="number" placeholder="5000"
              min="1" step="0.01" value={form.targetAmount}
              onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} error={errors.targetAmount}
            />
            <Input label="Deadline" id="goal-deadline" type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} error={errors.deadline}
            />
          </div>
          <Textarea label="Note (optional)" id="goal-note" placeholder="Why this goal matters..."
            value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">{editingGoal ? 'Update' : 'Create'} Goal</Button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal isOpen={contributeModal} onClose={() => setContributeModal(false)} title={`Add Funds: ${contributeGoal?.title}`}>
        <form onSubmit={handleContribute} className="space-y-4">
          <Input label="Amount to Add" id="contribute-amount" type="number" placeholder="0.00"
            min="0.01" step="0.01" value={contribution}
            onChange={e => setContribution(e.target.value)}
          />
          {contributeGoal && (
            <p className="text-xs text-slate-400">
              Current: {fmt(contributeGoal.savedAmount)} / {fmt(contributeGoal.targetAmount)}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setContributeModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="success" className="flex-1">Add Funds</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;

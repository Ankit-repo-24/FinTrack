import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

const FinanceContext = createContext(null);

const getKey = (type, userId) => `fintrack_${type}_${userId}`;

const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const save = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const FinanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const uid = currentUser?.id;

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Load data when user changes
  useEffect(() => {
    if (uid) {
      setExpenses(load(getKey('expenses', uid)));
      setIncomes(load(getKey('incomes', uid)));
      setBudgets(load(getKey('budgets', uid)));
      setGoals(load(getKey('goals', uid)));
    } else {
      setExpenses([]);
      setIncomes([]);
      setBudgets([]);
      setGoals([]);
    }
  }, [uid]);

  // Persist expenses
  useEffect(() => {
    if (uid) save(getKey('expenses', uid), expenses);
  }, [expenses, uid]);

  useEffect(() => {
    if (uid) save(getKey('incomes', uid), incomes);
  }, [incomes, uid]);

  useEffect(() => {
    if (uid) save(getKey('budgets', uid), budgets);
  }, [budgets, uid]);

  useEffect(() => {
    if (uid) save(getKey('goals', uid), goals);
  }, [goals, uid]);

  // ─── Expenses ────────────────────────────────────────
  const addExpense = useCallback((data) => {
    const newExp = { id: `exp-${Date.now()}`, userId: uid, createdAt: new Date().toISOString(), ...data };
    setExpenses(prev => [newExp, ...prev]);
    checkBudgetAlert(newExp);
    return newExp;
  }, [uid, budgets]);

  const updateExpense = useCallback((id, data) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── Income ──────────────────────────────────────────
  const addIncome = useCallback((data) => {
    const newInc = { id: `inc-${Date.now()}`, userId: uid, createdAt: new Date().toISOString(), ...data };
    setIncomes(prev => [newInc, ...prev]);
    return newInc;
  }, [uid]);

  const updateIncome = useCallback((id, data) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  }, []);

  const deleteIncome = useCallback((id) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  }, []);

  // ─── Budgets ─────────────────────────────────────────
  const setBudget = useCallback((category, limit, month) => {
    setBudgets(prev => {
      const existing = prev.findIndex(b => b.category === category && b.month === month);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], limit: parseFloat(limit) };
        return updated;
      }
      return [...prev, { id: `bud-${Date.now()}`, userId: uid, category, limit: parseFloat(limit), month }];
    });
  }, [uid]);

  const deleteBudget = useCallback((id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  // ─── Goals ───────────────────────────────────────────
  const addGoal = useCallback((data) => {
    const newGoal = {
      id: `goal-${Date.now()}`, userId: uid, savedAmount: 0,
      completed: false, createdAt: new Date().toISOString(), ...data
    };
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  }, [uid]);

  const updateGoal = useCallback((id, data) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const contributeToGoal = useCallback((id, amount) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const newSaved = Math.min(g.savedAmount + parseFloat(amount), g.targetAmount);
      return { ...g, savedAmount: newSaved, completed: newSaved >= g.targetAmount };
    }));
  }, []);

  // ─── Budget alerts ───────────────────────────────────
  const checkBudgetAlert = useCallback((expense) => {
    const month = expense.date.slice(0, 7);
    const budget = budgets.find(b => b.category === expense.category && b.month === month);
    if (!budget) return;
    const monthExpenses = [...expenses, expense].filter(
      e => e.category === expense.category && e.date.startsWith(month)
    );
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const pct = (total / budget.limit) * 100;
    if (pct >= 100) {
      addNotification(`⚠️ Budget exceeded for ${expense.category}! (${Math.round(pct)}%)`, 'danger');
    } else if (pct >= 80) {
      addNotification(`⚡ 80% of ${expense.category} budget used (${Math.round(pct)}%)`, 'warning');
    }
  }, [budgets, expenses]);

  // ─── Notifications ───────────────────────────────────
  const addNotification = useCallback((message, type = 'info') => {
    const notif = { id: `notif-${Date.now()}`, message, type, read: false, createdAt: new Date().toISOString() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  // ─── Computed stats ──────────────────────────────────
  const getTotalExpenses = (month) => {
    const list = month ? expenses.filter(e => e.date.startsWith(month)) : expenses;
    return list.reduce((s, e) => s + (e.amount || 0), 0);
  };

  const getTotalIncome = (month) => {
    const list = month ? incomes.filter(i => i.date.startsWith(month)) : incomes;
    return list.reduce((s, i) => s + (i.amount || 0), 0);
  };

  const currentMonth = format(new Date(), 'yyyy-MM');

  return (
    <FinanceContext.Provider value={{
      expenses, incomes, budgets, goals, notifications,
      addExpense, updateExpense, deleteExpense,
      addIncome, updateIncome, deleteIncome,
      setBudget, deleteBudget,
      addGoal, updateGoal, deleteGoal, contributeToGoal,
      addNotification, markNotificationRead, clearNotifications,
      getTotalExpenses, getTotalIncome,
      currentMonth,
      unreadCount: notifications.filter(n => !n.read).length,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};

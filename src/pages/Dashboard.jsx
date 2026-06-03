import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowRight } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import StatCard from '../components/ui/StatCard';
import Alert from '../components/ui/Alert';
import TransactionItem from '../components/shared/TransactionItem';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import IncomeExpenseLineChart from '../components/charts/IncomeExpenseLineChart';
import SavingsTrendChart from '../components/charts/SavingsTrendChart';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { expenses, incomes, budgets, currentMonth } = useFinance();
  const { format: fmt } = useCurrency();

  const prevMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

  const stats = useMemo(() => {
    const thisExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const prevExpenses = expenses.filter(e => e.date.startsWith(prevMonth));
    const thisIncome = incomes.filter(i => i.date.startsWith(currentMonth));
    const prevIncome = incomes.filter(i => i.date.startsWith(prevMonth));

    const totalIncome = thisIncome.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = thisExpenses.reduce((s, e) => s + e.amount, 0);
    const savings = totalIncome - totalExpenses;

    const prevIncomeTotal = prevIncome.reduce((s, i) => s + i.amount, 0);
    const prevExpTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);

    const allIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const allExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    const incTrend = prevIncomeTotal ? ((totalIncome - prevIncomeTotal) / prevIncomeTotal) * 100 : 0;
    const expTrend = prevExpTotal ? ((totalExpenses - prevExpTotal) / prevExpTotal) * 100 : 0;

    return {
      balance: allIncome - allExpenses,
      income: totalIncome,
      expenses: totalExpenses,
      savings,
      incTrend,
      expTrend,
    };
  }, [expenses, incomes, currentMonth, prevMonth]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    return budgets
      .filter(b => b.month === currentMonth)
      .map(b => {
        const spent = expenses
          .filter(e => e.category === b.category && e.date.startsWith(currentMonth))
          .reduce((s, e) => s + e.amount, 0);
        const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
        return { ...b, spent, pct };
      })
      .filter(b => b.pct >= 80)
      .sort((a, b) => b.pct - a.pct);
  }, [expenses, budgets, currentMonth]);

  // Recent transactions (merge and sort)
  const recentTransactions = useMemo(() => {
    const allExp = expenses.slice(0, 8).map(e => ({ ...e, _type: 'expense' }));
    const allInc = incomes.slice(0, 4).map(i => ({ ...i, _type: 'income' }));
    return [...allExp, ...allInc]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [expenses, incomes]);

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {greeting()}, {currentUser?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      {/* Budget alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          {budgetAlerts.slice(0, 2).map(b => (
            <Alert
              key={b.id}
              type={b.pct >= 100 ? 'danger' : 'warning'}
              message={`${b.pct >= 100 ? '⚠️ Over budget' : '⚡ Budget alert'}: ${b.category} — ${fmt(b.spent)} of ${fmt(b.limit)} (${Math.round(b.pct)}%)`}
            />
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance" value={fmt(stats.balance)}
          icon={Wallet} gradient="gradient-primary"
          subtitle="All time"
        />
        <StatCard
          title="Monthly Income" value={fmt(stats.income)}
          icon={TrendingUp} gradient="gradient-emerald"
          trend={stats.incTrend} trendLabel="vs last month"
        />
        <StatCard
          title="Monthly Expenses" value={fmt(stats.expenses)}
          icon={TrendingDown} gradient="gradient-rose"
          trend={-stats.expTrend} trendLabel="vs last month"
        />
        <StatCard
          title="Monthly Savings" value={fmt(stats.savings)}
          icon={PiggyBank} gradient="gradient-amber"
          subtitle={stats.income > 0 ? `${Math.round((stats.savings / stats.income) * 100)}% rate` : undefined}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Expense Breakdown</h3>
          <ExpensePieChart expenses={currentMonthExpenses} />
        </div>
        <div className="card p-5 lg:col-span-2 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly Spending</h3>
          <MonthlyBarChart expenses={expenses} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Income vs Expenses</h3>
          <IncomeExpenseLineChart expenses={expenses} incomes={incomes} />
        </div>
        <div className="card p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Savings Trend</h3>
          <SavingsTrendChart expenses={expenses} incomes={incomes} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
          <Link to="/expenses" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            No transactions yet. Add your first expense!
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {recentTransactions.map(t => (
              <TransactionItem
                key={t.id} transaction={t} type={t._type}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

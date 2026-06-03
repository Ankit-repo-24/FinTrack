import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const generateDemoData = (userId) => {
  const now = new Date();

  const expenses = [];
  const incomes = [];

  const expenseTemplates = [
    { title: 'Grocery Store', category: 'food', amounts: [45, 62, 38, 55, 71] },
    { title: 'Netflix Subscription', category: 'entertainment', amounts: [15, 15, 15, 15, 15] },
    { title: 'Uber Ride', category: 'travel', amounts: [12, 18, 9, 22, 15] },
    { title: 'Coffee Shop', category: 'food', amounts: [8, 12, 6, 10, 9] },
    { title: 'Amazon Purchase', category: 'shopping', amounts: [85, 120, 45, 67, 99] },
    { title: 'Gym Membership', category: 'health', amounts: [50, 50, 50, 50, 50] },
    { title: 'Online Course', category: 'education', amounts: [29, 49, 0, 99, 29] },
    { title: 'Restaurant Dinner', category: 'food', amounts: [65, 42, 88, 55, 70] },
    { title: 'Flight Tickets', category: 'travel', amounts: [0, 320, 0, 150, 0] },
    { title: 'Clothes Shopping', category: 'shopping', amounts: [120, 0, 85, 200, 60] },
    { title: 'Doctor Visit', category: 'health', amounts: [0, 80, 0, 45, 0] },
    { title: 'Movie Tickets', category: 'entertainment', amounts: [28, 0, 35, 14, 28] },
    { title: 'Spotify', category: 'entertainment', amounts: [10, 10, 10, 10, 10] },
    { title: 'Electricity Bill', category: 'others', amounts: [95, 88, 102, 79, 91] },
    { title: 'Internet Bill', category: 'others', amounts: [60, 60, 60, 60, 60] },
  ];

  const incomeTemplates = [
    { source: 'Monthly Salary', category: 'salary', amounts: [5000, 5000, 5000, 5200, 5200] },
    { source: 'Freelance Project', category: 'freelance', amounts: [800, 0, 1200, 500, 900] },
    { source: 'Investment Dividend', category: 'investment', amounts: [120, 85, 0, 200, 150] },
    { source: 'Side Business', category: 'business', amounts: [0, 350, 0, 600, 0] },
  ];

  let expId = 1;
  let incId = 1;

  for (let m = 4; m >= 0; m--) {
    const monthDate = subMonths(now, m);
    const start = startOfMonth(monthDate);

    expenseTemplates.forEach((tmpl, ti) => {
      const amount = tmpl.amounts[4 - m];
      if (amount > 0) {
        const day = (ti * 2 + 1) % 28 + 1;
        const date = new Date(start.getFullYear(), start.getMonth(), day);
        expenses.push({
          id: `exp-${expId++}`,
          userId,
          title: tmpl.title,
          amount,
          category: tmpl.category,
          date: format(date, 'yyyy-MM-dd'),
          note: '',
          createdAt: date.toISOString(),
        });
      }
    });

    incomeTemplates.forEach((tmpl, ti) => {
      const amount = tmpl.amounts[4 - m];
      if (amount > 0) {
        const day = ti + 1;
        const date = new Date(start.getFullYear(), start.getMonth(), day);
        incomes.push({
          id: `inc-${incId++}`,
          userId,
          source: tmpl.source,
          amount,
          category: tmpl.category,
          date: format(date, 'yyyy-MM-dd'),
          note: '',
          createdAt: date.toISOString(),
        });
      }
    });
  }

  const budgets = [
    { id: 'bud-1', userId, category: 'food', limit: 400, month: format(now, 'yyyy-MM') },
    { id: 'bud-2', userId, category: 'shopping', limit: 300, month: format(now, 'yyyy-MM') },
    { id: 'bud-3', userId, category: 'entertainment', limit: 100, month: format(now, 'yyyy-MM') },
    { id: 'bud-4', userId, category: 'travel', limit: 200, month: format(now, 'yyyy-MM') },
    { id: 'bud-5', userId, category: 'health', limit: 150, month: format(now, 'yyyy-MM') },
    { id: 'bud-6', userId, category: 'others', limit: 250, month: format(now, 'yyyy-MM') },
  ];

  const goals = [
    {
      id: 'goal-1', userId, title: 'Emergency Fund', targetAmount: 10000,
      savedAmount: 3500, deadline: format(new Date(now.getFullYear(), now.getMonth() + 6, 1), 'yyyy-MM-dd'),
      completed: false, createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-2', userId, title: 'Vacation to Japan', targetAmount: 5000,
      savedAmount: 2200, deadline: format(new Date(now.getFullYear() + 1, 2, 1), 'yyyy-MM-dd'),
      completed: false, createdAt: new Date().toISOString(),
    },
    {
      id: 'goal-3', userId, title: 'New Laptop', targetAmount: 1500,
      savedAmount: 1500, deadline: format(new Date(now.getFullYear(), now.getMonth() - 1, 1), 'yyyy-MM-dd'),
      completed: true, createdAt: new Date().toISOString(),
    },
  ];

  return { expenses, incomes, budgets, goals };
};

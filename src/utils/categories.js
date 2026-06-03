export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f97316', bg: 'bg-orange-500', light: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { id: 'travel', label: 'Travel', color: '#3b82f6', bg: 'bg-blue-500', light: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'shopping', label: 'Shopping', color: '#ec4899', bg: 'bg-pink-500', light: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  { id: 'education', label: 'Education', color: '#8b5cf6', bg: 'bg-violet-500', light: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  { id: 'health', label: 'Health', color: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 'entertainment', label: 'Entertainment', color: '#f59e0b', bg: 'bg-amber-500', light: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'others', label: 'Others', color: '#6b7280', bg: 'bg-gray-500', light: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', color: '#6366f1' },
  { id: 'freelance', label: 'Freelance', color: '#10b981' },
  { id: 'investment', label: 'Investment', color: '#f59e0b' },
  { id: 'business', label: 'Business', color: '#3b82f6' },
  { id: 'gift', label: 'Gift', color: '#ec4899' },
  { id: 'other', label: 'Other', color: '#6b7280' },
];

export const getCategoryById = (id) =>
  EXPENSE_CATEGORIES.find((c) => c.id === id) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

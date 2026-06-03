import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'fintrack_users';
const CURRENT_USER_KEY = 'fintrack_current_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Email already registered');
      setLoading(false);
      return false;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      currency: 'USD',
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);

    // Start with empty data for new users
    localStorage.setItem(`fintrack_expenses_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`fintrack_incomes_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`fintrack_budgets_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`fintrack_goals_${newUser.id}`, JSON.stringify([]));

    const safeUser = { ...newUser };
    delete safeUser.password;
    setCurrentUser(safeUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    setLoading(false);
    return true;
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      setError('Invalid email or password');
      setLoading(false);
      return false;
    }
    const safeUser = { ...user };
    delete safeUser.password;
    setCurrentUser(safeUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = (updates) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx === -1) return false;
    const updated = { ...users[idx], ...updates };
    users[idx] = updated;
    saveUsers(users);
    const safeUser = { ...updated };
    delete safeUser.password;
    setCurrentUser(safeUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return true;
  };

  const changePassword = (currentPass, newPass) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx === -1) return 'User not found';
    if (users[idx].password !== currentPass) return 'Current password is incorrect';
    users[idx].password = newPass;
    saveUsers(users);
    return null;
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      currentUser, loading, error, clearError,
      signup, login, logout, updateProfile, changePassword,
      isAuthenticated: !!currentUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

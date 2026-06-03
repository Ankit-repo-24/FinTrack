import { createContext, useContext, useState } from 'react';
import { CURRENCIES } from '../utils/categories';
import { formatCurrency } from '../utils/formatCurrency';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('fintrack_currency');
    return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
  });

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem('fintrack_currency', code);
    }
  };

  const format = (amount) => formatCurrency(amount, currency.code);

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, format, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

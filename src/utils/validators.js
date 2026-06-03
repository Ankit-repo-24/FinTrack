export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || String(value).trim() === '') return `${fieldName} is required`;
  return null;
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Please enter a valid number';
  if (num <= 0) return 'Amount must be greater than 0';
  if (num > 999999999) return 'Amount is too large';
  return null;
};

export const validateDate = (date) => {
  if (!date) return 'Date is required';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Please enter a valid date';
  return null;
};

export const validateExpenseForm = (form) => {
  const errors = {};
  const titleErr = validateRequired(form.title, 'Title');
  if (titleErr) errors.title = titleErr;
  const amountErr = validateAmount(form.amount);
  if (amountErr) errors.amount = amountErr;
  const dateErr = validateDate(form.date);
  if (dateErr) errors.date = dateErr;
  if (!form.category) errors.category = 'Category is required';
  return errors;
};

export const validateIncomeForm = (form) => {
  const errors = {};
  const sourceErr = validateRequired(form.source, 'Source');
  if (sourceErr) errors.source = sourceErr;
  const amountErr = validateAmount(form.amount);
  if (amountErr) errors.amount = amountErr;
  const dateErr = validateDate(form.date);
  if (dateErr) errors.date = dateErr;
  return errors;
};

export const validateGoalForm = (form) => {
  const errors = {};
  const titleErr = validateRequired(form.title, 'Goal title');
  if (titleErr) errors.title = titleErr;
  const amountErr = validateAmount(form.targetAmount);
  if (amountErr) errors.targetAmount = amountErr;
  if (!form.deadline) errors.deadline = 'Deadline is required';
  return errors;
};

export const validateProfileForm = (form) => {
  const errors = {};
  const nameErr = validateRequired(form.name, 'Name');
  if (nameErr) errors.name = nameErr;
  if (!validateEmail(form.email)) errors.email = 'Please enter a valid email';
  return errors;
};

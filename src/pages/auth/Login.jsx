import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { validateEmail } from '../../utils/validators';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    clearError();
  };

  const validate = () => {
    const errs = {};
    if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const ok = await login(form.email, form.password);
    if (ok) {
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    }
  };


  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinTrack</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Take control of<br />your finances
          </h2>
          <p className="text-white/70 text-lg">
            Track expenses, manage budgets, and achieve your financial goals with ease.
          </p>
        </div>
        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { label: 'Users', value: '50K+' },
            { label: 'Transactions', value: '2M+' },
            { label: 'Saved', value: '$10M+' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/60 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">FinTrack</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your account to continue</p>
          </div>

          {error && <Alert type="danger" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address" id="login-email" type="email"
              placeholder="you@example.com" icon={Mail}
              value={form.email} onChange={set('email')} error={errors.email}
            />
            <Input
              label="Password" id="login-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Your password" icon={Lock}
              value={form.password} onChange={set('password')} error={errors.password}
              rightIcon={
                <button type="button" onClick={() => setShowPass(p => !p)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

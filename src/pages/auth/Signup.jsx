import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wallet, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { validateEmail, validatePassword } from '../../utils/validators';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    clearError();
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!validateEmail(form.email)) errs.email = 'Enter a valid email';
    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const ok = await signup(form.name.trim(), form.email, form.password);
    if (ok) {
      toast.success('Account created! Welcome to FinTrack 🎉');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-primary-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FinTrack</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start your financial<br />journey today
          </h2>
          <p className="text-white/70 text-lg">
            Join thousands of users who are already managing their money smarter.
          </p>
        </div>
        <div className="relative space-y-3">
          {[
            '✓ Free to use, no credit card required',
            '✓ Secure local data storage',
            '✓ Beautiful charts and insights',
            '✓ Set and track financial goals',
          ].map(f => (
            <p key={f} className="text-white/80 text-sm">{f}</p>
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Get started in under 30 seconds</p>
          </div>

          {error && <Alert type="danger" message={error} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name" id="signup-name" type="text"
              placeholder="John Doe" icon={User}
              value={form.name} onChange={set('name')} error={errors.name}
            />
            <Input
              label="Email Address" id="signup-email" type="email"
              placeholder="you@example.com" icon={Mail}
              value={form.email} onChange={set('email')} error={errors.email}
            />
            <Input
              label="Password" id="signup-password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 6 characters" icon={Lock}
              value={form.password} onChange={set('password')} error={errors.password}
              rightIcon={
                <button type="button" onClick={() => setShowPass(p => !p)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Input
              label="Confirm Password" id="signup-confirm"
              type={showPass ? 'text' : 'password'}
              placeholder="Repeat password" icon={Lock}
              value={form.confirm} onChange={set('confirm')} error={errors.confirm}
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

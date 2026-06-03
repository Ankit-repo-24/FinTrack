import { useState } from 'react';
import { User, Mail, Lock, Globe, Save, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import { validateProfileForm } from '../utils/validators';
import toast from 'react-hot-toast';

const Profile = () => {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currency, changeCurrency, currencies } = useCurrency();

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errs = validateProfileForm(profileForm);
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return; }
    setProfileLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = updateProfile({ name: profileForm.name, email: profileForm.email });
    setProfileLoading(false);
    if (ok) toast.success('Profile updated!');
  };

  const handlePassSave = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);
    if (passForm.next.length < 6) { setPassError('New password must be at least 6 characters'); return; }
    if (passForm.next !== passForm.confirm) { setPassError('Passwords do not match'); return; }
    setPassLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const err = changePassword(passForm.current, passForm.next);
    setPassLoading(false);
    if (err) {
      setPassError(err);
    } else {
      setPassSuccess(true);
      setPassForm({ current: '', next: '', confirm: '' });
      toast.success('Password changed!');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{currentUser?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input
            label="Full Name" id="profile-name" icon={User}
            value={profileForm.name} error={profileErrors.name}
            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email Address" id="profile-email" type="email" icon={Mail}
            value={profileForm.email} error={profileErrors.email}
            onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" icon={Save} loading={profileLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h2>
        {passError && <Alert type="danger" message={passError} className="mb-4" />}
        {passSuccess && <Alert type="success" message="Password changed successfully!" className="mb-4" />}
        <form onSubmit={handlePassSave} className="space-y-4">
          <Input
            label="Current Password" id="pass-current"
            type={showPass ? 'text' : 'password'}
            icon={Lock}
            value={passForm.current}
            onChange={e => setPassForm(p => ({ ...p, current: e.target.value }))}
            rightIcon={
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="New Password" id="pass-new"
            type={showPass ? 'text' : 'password'}
            icon={Lock}
            placeholder="Min. 6 characters"
            value={passForm.next}
            onChange={e => setPassForm(p => ({ ...p, next: e.target.value }))}
          />
          <Input
            label="Confirm New Password" id="pass-confirm"
            type={showPass ? 'text' : 'password'}
            icon={Lock}
            value={passForm.confirm}
            onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={passLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Preferences */}
      <div className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4" /> Preferences
        </h2>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Appearance</p>
            <p className="text-xs text-slate-400">Choose your preferred theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-9' : 'translate-x-1'}`}>
              {isDark ? <Moon className="w-3 h-3 text-primary-600" /> : <Sun className="w-3 h-3 text-amber-500" />}
            </div>
          </button>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency</p>
            <p className="text-xs text-slate-400">Used for all amounts</p>
          </div>
          <select
            value={currency.code}
            onChange={e => changeCurrency(e.target.value)}
            className="input-field w-40 text-sm"
          >
            {currencies.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Profile;

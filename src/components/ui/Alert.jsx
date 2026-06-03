import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const alertConfig = {
  warning: { icon: AlertTriangle, className: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400' },
  danger: { icon: XCircle, className: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400' },
  success: { icon: CheckCircle, className: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400' },
  info: { icon: Info, className: 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/20 dark:border-primary-700/50 dark:text-primary-400' },
};

const Alert = ({ type = 'info', message, onDismiss }) => {
  const { icon: Icon, className } = alertConfig[type] || alertConfig.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${className} animate-slide-up`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

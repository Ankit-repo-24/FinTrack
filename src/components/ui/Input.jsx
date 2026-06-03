const Input = ({
  label, id, error, className = '', icon: Icon, rightIcon, ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="input-label">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          className={`input-field ${Icon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${error ? 'border-rose-400 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export const Select = ({ label, id, error, className = '', children, ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="input-label">{label}</label>
      )}
      <select
        id={id}
        className={`input-field ${error ? 'border-rose-400 focus:ring-rose-500' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export const Textarea = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="input-label">{label}</label>
      )}
      <textarea
        id={id}
        rows={3}
        className={`input-field resize-none ${error ? 'border-rose-400 focus:ring-rose-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default Input;

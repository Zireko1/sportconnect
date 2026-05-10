import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const inputBase =
  "w-full font-dm text-text-primary bg-surface border border-[#c8d9eb] rounded-card px-4 py-3 text-sm placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-colors";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-dm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[inputBase, error ? "border-red-400 focus:ring-red-400" : "", className].join(" ")}
          {...props}
        />
        {error && <p className="text-xs font-dm text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs font-dm text-text-secondary">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-dm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={[inputBase, "resize-none", error ? "border-red-400 focus:ring-red-400" : "", className].join(" ")}
          {...props}
        />
        {error && <p className="text-xs font-dm text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs font-dm text-text-secondary">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-dm font-medium text-text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={[inputBase, "appearance-none cursor-pointer", error ? "border-red-400" : "", className].join(" ")}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs font-dm text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs font-dm text-text-secondary">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Input, Textarea, Select };

import { useId, type InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="input-field">
      <label htmlFor={inputId} className="input-field__label">
        {label}
      </label>
      <input
        id={inputId}
        className={['input-field__input', className].filter(Boolean).join(' ')}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
      {error && <span className="input-field__error">{error}</span>}
    </div>
  );
}


import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  const baseInputClasses = "shadow-sm appearance-none border rounded w-full py-3 px-4 text-pbr-text-main leading-tight focus:outline-none focus:ring-2";
  const errorInputClasses = error ? "border-pbr-error focus:ring-pbr-error" : "border-gray-300 focus:ring-pbr-primary";
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-pbr-text-secondary text-sm font-bold mb-2" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${baseInputClasses} ${errorInputClasses} ${className}`}
        {...props}
      />
      {error && <p className="text-pbr-error text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Input;

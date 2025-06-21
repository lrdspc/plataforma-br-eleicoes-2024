
import React, { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string; // Added placeholder prop
}

const Select: React.FC<SelectProps> = ({ label, id, error, className = '', containerClassName = '', options, placeholder, ...props }) => {
  const baseSelectClasses = "shadow-sm appearance-none border rounded w-full py-3 px-4 text-pbr-text-main leading-tight focus:outline-none focus:ring-2 bg-white";
  const errorSelectClasses = error ? "border-pbr-error focus:ring-pbr-error" : "border-gray-300 focus:ring-pbr-primary";
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-pbr-text-secondary text-sm font-bold mb-2" htmlFor={id}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`${baseSelectClasses} ${errorSelectClasses} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-pbr-error text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Select;


import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  const baseTextareaClasses = "shadow-sm appearance-none border rounded w-full py-3 px-4 text-pbr-text-main leading-tight focus:outline-none focus:ring-2";
  const errorTextareaClasses = error ? "border-pbr-error focus:ring-pbr-error" : "border-gray-300 focus:ring-pbr-primary";
  
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label className="block text-pbr-text-secondary text-sm font-bold mb-2" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`${baseTextareaClasses} ${errorTextareaClasses} ${className}`}
        rows={props.rows || 3}
        {...props}
      />
      {error && <p className="text-pbr-error text-xs italic mt-1">{error}</p>}
    </div>
  );
};

export default Textarea;

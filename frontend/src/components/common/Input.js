import React from 'react';
import { clsx } from 'clsx';

const Input = ({ 
  label, 
  error, 
  className = '', 
  icon,
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={clsx(
            'input',
            icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500'
          )}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 
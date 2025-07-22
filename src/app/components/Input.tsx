import React from 'react';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  className = '',
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black ${className}`}
      />
    </div>
  );
};

export default Input;

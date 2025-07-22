import React from 'react';

interface QueueFormFieldProps {
  label: string;
  showLabel?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  isDropdown?: boolean;
  options?: { value: string; label: string }[];
  fullWidth?: boolean;
  disabled?: boolean;
}

const QueueFormField: React.FC<QueueFormFieldProps> = ({
  label,
  showLabel = true,
  placeholder = '',
  value = '',
  onChange,
  isDropdown = false,
  options = [],
  fullWidth = false,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {showLabel && <div className="bg-black text-white p-3">
        {label}:
      </div>}
      {isDropdown ? (
        <div className="relative">
          <select 
            className="w-full border border-gray-300 p-3 focus:outline-none"
            value={value}
            onChange={handleChange}
            disabled={disabled}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      ) : (
        <input
          type="text"
          className="w-full border border-gray-300 p-3 focus:outline-none"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default QueueFormField;

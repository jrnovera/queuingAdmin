import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'outline';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
}) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400';
  
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800',
    outline: 'bg-transparent border border-black text-black hover:bg-gray-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

import React from 'react';
import Link from 'next/link';

interface NextButtonProps {
  href: string;
  disabled?: boolean;
  text?: string;
}

const NextButton: React.FC<NextButtonProps> = ({ href, disabled = false, text = 'NEXT' }) => {
  return (
    <div className="flex justify-end mt-6">
      <Link 
        href={disabled ? '#' : href} 
        className={`inline-block px-8 py-3 ${disabled ? 'bg-gray-400' : 'bg-black'} text-white rounded ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {text}
      </Link>
    </div>
  );
};

export default NextButton;

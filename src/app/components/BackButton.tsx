import React from 'react';
import Link from 'next/link';

interface BackButtonProps {
  href: string;
  text: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href, text }) => {
  return (
    <Link href={href} className="flex items-center text-lg font-medium mb-6">
      <span className="mr-2">◀</span>
      <span>{text}</span>
    </Link>
  );
};

export default BackButton;

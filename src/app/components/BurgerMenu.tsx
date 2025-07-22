import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  if (!isOpen) return null;
  
  const handleLogout = () => {
    // In a real app, you would clear authentication tokens/cookies here
    // For example: localStorage.removeItem('authToken');
    
    // Close the menu
    onClose();
    
    // Navigate to login page
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Transparent overlay to capture clicks outside the menu */}
      <div 
        className="fixed inset-0"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className="relative w-64 max-w-xs bg-white h-full shadow-xl flex flex-col">
        {/* User info */}
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
            U
          </div>
          <div className="ml-3">
            <p className="font-bold">User Name</p>
            <p className="text-sm text-gray-600">user@example.com</p>
          </div>
        </div>
        
        {/* Menu items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <Link href="/account" className="block p-2 hover:bg-gray-100">
              👤 Account
            </Link>
            <Link href="/dashboard" className="block p-2 hover:bg-gray-100">
              📊 Dashboard
            </Link>
            <Link href="/manage-queues" className="block p-2 hover:bg-gray-100">
              📋 Manage Queues
            </Link>
            <Link href="/history" className="block p-2 hover:bg-gray-100">
              📜 History
            </Link>
            <Link href="/settings" className="block p-2 hover:bg-gray-100">
              ⚙️ Settings
            </Link>
            <Link href="/about" className="block p-2 hover:bg-gray-100">
              ℹ️ About Us
            </Link>
          </div>
        </div>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center p-2 w-full hover:bg-gray-100 rounded"
          >
            <span className="mr-3">🚪</span>
            <span>LOGOUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BurgerMenu;

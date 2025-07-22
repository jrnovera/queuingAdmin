'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NotificationButton from '../components/notificationButton';
import BurgerMenu from '../components/BurgerMenu';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with burger menu and notification */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200">
        <button 
          onClick={toggleMenu}
          className="text-3xl focus:outline-none"
          aria-label="Menu"
        >
          ☰
        </button>
       
        <NotificationButton />
      </header>

      {/* Burger Menu Component */}
      <BurgerMenu isOpen={menuOpen} onClose={toggleMenu} />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex items-center justify-center opacity-50">
          <Image 
            src="/qrlogo.png" 
            alt="QUEUEV Logo" 
            width={400} 
            height={400}
            className="mb-6"
          />
          <p className="text-lg font-bold mt-4">QUEUEV</p>
        </div>
        <div className="border border-black p-2 mb-6">
          <Link href="/generate/step1" className="bg-white text-black px-8 py-3 rounded text-lg">
            GENERATE NOW
          </Link>
        </div>
        
        
      </main>
    </div>
  );
}
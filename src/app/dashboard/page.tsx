'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BurgerMenu from '../components/BurgerMenu';
import NotificationButton from '../components/notificationButton';

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Mock data for queues - in a real app, this would come from an API or database
  const [queues] = useState([
    {
      id: '1',
      name: 'SOUTHERN LUZON STATE UNIVERSITY - CATANAUAN EXTENSION',
      address: 'BRGY SAN ANTONIO, PALA, CATANAUAN, QUEZON',
      date: 'JULY 2, 2025',
      time: '8:00 AM',
      status: 'active'
    },
    {
      id: '2',
      name: 'REGISTRAR OFFICE',
      address: 'MAIN CAMPUS, LUCENA CITY',
      date: 'JULY 3, 2025',
      time: '9:00 AM',
      status: 'scheduled'
    }
  ]);

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
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">MY QUEUES</h1>
          <Link 
            href="/generate/step1" 
            className="bg-black text-white px-4 py-2 text-sm"
          >
            + NEW QUEUE
          </Link>
        </div>
        
        {queues.length > 0 ? (
          <div className="space-y-4">
            {queues.map(queue => (
              <div key={queue.id} className="border border-black p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold">{queue.name}</h2>
                    <p className="text-sm">{queue.address}</p>
                    <p className="text-sm mt-2">
                      <span className="font-bold">Schedule:</span> {queue.time} on {queue.date}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs px-2 py-1 ${
                      queue.status === 'active' ? 'bg-black text-white' : 'border border-black'
                    }`}>
                      {queue.status.toUpperCase()}
                    </span>
                    <Link 
                      href={`/queue/${queue.id}`} 
                      className="mt-4 text-sm underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p>No queues found. Create your first queue!</p>
          </div>
        )}
      </main>
    </div>
  );
}

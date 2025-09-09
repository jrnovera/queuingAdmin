'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import BurgerMenu from '../components/BurgerMenu';
import NotificationButton from '../components/notificationButton';
import NotificationsDrawer from '../components/NotificationsDrawer';
import { observer } from 'mobx-react-lite';
import { notificationsStore } from '../stores/notificationsStore';

const DashboardPage: React.FC = observer(function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);
  
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

  // Helper: parse dates like 'JULY 3, 2025' to a Date
  const parseMonthNameDate = (s: string): Date | null => {
    if (!s) return null;
    const parts = s.trim().split(/\s+/); // [MONTH, DAY,, YEAR]
    if (parts.length < 3) return null;
    const monthName = parts[0].toUpperCase();
    const dayStr = parts[1].replace(',', '');
    const yearStr = parts[2];
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    const m = months.indexOf(monthName);
    const d = Number(dayStr);
    const y = Number(yearStr);
    if (m < 0 || !d || !y) return null;
    return new Date(y, m, d);
  };

  // Filter to only today's queues (by local date)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const todayQueues = queues.filter(q => {
    const dt = parseMonthNameDate(q.date);
    return !!dt && dt >= start && dt < end;
  });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Open notifications drawer
  const openNotifications = () => {
    setNotifOpen(true);
    notificationsStore.markAllRead();
    setHasUnread(false);
  };

  // Start MobX notifications listener on mount
  useEffect(() => {
    try {
      notificationsStore.startListening();
      setNotifLoading(false);
    } catch (e) {
      console.error('Failed to start notifications listener:', e);
      setNotifLoading(false);
    }
    return () => notificationsStore.stopListening();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with burger menu and notification */}
      <header className="relative z-40 flex justify-between items-center p-4 border-b border-gray-200">
        <button 
          onClick={toggleMenu}
          className="text-3xl focus:outline-none"
          aria-label="Menu"
        >
          ☰
        </button>
       
        <NotificationButton onClick={openNotifications} hasUnread={notificationsStore.hasUnread} />
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
        
        {todayQueues.length > 0 ? (
          <div className="space-y-4">
            {todayQueues.map(queue => (
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
            <p>No queues scheduled for today.</p>
          </div>
        )}
      </main>
      <NotificationsDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notificationsStore.notifications}
        loading={notifLoading}
      />
    </div>
  );
});

export default DashboardPage;

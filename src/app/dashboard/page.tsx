'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BurgerMenu from '../components/BurgerMenu';
import NotificationButton from '../components/notificationButton';
import NotificationsDrawer, { AppNotification } from '../components/NotificationsDrawer';
import { collectionGroup, limit, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [lastClearedAt, setLastClearedAt] = useState<Date | null>(null);
  
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

  // Open notifications drawer
  const openNotifications = () => {
    setNotifOpen(true);
    setHasUnread(false);
    // Mark all as read: anything older than now will not show
    setLastClearedAt(new Date());
  };

  // Subscribe to join events across all queues via collection group
  useEffect(() => {
    // Adjust 'registrations' to the actual subcollection name for joins if different
    try {
      const q = query(
        collectionGroup(db, 'registrations'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const unsub = onSnapshot(q, (snap) => {
        const items: AppNotification[] = snap.docs.map((d) => {
          const data = d.data() as any;
          const actor = data.displayName || data.name || 'Someone';
          const queueName = data.queueName || data.name_of_queue || data.type || 'queue';
          const createdAtTs: Timestamp | undefined = (data.createdAt as Timestamp) || (data.time_in as Timestamp) || undefined;
          const createdAt: Date | undefined = createdAtTs ? createdAtTs.toDate() : undefined;
          const message = `${actor} registered in the ${queueName.toUpperCase()} queue.`;
          return {
            id: d.id,
            actorName: actor,
            queueName,
            message,
            createdAt,
          } as AppNotification;
        })
        // filter out items at or before lastClearedAt to show empty when user clicks
        .filter(it => !lastClearedAt || (it.createdAt instanceof Date && it.createdAt > lastClearedAt));
        setNotifications(items);
        setNotifLoading(false);
        if (!notifOpen && items.length > 0) setHasUnread(true);
      }, (err) => {
        console.error('Notifications listener error:', err);
        setNotifLoading(false);
      });
      return () => unsub();
    } catch (e) {
      console.error('Failed to init notifications listener:', e);
      setNotifLoading(false);
    }
  }, [notifOpen, lastClearedAt]);

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
       
        <NotificationButton onClick={openNotifications} hasUnread={hasUnread} />
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
      <NotificationsDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        loading={notifLoading}
      />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NotificationButton from '../components/notificationButton';
import BurgerMenu from '../components/BurgerMenu';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import NotificationsDrawer, { AppNotification } from '../components/NotificationsDrawer';
import { collectionGroup, limit, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [lastClearedAt, setLastClearedAt] = useState<Date | null>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const openNotifications = () => {
    setNotifOpen(true);
    setHasUnread(false);
    setLastClearedAt(new Date());
  };

  useEffect(() => {
    try {
      const q = query(
        collectionGroup(db, 'registrations'),
        limit(100)
      );
      const unsub = onSnapshot(q, (snap) => {
        const items: AppNotification[] = snap.docs
          .map(d => {
            const data = d.data() as any;
            const actor = data.displayName || data.name || 'Someone';
            const queueName = data.queueName || data.name_of_queue || data.type || 'queue';
            const createdAtTs: Timestamp | undefined = (data.createdAt as Timestamp) || (data.time_in as Timestamp) || undefined;
            const createdAt: Date | undefined = createdAtTs ? createdAtTs.toDate() : undefined;
            return {
              id: d.id,
              actorName: actor,
              queueName,
              message: `${actor} registered in the ${queueName.toUpperCase()} queue.`,
              createdAt,
            } as AppNotification;
          })
          .sort((a, b) => {
            const toMillis = (x?: Date | Timestamp) => (!x ? 0 : x instanceof Timestamp ? x.toDate().getTime() : x.getTime());
            const at = toMillis(a.createdAt);
            const bt = toMillis(b.createdAt);
            return bt - at;
          })
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
    <ProtectedRoute>
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

        <div className="border border-black p-2 mb-6 mt-6">
          <Link href="/generate/step1" className="text-black px-8 py-3 rounded text-lg">
            GENERATE NOW
          </Link>
        </div>
        
        
      </main>
      <NotificationsDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        loading={notifLoading}
      />
      </div>
    </ProtectedRoute>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getQueuesByUser } from '../firebase/firestore';
import type { Queue } from '../types/queue';
import { QRCodeCanvas } from 'qrcode.react';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState<Queue[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const data = await getQueuesByUser(user.uid);
      // sort newest first by createdAt
      const sorted = [...data].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setQueues(sorted);
      setLoading(false);
    };
    load();
  }, [user]);

  const goBack = () => router.replace('/home');

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    return `${time} / ${date}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            type="button"
            onClick={goBack}
            className="w-7 h-7 bg-black text-white flex items-center justify-center"
            aria-label="Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold tracking-wide">HISTORY</h1>
        </div>

        <div className="space-y-4">
          {queues.map((q) => (
            <div key={q.queueId || q.queueName} className="border border-black flex items-center p-3">
              <div className="mr-3 flex-shrink-0">
                <QRCodeCanvas value={q.queueId || q.queueName} size={56} bgColor="#ffffff" fgColor="#000000" includeMargin={false} />
              </div>
              <div className="flex-1 text-black">
                <div className="font-semibold uppercase tracking-wide">{q.queueName || 'Untitled Queue'}</div>
                <div className="text-sm">{q.address || ''}</div>
                <div className="text-sm">{formatDateTime(q.dateTime) || ''}</div>
              </div>
            </div>
          ))}

          {queues.length === 0 && (
            <div className="text-center italic text-gray-500 py-8">No history yet</div>
          )}

          {queues.length > 0 && (
            <div className="text-center italic text-gray-500 py-4">end of the results</div>
          )}
        </div>
      </div>
    </div>
  );
}

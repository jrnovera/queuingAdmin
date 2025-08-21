'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function ManageQueuesPage() {
  // queuesList item type
  type QueueListItem = {
    id: string;
    address: string;
    index1: number;
    name: string;
    schedule?: Timestamp;
    status?: string;
    time_in?: Timestamp;
    type?: string;
    uid: string;
  };

  const [queues, setQueues] = useState<QueueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();
  const navigatingAway = useRef(false);

  useEffect(() => {
    if (!user) {
      // Prevent redirect to /auth when user intentionally navigates back/home
      if (navigatingAway.current) return;
      router.push('/auth');
      return;
    }
    fetchQueues();
  }, [user]);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      // Fetch ALL from queuesList collection
      const querySnapshot = await getDocs(collection(db, 'queuesList'));
      const queuesData: QueueListItem[] = querySnapshot.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          address: data.address || '',
          index1: typeof data.index1 === 'number' ? data.index1 : Number(data.index1) || 0,
          name: data.name || '',
          schedule: data.schedule as Timestamp | undefined,
          status: data.status,
          time_in: data.time_in as Timestamp | undefined,
          type: data.type,
          uid: data.uid || ''
        };
      });
      setQueues(queuesData);
    } catch (error) {
      console.error('Error fetching queues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this queue? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'queuesList', id));
      setQueues(queues.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting queue:', error);
    }
  };

  const formatTimestamp = (ts?: Timestamp) => {
    if (!ts) return '';
    const d = ts.toDate();
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Export current table view as CSV ("Download as File")
  const downloadAsFile = () => {
    const filtered = filteredQueues;
    const csvRows = [
      ['Queue No.', 'Name', 'Time In'],
      ...filtered.map((q, idx) => [
        String(idx + 1),
        q.name,
        formatTimestamp(q.time_in) || formatTimestamp(q.schedule)
      ])
    ];
    const csvContent = csvRows.map(r => r.map(f => `"${String(f).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manage-queues-${activeCategory.toLowerCase().replace(/\s+/g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derive category names and update default active when queues change
  const tabLabels = Array.from(new Set(queues.map(q => q.type || ''))).filter(Boolean);
  useEffect(() => {
    // Ensure activeCategory is valid; set to first available type if empty/invalid
    if (tabLabels.length === 0) {
      setActiveCategory('');
    } else if (!activeCategory || !tabLabels.includes(activeCategory)) {
      setActiveCategory(tabLabels[0]);
    }
  }, [tabLabels.join('|')]);

  // Filter queues by active category (show all if no active type)
  const filteredQueues = !activeCategory
    ? queues
    : queues.filter(q => (q.type || '') === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-1/3 mb-6"></div>
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-300"></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 border-t border-gray-300">
                  <div className="h-4 bg-gray-200 w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header - Institutional style */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                navigatingAway.current = true;
                router.replace('/');
              }}
              className="w-7 h-7 bg-black text-white flex items-center justify-center"
              aria-label="Go to homepage"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold tracking-wide">MANAGE QUEUES</h1>
          </div>
          <div className="flex items-start space-x-4">
            <div className="border border-gray-400 px-4 py-2 text-right">
              <div className="text-xs font-semibold">SOUTHERN LUZON STATE UNIVERSITY - CATANAUAN EXTENSION</div>
              <div className="text-xs text-gray-600">BRGY SAN ANTONIO PALA, CATANAUAN, QUEZON</div>
            </div>
            <div className="w-16 h-16 border-2 border-gray-400 flex items-center justify-center">
              <span className="text-[10px] text-gray-600">QR</span>
            </div>
          </div>
        </div>

        {/* Tabs-like section header */}
        <div className="flex items-end border border-gray-800" role="tablist" aria-label="Queue categories">
          {tabLabels.length === 0 ? (
            <div className="text-sm font-semibold px-4 py-2">CATEGORIES</div>
          ) : (
            tabLabels.map((name, idx) => (
              <button
                key={name}
                role="tab"
                aria-selected={activeCategory === name}
                onClick={() => setActiveCategory(name)}
                className={(activeCategory === name
                  ? 'bg-black text-white px-4 py-2'
                  : 'px-4 py-1 border-l border-b border-gray-800 hover:bg-gray-50') + (idx === 0 ? '' : '')}
              >
                {name.toUpperCase()}
              </button>
            ))
          )}
        </div>

        {/* Table */}
        <div className="border border-t-0 border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="w-28 text-left text-xs font-semibold tracking-wider px-3 py-2">QUEUE NO.</th>
                  <th className="text-left text-xs font-semibold tracking-wider px-3 py-2">NAME</th>
                  <th className="w-40 text-left text-xs font-semibold tracking-wider px-3 py-2">TIME IN</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueues.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-gray-500">No queues yet. Create a new queue to get started.</td>
                  </tr>
                ) : (
                  filteredQueues.map((queue, idx) => (
                    <tr key={queue.id} className="border-t border-gray-300 hover:bg-gray-50">
                      <td className="px-3 py-2 align-top text-sm">{idx + 1}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="text-sm font-medium">{queue.name}</div>
                        <div className="text-xs text-gray-600">{queue.address}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-sm">{formatTimestamp(queue.time_in) || formatTimestamp(queue.schedule)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={downloadAsFile} className="px-4 py-2 bg-black text-white text-sm">DOWNLOAD AS FILE</button>
          
        </div>
      </div>
    </div>
  );
}


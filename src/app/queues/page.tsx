'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, deleteDoc, doc, Timestamp, onSnapshot, query, where } from 'firebase/firestore';
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
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  
  // User access control state
  const [userQueues, setUserQueues] = useState<string[]>([]);
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [userAccessLoading, setUserAccessLoading] = useState(true);
  
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
  }, [user, router]);

  const fetchQueues = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('Fetching queues data...');
      // Fetch ALL from queuesList collection
      const querySnapshot = await getDocs(collection(db, 'queuesList'));
      const queuesData: QueueListItem[] = querySnapshot.docs.map(d => {
        interface QueueData {
          address?: string;
          index1?: number | string;
          name?: string;
          schedule?: Timestamp;
          status?: string;
          time_in?: Timestamp;
          type?: string;
          uid?: string;
        }
        const data = d.data() as QueueData;
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
      
      console.log('Fetched queues data:', queuesData);
      setQueues(queuesData);
    } catch (error) {
      console.error('Error fetching queues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchQueues(true);
  };

  // Fetch queues where user is the creator
  const fetchUserCreatedQueues = async (): Promise<string[]> => {
    if (!user?.uid) return [];
    
    try {
      const queuesSnapshot = await getDocs(
        query(collection(db, 'queues'), where('createdBy', '==', user.uid))
      );
      return queuesSnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching user created queues:', error);
      return [];
    }
  };

  // Fetch categories where user is invited staff
  const fetchUserInvitedCategories = async (): Promise<{queueIds: string[], categoryNames: string[]}> => {
    if (!user?.email) return { queueIds: [], categoryNames: [] };
    
    try {
      const categoriesSnapshot = await getDocs(
        query(collection(db, 'categories'), where('invitedStaff', 'array-contains', user.email))
      );
      
      const queueIds: string[] = [];
      const categoryNames: string[] = [];
      
      categoriesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.queueId) queueIds.push(data.queueId);
        if (data.name) categoryNames.push(data.name);
      });
      
      return { queueIds, categoryNames };
    } catch (error) {
      console.error('Error fetching user invited categories:', error);
      return { queueIds: [], categoryNames: [] };
    }
  };

  // Update user access data
  const updateUserAccess = async () => {
    if (!user) {
      setUserQueues([]);
      setUserCategories([]);
      setUserAccessLoading(false);
      return;
    }

    try {
      setUserAccessLoading(true);
      console.log('Updating user access for:', user.uid, user.email);
      
      // Fetch both creator queues and invited categories in parallel
      const [createdQueueIds, invitedData] = await Promise.all([
        fetchUserCreatedQueues(),
        fetchUserInvitedCategories()
      ]);
      
      // Combine all accessible queue IDs
      const allAccessibleQueueIds = [...new Set([...createdQueueIds, ...invitedData.queueIds])];
      
      console.log('User accessible data:', {
        createdQueues: createdQueueIds,
        invitedQueues: invitedData.queueIds,
        invitedCategories: invitedData.categoryNames,
        allAccessibleQueues: allAccessibleQueueIds
      });
      
      setUserQueues(allAccessibleQueueIds);
      setUserCategories(invitedData.categoryNames);
    } catch (error) {
      console.error('Error updating user access:', error);
      setUserQueues([]);
      setUserCategories([]);
    } finally {
      setUserAccessLoading(false);
    }
  };

  // Real-time listeners for queuesList, queues, and categories changes
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listeners...');
    
    // Listener for queuesList changes
    const queuesListRef = collection(db, 'queuesList');
    const queuesListQuery = query(queuesListRef);
    
    const unsubscribeQueuesList = onSnapshot(queuesListQuery, 
      (querySnapshot) => {
        console.log('QueuesList data changed, updating...', querySnapshot.docs.length, 'documents');
        
        const queuesData: QueueListItem[] = querySnapshot.docs.map(d => {
          interface QueueData {
            address?: string;
            index1?: number | string;
            name?: string;
            schedule?: Timestamp;
            status?: string;
            time_in?: Timestamp;
            type?: string;
            uid?: string;
          }
          const data = d.data() as QueueData;
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
        
        console.log('Updated queuesList data:', queuesData);
        setQueues(queuesData);
        setLoading(false);
      }, 
      (error) => {
        console.error('Error listening to queuesList:', error);
        setLoading(false);
      }
    );

    // Listener for queues changes (affects user access)
    const queuesRef = collection(db, 'queues');
    const queuesQuery = query(queuesRef, where('createdBy', '==', user.uid));
    
    const unsubscribeQueues = onSnapshot(queuesQuery, 
      (querySnapshot) => {
        console.log('Queues data changed, updating user access...');
        updateUserAccess();
      }, 
      (error) => {
        console.error('Error listening to queues:', error);
      }
    );

    // Listener for categories changes (affects user access)
    const categoriesRef = collection(db, 'categories');
    const categoriesQuery = query(categoriesRef, where('invitedStaff', 'array-contains', user.email || ''));
    
    const unsubscribeCategories = onSnapshot(categoriesQuery, 
      (querySnapshot) => {
        console.log('Categories data changed, updating user access...');
        updateUserAccess();
      }, 
      (error) => {
        console.error('Error listening to categories:', error);
      }
    );

    // Initial user access update
    updateUserAccess();

    return () => {
      console.log('Cleaning up listeners...');
      unsubscribeQueuesList();
      unsubscribeQueues();
      unsubscribeCategories();
    };
  }, [user]);

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

  // Filter queues by user access first, then by selected date
  const userAccessibleQueues = queues.filter(q => {
    // Check if this queue entry belongs to a queue the user has access to
    // We need to determine which queue this entry belongs to based on the type field
    // The type field should match a category name from user's accessible queues
    return userCategories.includes(q.type || '');
  });

  // Filter user-accessible queues by selected date
  // Match if EITHER time_in OR schedule falls on the selected date
  const dateFilteredQueues = selectedDate ? userAccessibleQueues.filter(q => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    if (!y || !m || !d) return true;
    const start = new Date(y, m - 1, d);
    const end = new Date(y, m - 1, d + 1);

    const inRange = (ts?: Timestamp) => {
      if (!ts) return false;
      const dt = ts.toDate();
      return dt >= start && dt < end;
    };

    return inRange(q.time_in) || inRange(q.schedule);
  }) : userAccessibleQueues;

  // Derive category names from user-accessible, date-filtered queues
  const tabLabels = Array.from(new Set(dateFilteredQueues.map(q => q.type || ''))).filter(Boolean);
  
  useEffect(() => {
    // Ensure activeCategory is valid; set to first available type if empty/invalid
    if (tabLabels.length === 0) {
      setActiveCategory('');
    } else if (!activeCategory || !tabLabels.includes(activeCategory)) {
      setActiveCategory(tabLabels[0]);
    }
  }, [tabLabels, activeCategory, selectedDate]);

  // Filter queues by active category from the date-filtered queues
  const filteredQueues = !activeCategory
    ? dateFilteredQueues
    : dateFilteredQueues.filter(q => (q.type || '') === activeCategory);

  // Debug effect to monitor filtered queues changes
  useEffect(() => {
    console.log('Filtered queues updated:', {
      totalQueues: queues.length,
      userAccessibleQueues: userAccessibleQueues.length,
      dateFilteredQueues: dateFilteredQueues.length,
      filteredQueues: filteredQueues.length,
      userQueues: userQueues.length,
      userCategories: userCategories.length,
      activeCategory,
      selectedDate,
      userAccessLoading
    });
  }, [queues, userAccessibleQueues, dateFilteredQueues, filteredQueues, userQueues, userCategories, activeCategory, selectedDate, userAccessLoading]);


  if (loading || userAccessLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-1/3 mb-6"></div>
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
                {userAccessLoading ? 'Loading your accessible queues...' : 'Loading...'}
              </div>
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

        {/* Tabs-like section header with horizontal scroll */}
        <div className="border border-gray-800">
          <div className="flex items-end">
            {/* Scrollable tabs container */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-end min-w-max">
                {tabLabels.length === 0 ? (
                  <div className="text-sm font-semibold px-4 py-2">CATEGORIES</div>
                ) : (
                  <>
                    {/* Show count of tabs if many */}
                    {tabLabels.length > 8 && (
                      <div className="text-xs text-gray-500 px-2 py-2 self-center">
                        {tabLabels.length} categories
                      </div>
                    )}
                    {tabLabels.map((name, idx) => (
                      <button
                        key={name}
                        role="tab"
                        aria-selected={activeCategory === name}
                        onClick={() => setActiveCategory(name)}
                        className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors ${
                          activeCategory === name
                            ? 'bg-black text-white'
                            : 'text-gray-700 hover:bg-gray-100 border-l border-b border-gray-800'
                        } ${idx === 0 ? 'border-l-0' : ''}`}
                        style={{ 
                          minWidth: 'fit-content',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={name} // Show full name on hover
                      >
                        {name.length > 15 ? `${name.substring(0, 15)}...` : name.toUpperCase()}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            {/* Date filter - fixed position */}
            <div className="flex items-center gap-2 px-3 py-2 border-l border-gray-800 bg-white flex-shrink-0">
              <label className="text-xs font-semibold whitespace-nowrap" htmlFor="dateFilter">DATE</label>
              <input
                id="dateFilter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-800 text-xs px-2 py-1"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="text-xs underline whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table or Empty State (hide header if empty) */}
        {filteredQueues.length === 0 ? (
          <div className="border border-t-0 border-gray-800 p-8 text-center text-gray-500">
            {userQueues.length === 0 && userCategories.length === 0 ? (
              <div>
                <p className="text-lg font-medium mb-2">No accessible queues found</p>
                <p className="text-sm">You haven't created any queues or been invited to any queues yet.</p>
                <p className="text-sm mt-1">Create a new queue or wait for an invitation to get started.</p>
              </div>
            ) : selectedDate ? (
              'No queues for the selected date.'
            ) : (
              'No queue entries found in your accessible queues.'
            )}
          </div>
        ) : (
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
                  {filteredQueues.map((queue, idx) => (
                    <tr key={queue.id} className="border-t border-gray-300 hover:bg-gray-50">
                      <td className="px-3 py-2 align-top text-sm">{idx + 1}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="text-sm font-medium">{queue.name}</div>
                        <div className="text-xs text-gray-600">{queue.address}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-sm">{formatTimestamp(queue.time_in) || formatTimestamp(queue.schedule)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={downloadAsFile} className="px-4 py-2 bg-black text-white text-sm">DOWNLOAD AS FILE</button>
            <button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="px-4 py-2 bg-gray-600 text-white text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, deleteDoc, doc, Timestamp, onSnapshot, query, where, updateDoc, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function InvitationsPage() {
  // Invitation item type
  type InvitationItem = {
    id: string;
    categoryId: string;
    categoryName: string;
    categoryLimit: string;
    categoryTimeLimit: string;
    invitedEmail: string;
    invitedUserId: string;
    invitedUserDisplayName: string;
    inviterUserId: string;
    inviterEmail: string;
    queueId: string;
    queueName: string;
    queueAddress: string;
    status: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  };

  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Real-time listener for invitations
  useEffect(() => {
    if (!user) {
        console.log("user not found");
        return
    };

    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('invitedUserId', '==', user.uid),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(invitationsQuery, (querySnapshot) => {
      const invitationsData: InvitationItem[] = querySnapshot.docs.map(d => {
        console.log("d:",JSON.stringify(d, null, 2));
        const data = d.data();
        return {
          id: d.id,
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          categoryLimit: data.categoryLimit || '',
          categoryTimeLimit: data.categoryTimeLimit || '',
          invitedEmail: data.invitedEmail || '',
          invitedUserId: data.invitedUserId || '',
          invitedUserDisplayName: data.invitedUserDisplayName || '',
          inviterUserId: data.inviterUserId || '',
          inviterEmail: data.inviterEmail || '',
          queueId: data.queueId || '',
          queueName: data.queueName || '',
          queueAddress: data.queueAddress || '',
          status: data.status || 'pending',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });
      
      // Sort by createdAt in descending order (newest first)
      const sortedInvitations = invitationsData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
      
      setInvitations(sortedInvitations);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to invitations:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle reject invitation
  const handleRejectInvitation = async (invitationId: string) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      console.log('Invitation rejected successfully');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation. Please try again.');
    }
  };

  // Handle accept invitation
  const handleAcceptInvitation = async (invitation: InvitationItem) => {
    try {
      // First, update invitation status to accepted
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // Get the highest index1 value from queuesList
      const queuesSnapshot = await getDocs(collection(db, 'queuesList'));
      let highestIndex = 0;
      queuesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const index1 = typeof data.index1 === 'number' ? data.index1 : Number(data.index1) || 0;
        if (index1 > highestIndex) {
          highestIndex = index1;
        }
      });

      // Fetch queue data to get the date field
      const queueDoc = await getDocs(query(collection(db, 'queues'), where('__name__', '==', invitation.queueId)));
      let scheduleDate = new Date();
      if (!queueDoc.empty) {
        const queueData = queueDoc.docs[0].data();
        scheduleDate = queueData.dateTime ? new Date(queueData.dateTime) : new Date();
      }

      // Create new document in queuesList
      const newQueueItem = {
        address: invitation.queueAddress,
        index1: highestIndex + 1,
        name: invitation.invitedUserDisplayName,
        schedule: Timestamp.fromDate(scheduleDate),
        status: 'pending',
        time_in: serverTimestamp(),
        type: invitation.categoryName,
        uid: invitation.invitedUserId,
        queueId: invitation.queueId,
        categoryId: invitation.categoryId
      };

      await addDoc(collection(db, 'queuesList'), newQueueItem);
      console.log('Invitation accepted and queue item created successfully');
      alert('Invitation accepted successfully! You have been added to the queue.');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
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
            <h1 className="text-2xl font-bold tracking-wide">INVITATIONS</h1>
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

        {/* Invitations Table or Empty State */}
        {invitations.length === 0 ? (
          <div className="border border-gray-800 p-8 text-center text-gray-500">
            No pending invitations.
          </div>
        ) : (
          <div className="border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs font-semibold tracking-wider px-3 py-2">QUEUE NAME</th>
                    <th className="text-left text-xs font-semibold tracking-wider px-3 py-2">CATEGORY</th>
                    <th className="text-left text-xs font-semibold tracking-wider px-3 py-2">INVITED BY</th>
                    <th className="text-left text-xs font-semibold tracking-wider px-3 py-2">INVITED AT</th>
                    <th className="w-32 text-left text-xs font-semibold tracking-wider px-3 py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="border-t border-gray-300 hover:bg-gray-50">
                      <td className="px-3 py-2 align-top">
                        <div className="text-sm font-medium">{invitation.queueName}</div>
                        <div className="text-xs text-gray-600">{invitation.queueAddress}</div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="text-sm font-medium">{invitation.categoryName}</div>
                        <div className="text-xs text-gray-600">Limit: {invitation.categoryLimit} | Time: {invitation.categoryTimeLimit}</div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="text-sm font-medium">{invitation.inviterEmail}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-sm">
                        {formatTimestamp(invitation.createdAt)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptInvitation(invitation)}
                            className="bg-green-600 text-white px-3 py-1 text-xs hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectInvitation(invitation.id)}
                            className="bg-red-600 text-white px-3 py-1 text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

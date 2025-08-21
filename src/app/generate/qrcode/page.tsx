'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueueContext } from '../../context/QueueContext';
import QRCode from '../../components/QRCode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useSearchParams } from 'next/navigation';
import { getQueueById } from '../../firebase/firestore';
import { Queue } from '../../types/queue';
import { useAuth } from '../../context/AuthContext';

export default function QRCodeDisplayPage() {
  const { queueData, getQueue } = useQueueContext();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const queueId = searchParams.get('id');
  const { user } = useAuth();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formatTimeDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return `${time} / ${date}`;
  };
  
  useEffect(() => {
    async function fetchQueue() {
      if (!queueId) {
        setError('No queue ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const fetchedQueue = await getQueue(queueId);
        if (fetchedQueue) {
          setQueue(fetchedQueue);
        } else {
          setError('Queue not found');
        }
      } catch (err) {
        console.error('Error fetching queue:', err);
        setError('Error loading queue data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchQueue();
  }, [queueId, getQueue]);

  // This function will be replaced by the one below
  
  // Share QR code functionality
  const handleShareQR = () => {
    if (!queue) return;
    
    if (navigator.share) {
      navigator.share({
        title: queue.queueName || 'Queue QR Code',
        text: `Join the queue at ${queue.address} on ${new Date(queue.dateTime).toLocaleDateString()}`,
        // url: would be a shareable link in a real app
      }).catch(err => {
        console.error('Error sharing:', err);
        alert('Could not share QR code. You can download it instead.');
      });
    } else {
      alert('Sharing is not available on this device. You can download the QR code instead.');
    }
  };

  // Handle download QR with the current queue data
  const handleDownloadQR = async () => {
    if (!qrContainerRef.current || !queue) return;
    
    try {
      // Create canvas from the QR container
      const canvas = await html2canvas(qrContainerRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#ffffff'
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // PDF dimensions
      const imgWidth = 210 - 40; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(`${queue.queueName || 'Queue'}-QR-${today.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-black border-r-gray-200 border-b-gray-200 border-l-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading queue data...</p>
        </div>
      </div>
    );
  }

  if (error || !queue) {
    return (
      <div className="min-h-screen p-6">
        <Link href="/home" className="inline-block mb-6 text-black">
          ← BACK TO HOME
        </Link>
        
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="bg-red-50 border border-red-200 p-6 rounded">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p>{error || 'Queue data not available'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Link href="/home" className="inline-block mb-6 text-black">
        ← BACK TO HOME
      </Link>
      
      <div className="max-w-4xl mx-auto mt-8 text-center">
        {/* QR Code Display Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8" ref={qrContainerRef}>
          {/* Left side - QR Code */}
          <div className="p-4 bg-white">
            <QRCode 
              size={250} 
              data={queue.queueId || 'no-id'}
              queueName={queue.queueName || 'Your Queue'}
              location={queue.address || 'Location'}
            />
          </div>
          
          {/* Right side - Institution Info */}
          <div className="border-2 border-black p-6 flex-1 text-left">
            <h2 className="text-lg font-bold mb-1">{queue.queueName}</h2>
            <p className="text-sm">{queue.address}</p>
            <p className="mt-4 text-sm">Scheduled: {formatTimeDate(queue.dateTime)}</p>
            <p className="text-sm">Valid until: {new Date(queue.expiration).toLocaleString()}</p>
            {queue.breakTimeFrom && queue.breakTimeTo && (
              <p className="text-sm">Break time: {queue.breakTimeFrom} - {queue.breakTimeTo}</p>
            )}
            <p className="mt-4 text-sm font-bold">Queue ID: {queue.queueId}</p>
          </div>
        </div>
        
        {/* Categories Section */}
        <div className="mt-8 border border-gray-300 p-4">
          <h3 className="font-bold mb-2 text-left">Categories:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queue.categories.map((category, index) => (
              <div key={index} className="border border-gray-200 p-3 text-left">
                <h4 className="font-bold">{category.name}</h4>
                <p className="text-sm">Limit: {category.limit} people</p>
                <p className="text-sm">Time Limit: {category.timeLimit}</p>
                {category.invitedStaff && category.invitedStaff.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold">Staff:</p>
                    <ul className="text-xs">
                      {category.invitedStaff.map((staff, idx) => (
                        <li key={idx}>{staff}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Notes Section */}
        {queue.notes && (
          <div className="mt-4 border border-gray-300 p-4 text-left">
            <h3 className="font-bold mb-2">Notes:</h3>
            <p className="text-sm">{queue.notes}</p>
          </div>
        )}
        
        {/* Download Button */}
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={handleDownloadQR}
            className="bg-black text-white px-8 py-3 inline-block"
          >
            DOWNLOAD QR
          </button>
          
          <button 
            onClick={handleShareQR}
            className="bg-gray-800 text-white px-8 py-3 inline-block"
          >
            SHARE
          </button>
        </div>
      </div>
    </div>
  );
}

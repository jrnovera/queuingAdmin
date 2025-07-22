'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useQueueContext } from '../../context/QueueContext';
import QRCode from '../../components/QRCode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function QRCodeDisplayPage() {
  const { queueData } = useQueueContext();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Generate a PDF with the QR code
  const handleDownloadQR = async () => {
    if (!qrContainerRef.current) return;
    
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
      pdf.save(`${queueData.queueName || 'Queue'}-QR-${today.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    }
  };
  
  // Share QR code functionality
  const handleShareQR = () => {
    if (navigator.share) {
      navigator.share({
        title: queueData.queueName || 'Queue QR Code',
        text: `Join the queue at ${queueData.address} on ${queueData.scheduleDate}`,
        // url: would be a shareable link in a real app
      }).catch(err => {
        console.error('Error sharing:', err);
        alert('Could not share QR code. You can download it instead.');
      });
    } else {
      alert('Sharing is not available on this device. You can download the QR code instead.');
    }
  };

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
              queueName={queueData.queueName || 'Your Queue'}
              location={queueData.address || 'Location'}
            />
          </div>
          
          {/* Right side - Institution Info */}
          <div className="border-2 border-black p-6 flex-1 text-left">
            <h2 className="text-lg font-bold mb-1">{queueData.queueName || 'SOUTHERN LUZON STATE UNIVERSITY'}</h2>
            <p className="text-sm">{queueData.address || 'BRGY SAN ANTONIO PALA, CATANAUAN, QUEZON'}</p>
            <p className="mt-4 text-sm">Generated on: {formattedDate}</p>
            <p className="text-sm">Valid for today only</p>
          </div>
        </div>
        
        {/* Download Button */}
        <button 
          onClick={handleDownloadQR}
          className="bg-black text-white px-8 py-3 mt-8 inline-block"
        >
          DOWNLOAD
        </button>
        
      </div>
    </div>
  );
}

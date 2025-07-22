'use client';

import React from 'react';
import NextButton from '../../components/NextButton';
import { useQueueContext } from '../../context/QueueContext';
import Link from 'next/link';

export default function QueueSuccessPage() {
  return (
    <div className="min-h-screen p-6">
      <NextButton href="/home" text="BACK TO HOME" />
      
      <div className="max-w-md mx-auto mt-8 text-center">
        <div className="border border-black rounded-lg p-8 mb-6">
          <div className="font-bold mb-2">GENERATING QR CODE</div>
          <div className="w-24 h-24 mx-auto border-4 border-black rounded-full flex items-center justify-center mb-2">
            <span className="text-4xl">✓</span>
          </div>
          <div className="font-bold">SUCCESSFUL!</div>
        </div>
        
        <Link 
          href="/generate/qrcode" 
          className="bg-black text-white px-8 py-3 rounded inline-block"
        >
          NEXT
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import NextButton from '../../components/NextButton';
import QueueFormField from '../../components/QueueFormField';
import { useQueueContext } from '../../context/QueueContext';

export default function QueueStep2Page() {
  const { queueData, updateQueueData } = useQueueContext();
  const [expirationDate, setExpirationDate] = useState(queueData.expirationDate || 'JULY 2, 2025');

  // Handle form field changes
  const handleExpirationTimeChange = (value: string) => {
    updateQueueData({ expirationTime: value });
  };

  const handleExpirationDateChange = (value: string) => {
    updateQueueData({ expirationDate: value });
    setExpirationDate(value);
  };

  const handleBreakTimeStartChange = (value: string) => {
    updateQueueData({ breakTimeStart: value });
  };

  const handleBreakTimeEndChange = (value: string) => {
    updateQueueData({ breakTimeEnd: value });
  };

  return (
    <div className="min-h-screen p-6">
      <BackButton href="/generate/step1" text="GENERATE NOW" />
      
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4 mb-6">
            <div className="w-1/3 bg-black h-11 text-white flex items-center justify-center">
                <h1>Set Qr Expiration : </h1>
            </div>
          <div className="w-1/3">
            <QueueFormField 
            showLabel={false}
              label="SET QR EXPIRATION"
              isDropdown
              value={queueData.expirationTime}
              onChange={handleExpirationTimeChange}
              options={[
                { value: '1:00 PM', label: '1:00 PM' },
                { value: '2:00 PM', label: '2:00 PM' },
                { value: '3:00 PM', label: '3:00 PM' },
                { value: '4:00 PM', label: '4:00 PM' },
                { value: '5:00 PM', label: '5:00 PM' },

                { value: '6:00 PM', label: '6:00 PM' },
                { value: '7:00 PM', label: '7:00 PM' },
                { value: '8:00 PM', label: '8:00 PM' },
                { value: '9:00 PM', label: '9:00 PM' },
                { value: '10:00 PM', label: '10:00 PM' },
                { value: '11:00 PM', label: '11:00 PM' },





              ]}
            />
            <div className="text-center text-sm text-gray-600 mt-1">TIME</div>
          </div>
          
          <div className="w-1/3">
            <QueueFormField 
                  isDropdown
              showLabel={false}
              label=""
              value={expirationDate}
              onChange={handleExpirationDateChange}
              options={[
                { value: 'JULY 2, 2025', label: 'JULY 2, 2025' },
                { value: 'JULY 3, 2025', label: 'JULY 3, 2025' },
                { value: 'JULY 4, 2025', label: 'JULY 4, 2025' },
                { value: 'JULY 5, 2025', label: 'JULY 5, 2025' },
              ]}
            />
            <div className="text-center text-sm text-gray-600 mt-1">DATE</div>
          </div>
        </div>
        
        <div className="flex gap-4">
            <div className="w-1/3 border border-black p-2 bg-black h-11 text-white">
                <h1>Set Break Time : </h1>
            </div>
          <div className="w-1/3">
            <QueueFormField 
                  isDropdown
              showLabel={false}
              label=""
              value={queueData.breakTimeStart}
              onChange={handleBreakTimeStartChange}
              options={[
                { value: '12:00 PM', label: '12:00 PM' },
                { value: '1:00 PM', label: '1:00 PM' },
                { value: '2:00 PM', label: '2:00 PM' },
                { value: '3:00 PM', label: '3:00 PM' },
              ]}
            />
            <div className="text-center text-sm text-gray-600 mt-1">FROM</div>
          </div>
          
          <div className="w-1/3">
            <QueueFormField 
                  isDropdown
              showLabel={false}
              label=""
              value={queueData.breakTimeEnd}
              onChange={handleBreakTimeEndChange}
              options={[
                { value: '1:00 PM', label: '1:00 PM' },
                { value: '2:00 PM', label: '2:00 PM' },
                { value: '3:00 PM', label: '3:00 PM' },
                { value: '4:00 PM', label: '4:00 PM' },
              ]}
            />
            <div className="text-center text-sm text-gray-600 mt-1">TO</div>
          </div>
        </div>
        
        <NextButton href="/generate/step3" />
      </div>
    </div>
  );
}

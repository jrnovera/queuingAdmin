'use client';

import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import NextButton from '../../components/NextButton';
import QueueFormField from '../../components/QueueFormField';
import { useQueueContext } from '../../context/QueueContext';

export default function QueueStep2Page() {
  const { queueData, updateQueueData } = useQueueContext();
  
  // Format the date for display (e.g., "JULY 2, 2025")
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
  };
  
  // Generate a list of dates for the next 30 days starting from today
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formattedDate = formatDateForDisplay(date);
      dates.push({ value: formattedDate, label: formattedDate });
    }
    
    return dates;
  };
  
  const dateOptions = generateDateOptions();
  const [expirationDate, setExpirationDate] = useState(() => {
    if (queueData.expiration) {
      return formatDateForDisplay(new Date(queueData.expiration));
    }
    return formatDateForDisplay(new Date());
  });

  // Handle form field changes
  const handleExpirationTimeChange = (value: string) => {
    // Update expiration with new time
    const currentExpiration = queueData.expiration ? new Date(queueData.expiration) : new Date();
    const [time, period] = value.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    currentExpiration.setHours(hour24, parseInt(minutes), 0, 0);
    updateQueueData({ expiration: currentExpiration.toISOString() });
  };

  const handleExpirationDateChange = (value: string) => {
    setExpirationDate(value);
    // Parse the date and update expiration
    const [month, day, year] = value.split(/[\s,]+/).filter(Boolean);
    const newDate = new Date(`${month} ${day} ${year}`);
    
    // Preserve existing time if available
    const currentExpiration = queueData.expiration ? new Date(queueData.expiration) : new Date();
    newDate.setHours(currentExpiration.getHours(), currentExpiration.getMinutes(), 0, 0);
    
    updateQueueData({ expiration: newDate.toISOString() });
  };

  const handleBreakTimeStartChange = (value: string) => {
    updateQueueData({ breakTimeFrom: value });
  };

  const handleBreakTimeEndChange = (value: string) => {
    updateQueueData({ breakTimeTo: value });
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
              value={queueData.expiration ? new Date(queueData.expiration).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '1:00 PM'}
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
              options={dateOptions}
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
              value={queueData.breakTimeFrom}
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
              value={queueData.breakTimeTo}
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

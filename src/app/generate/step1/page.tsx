'use client';

import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import NextButton from '../../components/NextButton';
import QueueFormField from '../../components/QueueFormField';
import { useQueueContext } from '../../context/QueueContext';

export default function QueueStep1Page() {
  const { queueData, updateQueueData } = useQueueContext();
  const [selectedDate, setSelectedDate] = useState(queueData.scheduleDate || 'JULY 2, 2025');

  // Handle form field changes
  const handleQueueNameChange = (value: string) => {
    updateQueueData({ queueName: value });
  };

  const handleAddressChange = (value: string) => {
    updateQueueData({ address: value });
  };

  const handleTimeChange = (value: string) => {
    updateQueueData({ scheduleTime: value });
  };

  const handleDateChange = (value: string) => {
    updateQueueData({ scheduleDate: value });
    setSelectedDate(value);
  };

  return (
    <div className="min-h-screen p-6">
      <BackButton href="/home" text="GENERATE NOW" />
      
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-1 flex">
         <div className="w-1/3 border border-black p-2 bg-black h-12.5 text-white">
         <h1>QUEUE NAME</h1>
         </div>
         
         <div className="w-2/3">
          <QueueFormField 
            label="QUEUE NAME"
            placeholder="Type here..."
            showLabel={false}
            value={queueData.queueName}
          onChange={handleQueueNameChange}
          fullWidth
        />
        </div>
        </div>
        
        <div className="mb-1 flex">
        <div className="w-1/2 border border-black p-2 bg-black h-12.5 text-white">
        <h1>ADDRESS</h1>
        </div>
        <QueueFormField 
          label="ADDRESS"
          placeholder="Type here..."
          showLabel={false}
          value={queueData.address}
          onChange={handleAddressChange}
          fullWidth
        />
        </div>

        <div className="flex mb-1 gap-2">
            <div className="w-1/2 border border-black p-2 bg-black h-11.5 text-white">
                <h1>TIME:</h1>
                
            </div>
          <div className="w-1/2">
            <QueueFormField
            label="TIME"
            showLabel={false}
              isDropdown
              value={queueData.scheduleTime}
              onChange={handleTimeChange}
              options={[
                { value: '1:00 AM', label: '1:00 AM' },
                { value: '2:00 AM', label: '2:00 AM' },
                { value: '3:00 AM', label: '3:00 AM' },
                { value: '4:00 AM', label: '4:00 AM' },
                { value: '5:00 AM', label: '5:00 AM' },
                { value: '6:00 AM', label: '6:00 AM' },
                { value: '7:00 AM', label: '7:00 AM' },
                { value: '8:00 AM', label: '8:00 AM' },
                { value: '9:00 AM', label: '9:00 AM' },
                { value: '10:00 AM', label: '10:00 AM' },
                { value: '11:00 AM', label: '11:00 AM' },
                { value: '12:00 PM', label: '12:00 PM' },
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
           
          </div>
          
          <div className="w-1/2">
            <QueueFormField 
              label="DATE"
              isDropdown
              showLabel={false}
              value={selectedDate}
              onChange={handleDateChange}
              options={[
                { value: 'JULY 2, 2025', label: 'JULY 2, 2025' },
                { value: 'JULY 3, 2025', label: 'JULY 3, 2025' },
                { value: 'JULY 4, 2025', label: 'JULY 4, 2025' },
                { value: 'JULY 5, 2025', label: 'JULY 5, 2025' },
                // In a real app, this would be a calendar component
              ]}
            />
           
          </div>
        </div>
        
        <NextButton href="/generate/step2" />
      </div>
    </div>
  );
}

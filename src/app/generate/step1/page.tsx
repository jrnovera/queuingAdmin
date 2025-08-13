'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import NextButton from '../../components/NextButton';
import QueueFormField from '../../components/QueueFormField';
import { useQueueContext } from '../../context/QueueContext';

export default function QueueStep1Page() {
  const { queueData, updateQueueData } = useQueueContext();
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse existing dateTime if available, or use current date/time
  const existingDateTime = queueData.dateTime ? new Date(queueData.dateTime) : new Date();
  
  // Format the date for display (e.g., "JULY 2, 2025")
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
  };
  
  // Format the time for display (e.g., "1:00 PM")
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const [selectedDate, setSelectedDate] = useState(formatDateForDisplay(existingDateTime));
  const [selectedTime, setSelectedTime] = useState(formatTimeForDisplay(existingDateTime));
  
  // Generate a list of dates for the next 30 days
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

  // Handle form field changes
  const handleQueueNameChange = (value: string) => {
    updateQueueData({ queueName: value });
    // Clear error when user types
    if (errors.queueName) {
      setErrors(prev => ({ ...prev, queueName: '' }));
    }
  };

  const handleAddressChange = (value: string) => {
    updateQueueData({ address: value });
    // Clear error when user types
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const handleTimeChange = (value: string) => {
    setSelectedTime(value);
    updateDateTime(value, selectedDate);
  };

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
    updateDateTime(selectedTime, value);
  };
  
  // Update dateTime in queue data when date or time changes
  const updateDateTime = (time: string, date: string) => {
    try {
      // Parse the date and time strings
      const [month, day, year] = date.split(/[\s,]+/).filter(Boolean);
      const dateObj = new Date(`${month} ${day} ${year} ${time}`);
      
      // Set dateTime and expiration (24 hours later by default)
      const expirationDate = new Date(dateObj);
      expirationDate.setHours(expirationDate.getHours() + 24);
      
      updateQueueData({ 
        dateTime: dateObj.toISOString(),
        expiration: expirationDate.toISOString()
      });
    } catch (error) {
      console.error('Error parsing date/time:', error);
    }
  };
  
  // Initialize dateTime when component mounts
  useEffect(() => {
    if (!queueData.dateTime) {
      updateDateTime(selectedTime, selectedDate);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  // Validate form fields
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!queueData.queueName || queueData.queueName.trim() === '') {
      newErrors.queueName = 'Queue name is required';
    }
    
    if (!queueData.address || queueData.address.trim() === '') {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (validateForm()) {
      // Form is valid, proceed to next step
      window.location.href = '/generate/step2';
    } else {
      setIsSubmitting(false);
      // Scroll to the first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <BackButton href="/home" text="GENERATE NOW" />
      
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        
        <div className={`mb-1 flex ${errors.queueName ? 'error-field' : ''}`}>
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
            required={true}
          />
          {errors.queueName && (
            <div className="text-red-500 text-sm mt-1">{errors.queueName}</div>
          )}
        </div>
        </div>
        
        <div className={`mb-1 flex ${errors.address ? 'error-field' : ''}`}>
        <div className="w-1/3 border border-black p-2 bg-black h-12.5 text-white">
        <h1>ADDRESS</h1>
        </div>
        <div className="w-2/3">
          <QueueFormField 
            label="ADDRESS"
            placeholder="Type here..."
            showLabel={false}
            value={queueData.address}
            onChange={handleAddressChange}
            fullWidth
            required={true}
          />
          {errors.address && (
            <div className="text-red-500 text-sm mt-1">{errors.address}</div>
          )}
        </div>
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
              value={selectedTime}
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
              options={dateOptions}
            />
           
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            type="submit" 
            className="bg-black text-white py-2 px-6 rounded-none hover:bg-gray-800 transition-colors align-right"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'VALIDATING...' : 'NEXT'}
          </button>
        </div>
      </form>
    </div>
  );
}

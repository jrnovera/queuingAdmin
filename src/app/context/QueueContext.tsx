'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the queue data structure
interface QueueCategory {
  name: string;
  limit: string;
  timeLimit: string;
}

interface QueueData {
  queueName: string;
  address: string;
  scheduleTime: string;
  scheduleDate: string;
  expirationTime: string;
  expirationDate: string;
  breakTimeStart: string;
  breakTimeEnd: string;
  categories: QueueCategory[];
  notes: string;
  formColumns: string[];
}

// Initial state
const initialQueueData: QueueData = {
  queueName: '',
  address: '',
  scheduleTime: '8:00 AM',
  scheduleDate: '',
  expirationTime: '1:00 PM',
  expirationDate: '',
  breakTimeStart: '12:00 PM',
  breakTimeEnd: '1:00 PM',
  categories: [
    { name: 'ENROLLMENT', limit: '100', timeLimit: '5 Minutes' }
  ],
  notes: '',
  formColumns: ['FULL NAME']
};

interface QueueContextType {
  queueData: QueueData;
  updateQueueData: (data: Partial<QueueData>) => void;
  addCategory: (category: QueueCategory) => void;
  removeCategory: (index: number) => void;
  addFormColumn: (column: string) => void;
  removeFormColumn: (index: number) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [queueData, setQueueData] = useState<QueueData>(initialQueueData);

  const updateQueueData = (data: Partial<QueueData>) => {
    setQueueData(prev => ({ ...prev, ...data }));
  };

  const addCategory = (category: QueueCategory) => {
    setQueueData(prev => ({
      ...prev,
      categories: [...prev.categories, category]
    }));
  };

  const removeCategory = (index: number) => {
    setQueueData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const addFormColumn = (column: string) => {
    setQueueData(prev => ({
      ...prev,
      formColumns: [...prev.formColumns, column]
    }));
  };

  const removeFormColumn = (index: number) => {
    setQueueData(prev => ({
      ...prev,
      formColumns: prev.formColumns.filter((_, i) => i !== index)
    }));
  };

  return (
    <QueueContext.Provider value={{ 
      queueData, 
      updateQueueData, 
      addCategory, 
      removeCategory, 
      addFormColumn, 
      removeFormColumn 
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueueContext() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueueContext must be used within a QueueProvider');
  }
  return context;
}

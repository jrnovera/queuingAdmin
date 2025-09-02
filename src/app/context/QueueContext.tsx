'use client';

import React, { createContext, useContext, useState } from 'react';
import { createQueue, getQueueById, getQueuesByUser } from '../firebase/firestore';
import { Queue, QueueCategory } from '../types/queue';
import { useAuth } from './AuthContext';

// Initial state
const initialQueueData: Queue = {
  queueName: '',
  address: '',
  dateTime: '',
  expiration: '',
  breakTimeFrom: '',
  breakTimeTo: '',
  categories: [],
  createdBy: '',
  notes: '',
  formColumns: ['FULL NAME']
};

interface QueueContextType {
  queueData: Queue;
  updateQueueData: (data: Partial<Queue>) => void;
  addCategory: (category?: Partial<QueueCategory>) => void;
  removeCategory: (index: number) => void;
  saveQueue: () => Promise<string>;
  getQueue: (queueId: string) => Promise<Queue | null>;
  getUserQueues: () => Promise<Queue[]>;
  addFormColumn: (column: string) => void;
  removeFormColumn: (index: number) => void;
}

// Create the context
const QueueContext = createContext<QueueContextType | undefined>(undefined);

// Provider component
export const QueueProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [queueData, setQueueData] = useState<Queue>(() => {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('queueData');
      if (saved) {
        try {
          return { ...initialQueueData, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Error parsing saved queue data:', error);
        }
      }
    }
    return initialQueueData;
  });

  // Update queue data in state and save to localStorage
  const updateQueueData = (data: Partial<Queue>) => {
    setQueueData(prev => {
      const newData = { ...prev, ...data };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('queueData', JSON.stringify(newData));
      }
      return newData;
    });
  };

  // Add a new category to the queue
  const addCategory = (category?: Partial<QueueCategory>) => {
    const defaultCategory: QueueCategory = { 
      name: '', 
      limit: '10', 
      timeLimit: '5', 
      invitedStaff: [] 
    };
    
    const newCategory = category ? { ...defaultCategory, ...category } : defaultCategory;
    
    setQueueData(prev => {
      const newData = {
        ...prev,
        categories: [
          ...prev.categories,
          newCategory
        ]
      };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('queueData', JSON.stringify(newData));
      }
      return newData;
    });
  };

  // Remove a category from the queue
  const removeCategory = (index: number) => {
    setQueueData(prev => {
      const newData = {
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('queueData', JSON.stringify(newData));
      }
      return newData;
    });
  };
  
  // Save queue to Firestore
  const saveQueue = async (): Promise<string> => {
    if (!user) {
      throw new Error('User must be authenticated to create a queue');
    }
    
    // Debug log to check queue data before saving
    console.log('Queue data before saving:', queueData);
    
    // Validate required fields
    if (!queueData.queueName || queueData.queueName.trim() === '') {
      throw new Error('Queue name is required');
    }
    
    if (!queueData.address || queueData.address.trim() === '') {
      throw new Error('Address is required');
    }
    
    // Set the creator ID and ensure all required fields are present
    const queueWithCreator = {
      ...queueData,
      createdBy: user.uid,
      queueName: queueData.queueName.trim(),
      address: queueData.address.trim(),
      dateTime: queueData.dateTime || new Date().toISOString(),
      expiration: queueData.expiration || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    try {
      // Save to Firestore
      const queueId = await createQueue(queueWithCreator);
      
      // Update state with the new queue ID and clear localStorage
      setQueueData(prev => {
        const newData = { ...prev, queueId };
        // Clear localStorage after successful save
        if (typeof window !== 'undefined') {
          localStorage.removeItem('queueData');
        }
        return newData;
      });
      
      return queueId;
    } catch (error) {
      console.error('Error saving queue:', error);
      throw error;
    }
  };
  
  // Get a queue by ID
  const getQueue = async (queueId: string): Promise<Queue | null> => {
    try {
      const queue = await getQueueById(queueId);
      if (queue) {
        setQueueData(queue);
      }
      return queue;
    } catch (error) {
      console.error('Error getting queue:', error);
      return null;
    }
  };
  
  // Get all queues created by the current user
  const getUserQueues = async (): Promise<Queue[]> => {
    if (!user) {
      return [];
    }
    
    try {
      return await getQueuesByUser(user.uid);
    } catch (error) {
      console.error('Error getting user queues:', error);
      return [];
    }
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
      saveQueue,
      getQueue,
      getUserQueues,
      addFormColumn,
      removeFormColumn
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export function useQueueContext() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueueContext must be used within a QueueProvider');
  }
  return context;
}

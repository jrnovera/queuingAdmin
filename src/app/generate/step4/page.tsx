'use client';

import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import NextButton from '../../components/NextButton';
import { useQueueContext } from '../../context/QueueContext';

export default function QueueStep4Page() {
  const { queueData, addFormColumn, removeFormColumn } = useQueueContext();
  const [newColumn, setNewColumn] = useState('');

  const handleAddColumn = () => {
    if (newColumn.trim() !== '') {
      addFormColumn(newColumn.trim());
      setNewColumn('');
    }
  };

  const handleRemoveColumn = (index: number) => {
    removeFormColumn(index);
  };

  return (
    <div className="min-h-screen p-6">
      <BackButton href="/generate/step3" text="GENERATE NOW" />
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-black text-white p-3 mb-4">
          FORM COLUMNS:
        </div>
        
        <div className="mb-6">
          {queueData.formColumns.map((column, index) => (
            <div key={index} className="flex items-center mb-2">
              <div className="flex-1 border border-gray-300 p-3">{column}</div>
              {index > 0 && (
                <button 
                  className="bg-black text-white h-12 w-12 ml-2 flex items-center justify-center"
                  onClick={() => handleRemoveColumn(index)}
                >
                  -
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 mb-8">
          
          <button 
            className="bg-black text-white px-4 py-2"
            onClick={handleAddColumn}
          >
            ADD
          </button>
        </div>
        
        <NextButton href="/generate/success" text="GENERATE" />
      </div>
    </div>
  );
}

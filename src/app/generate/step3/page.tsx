'use client';

import React, { useState } from 'react';
import BackButton from '../../components/BackButton';
import NextButton from '../../components/NextButton';
import { useQueueContext } from '../../context/QueueContext';

export default function QueueStep3Page() {
  const { queueData, updateQueueData, addCategory, removeCategory } = useQueueContext();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [notes, setNotes] = useState(queueData.notes || '');
  const [staffEmail, setStaffEmail] = useState('');

  // Handle category name change
  const handleCategoryNameChange = (index: number, name: string) => {
    const updatedCategories = [...queueData.categories];
    updatedCategories[index] = { ...updatedCategories[index], name };
    updateQueueData({ categories: updatedCategories });
  };
  
  // Handle category limit change
  const handleCategoryLimitChange = (index: number, limit: string) => {
    const updatedCategories = [...queueData.categories];
    updatedCategories[index] = { ...updatedCategories[index], limit };
    updateQueueData({ categories: updatedCategories });
  };

  // Handle category time limit change
  const handleCategoryTimeLimitChange = (index: number, timeLimit: string) => {
    const updatedCategories = [...queueData.categories];
    updatedCategories[index] = { ...updatedCategories[index], timeLimit };
    updateQueueData({ categories: updatedCategories });
  };

  // State for new category fields
  const [newCategoryLimit, setNewCategoryLimit] = useState('50');
  const [newCategoryTimeLimit, setNewCategoryTimeLimit] = useState('5 Minutes');

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        limit: newCategoryLimit,
        timeLimit: newCategoryTimeLimit
      });
      setNewCategoryName('');
    }
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    updateQueueData({ notes: value });
  };

  // Handle staff invitation
  const handleInviteStaff = () => {
    if (staffEmail.trim()) {
      // In a real app, this would send an invitation to the staff email
      console.log(`Invitation sent to staff: ${staffEmail}`);
      alert(`Invitation sent to: ${staffEmail}`);
      setStaffEmail('');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <BackButton href="/generate/step2" text="GENERATE NOW" />
      
      <div className="max-w-3xl mx-auto">
        {queueData.categories && queueData.categories.map((category, index) => (
          <div key={index} className="flex gap-4 mb-4">
            <div className="w-1/2">
              <input
                type="text"
                className="w-full border border-gray-300 p-3 focus:outline-none"
                value={category.name}
                onChange={(e) => handleCategoryNameChange(index, e.target.value)}
              />
            </div>
            <div className="w-1/4">
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 p-3 focus:outline-none"
                  value={category.limit}
                  onChange={(e) => handleCategoryLimitChange(index, e.target.value)}
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="75">75</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="text-center text-xs text-gray-600 mt-1">QUEUE LIMIT</div>
            </div>
            <div className="w-1/4">
              <div className="relative">
                <select 
                  className="w-full border border-gray-300 p-3 focus:outline-none"
                  value={category.timeLimit}
                  onChange={(e) => handleCategoryTimeLimitChange(index, e.target.value)}
                >
                  <option value="3 Minutes">3 Minutes</option>
                  <option value="5 Minutes">5 Minutes</option>
                  <option value="10 Minutes">10 Minutes</option>
                </select>
              </div>
              <div className="text-center text-xs text-gray-600 mt-1">TIME LIMIT EACH</div>
            </div>
            <button 
              className="bg-black text-white px-2 py-1 h-6"
              onClick={() => removeCategory(index)}
            >
              -
            </button>
            <button 
              className="bg-black text-white px-2 py-1 text-xs h-6"
              onClick={handleInviteStaff}
            >
              INVITE
            </button>
          </div>
        ))}
        
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              className="w-1/2 border border-gray-300 p-3 focus:outline-none"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button 
              className="bg-black text-white h-12 px-4 flex items-center justify-center"
              onClick={handleAddCategory}
            >
              ADD CATEGORY
            </button>
          </div>
        </div>
        
        <div className="border border-gray-300 p-4 mb-6">
          <textarea 
            className="w-full focus:outline-none" 
            rows={4}
            placeholder="Leave a note (optional): Please note that each person has a 5-minute window to be accommodated. We recommend arriving at least 10 minutes early, thank you."
            value={notes}
            onChange={handleNotesChange}
          ></textarea>
        </div>
        
        <NextButton href="/generate/step4" />
      </div>
    </div>
  );
}

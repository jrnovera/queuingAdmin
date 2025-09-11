'use client';

import React, { useState, useEffect } from 'react';
import BackButton from '../../components/BackButton';
import { useQueueContext } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../firebase/firestore';
import { useRouter } from 'next/navigation';

export default function QueueStep3Page() {
  const { queueData, updateQueueData, addCategory, removeCategory, saveQueue } = useQueueContext();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('10');
  const [newCategoryTimeLimit, setNewCategoryTimeLimit] = useState('5');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [showInviteDropdown, setShowInviteDropdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(queueData.notes || '');
  const [users, setUsers] = useState<Array<{id: string, email: string, displayName: string, role?: string}>>([]);

  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const { user } = useAuth();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Users:", JSON.stringify(users, null, 2));
  }, [users]);
  
  // Handle click outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
        setSearchQuery('');
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersList = await getUsers(user?.email);
        setUsers(usersList as Array<{id: string, email: string, displayName: string, role?: string}>);
      } catch (error) {
        console.error('Error fetching users:', error);
        // If Firestore collection doesn't exist yet, use mock data
        setUsers([
          { id: '1', email: 'staff1@example.com', displayName: 'Staff One', role: 'admin' },
          { id: '2', email: 'staff2@example.com', displayName: 'Staff Two', role: 'staff' },
          { id: '3', email: 'staff3@example.com', displayName: 'Staff Three', role: 'manager' },
          { id: '4', email: 'user1@example.com', displayName: 'Regular User', role: 'user' }
        ].filter(user => user.role !== 'user')); // Filter out users with role === "user"
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [user?.email]);

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

  // State for new category fields - removed duplicates

  // Handle add category button click
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      // Add a new category with the entered name and default values
      addCategory({
        name: newCategoryName.trim(),
        limit: newCategoryLimit,
        timeLimit: newCategoryTimeLimit,
        invitedStaff: []
      });
      setNewCategoryName('');
    } else {
      alert('Please enter a category name');
    }
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    updateQueueData({ notes: value });
  };

  // Toggle dropdown visibility
  const toggleDropdown = (index: number) => {
    setShowDropdown(showDropdown === index ? null : index);
  };
  
  // Handle staff invitation
  const handleInviteStaff = (email: string, categoryIndex: number) => {
    // In a real app, this would send an invitation to the staff email
    const updatedCategories = [...queueData.categories];
    const category = updatedCategories[categoryIndex];
    
    // Initialize invitedStaff array if it doesn't exist
    if (!category.invitedStaff) {
      category.invitedStaff = [];
    }
    
    // Add email if not already in the list
    if (!category.invitedStaff.includes(email)) {
      category.invitedStaff.push(email);
      updateQueueData({ categories: updatedCategories });
    }
    
    // Close dropdown after selection
    setShowDropdown(null);
    console.log(`Invitation sent to staff: ${email} for category ${categoryIndex}`);
  };
  
  // Remove invited staff
  const removeInvitedStaff = (categoryIndex: number, email: string) => {
    const updatedCategories = [...queueData.categories];
    const category = updatedCategories[categoryIndex];
    
    if (category.invitedStaff) {
      category.invitedStaff = category.invitedStaff.filter(staff => staff !== email);
      updateQueueData({ categories: updatedCategories });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <BackButton href="/generate/step2" text="GENERATE NOW" />
      
      <div className="max-w-3xl mx-auto">
        {queueData.categories && queueData.categories.map((category, index) => (
          <div key={`category-${index}-${category.name || index}`} className="flex gap-4 mb-4">
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
            <div className="relative">
              <button 
                className="bg-black text-white px-2 py-1 text-xs h-6"
                onClick={() => toggleDropdown(index)}
              >
                INVITE
              </button>
              
              {/* Dropdown for user selection */}
              {showDropdown === index && (
                <div ref={dropdownRef} className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full p-1 border border-gray-300 rounded text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {isLoading ? (
                    <div className="p-2 text-center">Loading users...</div>
                  ) : users.length > 0 ? (
                    <>
                      {users
                        .filter(user => 
                          (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                        )
                        .map(user => (
                          <div 
                            key={user.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b border-gray-100"
                            onClick={() => handleInviteStaff(user.email, index)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{user.displayName || 'User'}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                            <span className="text-xs bg-black text-white px-2 py-1 rounded-full">Invite</span>
                          </div>
                        ))}
                    </>
                  ) : (
                    <div className="p-2 text-center">No users available</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Display invited staff */}
            {queueData.categories[index].invitedStaff && queueData.categories[index].invitedStaff.length > 0 && (
              <div className="absolute mt-8 right-0 bg-white border border-gray-200 p-2 shadow-md z-10 w-48">
                <div className="text-xs font-bold mb-1">Invited Staff:</div>
                {queueData.categories[index].invitedStaff.map((email, idx) => (
                  <div key={`staff-${index}-${idx}-${email}`} className="text-xs flex justify-between items-center mb-1">
                    <span>{email}</span>
                    <button 
                      className="text-red-500 text-xs"
                      onClick={() => removeInvitedStaff(index, email)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
        
        <button 
          className="bg-black text-white px-8 py-3 ml-auto block"
          onClick={async () => {
            try {
              // Debug log before saving
              console.log('Step 3 - Final queue data before saving:', queueData);
              
              // Validate required fields before saving
              if (!queueData.queueName || queueData.queueName.trim() === '') {
                alert('Queue name is required. Please go back to Step 1 and enter a queue name.');
                return;
              }
              
              if (!queueData.address || queueData.address.trim() === '') {
                alert('Address is required. Please go back to Step 1 and enter an address.');
                return;
              }
              
              // Save queue data to Firestore
              const queueId = await saveQueue();
              console.log('Queue saved successfully with ID:', queueId);
              
              // Navigate to QR code page with the queue ID using router.push
              router.push(`/generate/qrcode?id=${queueId}`);
            } catch (error) {
              console.error('Error saving queue:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
              alert(`Error saving queue: ${errorMessage}. Please try again.`);
            }
          }}
        >
          GENERATE QR CODE
        </button>
      </div>
    </div>
  );
}

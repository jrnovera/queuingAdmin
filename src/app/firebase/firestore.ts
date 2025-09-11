import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, DocumentData, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { app } from './config';
import { Queue, QueueCategory } from '../types/queue';

// Initialize Firestore
const db = getFirestore(app);

// Save user to Firestore after authentication
export const saveUserToFirestore = async (user: User, username?: string) => {
  if (!user.uid) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      username: username || '',
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    if (!userSnapshot.exists()) {
      // Create new user document
      await setDoc(userRef, userData);
      console.log('User document created in Firestore');
    } else {
      // Update existing user document with last login
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
        // Update other fields if they've changed
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      console.log('User document updated in Firestore');
    }
    
    return userData;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
};

// Get all users except the current user and users with role === "user"
export const getUsers = async (currentUserEmail: string | null | undefined) => {
  try {
    const usersCollection = collection(db, 'users');
    const usersQuery = query(usersCollection, where('email', '!=', currentUserEmail || ''));
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs
      .map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data() as DocumentData
      }))
      .filter((user: any) => user.role !== 'user'); // Filter out users with role === "user"
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Generate a unique QR code value (queue ID)
export const generateQueueId = (): string => {
  // Generate a random string of 10 characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result}-${Date.now()}`;
};

// Create a new queue document
export const createQueue = async (queueData: Queue): Promise<string> => {
  try {
    // Generate a unique queue ID if not provided
    const queueId = queueData.queueId || generateQueueId();
    
    // Create queue document with the generated ID
    const queueRef = doc(db, 'queues', queueId);
    
    // Ensure required fields are not empty
    const sanitizedQueueData = {
      ...queueData,
      queueId,
      queueName: queueData.queueName || '',
      address: queueData.address || '',
      dateTime: queueData.dateTime || new Date().toISOString(),
      expiration: queueData.expiration || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    // Debug log to check what data is being saved
    console.log('Saving queue data:', sanitizedQueueData);
    
    // Save queue document
    await setDoc(queueRef, sanitizedQueueData);
    
    // Create category documents with references to the queue
    if (queueData.categories && queueData.categories.length > 0) {
      await Promise.all(queueData.categories.map(async (category) => {
        const categoryId = `${queueId}-${category.name.replace(/\s+/g, '-').toLowerCase()}`;
        const categoryRef = doc(db, 'categories', categoryId);
        
        await setDoc(categoryRef, {
          ...category,
          categoryId,
          queueId,
          createdAt: new Date().toISOString(),
        });
      }));
    }
    
    return queueId;
  } catch (error) {
    console.error('Error creating queue:', error);
    throw error;
  }
};

// Get a queue by ID
export const getQueueById = async (queueId: string): Promise<Queue | null> => {
  try {
    const queueRef = doc(db, 'queues', queueId);
    const queueSnapshot = await getDoc(queueRef);
    
    if (!queueSnapshot.exists()) {
      return null;
    }
    
    const queueData = queueSnapshot.data() as Queue;
    // Ensure queueId is present in the returned object
    const ensuredQueueId = queueData.queueId || queueSnapshot.id;
    
    // Get categories for this queue
    const categoriesQuery = query(collection(db, 'categories'), where('queueId', '==', queueId));
    const categoriesSnapshot = await getDocs(categoriesQuery);
    
    const categories = categoriesSnapshot.docs.map(doc => doc.data() as QueueCategory);
    
    return {
      ...queueData,
      queueId: ensuredQueueId,
      categories
    };
  } catch (error) {
    console.error('Error getting queue:', error);
    return null;
  }
};

// Get queues created by a specific user
export const getQueuesByUser = async (userId: string): Promise<Queue[]> => {
  try {
    const queuesQuery = query(collection(db, 'queues'), where('createdBy', '==', userId));
    const queuesSnapshot = await getDocs(queuesQuery);
    
    return Promise.all(queuesSnapshot.docs.map(async (doc) => {
      const queueData = doc.data() as Queue;
      const queueId = doc.id;
      
      // Get categories for this queue
      const categoriesQuery = query(collection(db, 'categories'), where('queueId', '==', queueId));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const categories = categoriesSnapshot.docs.map(doc => doc.data() as QueueCategory);
      
      return {
        ...queueData,
        // Ensure queueId is set (fallback to Firestore doc id)
        queueId: queueData.queueId || queueId,
        categories
      };
    }));
  } catch (error) {
    console.error('Error getting user queues:', error);
    return [];
  }
};

// Add a user to a category's usersList
export const addUserToCategory = async (categoryId: string, userId: string): Promise<boolean> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnapshot = await getDoc(categoryRef);
    
    if (!categorySnapshot.exists()) {
      return false;
    }
    
    const categoryData = categorySnapshot.data() as QueueCategory;
    const usersList = categoryData.usersList || [];
    
    // Check if user is already in the list
    if (!usersList.includes(userId)) {
      usersList.push(userId);
      
      await updateDoc(categoryRef, {
        usersList
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding user to category:', error);
    return false;
  }
};

export { db };

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  User,
  updateProfile
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase/config';
import { saveUserToFirestore } from '../firebase/firestore';

// Define the shape of our context
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, username: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (name: string, email: string, username: string, password: string) => {
    try {
      setError(null);
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name (using the provided name)
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Save user to Firestore for invitation features
        await saveUserToFirestore(userCredential.user, username);
        console.log('User created and saved to Firestore');
        
        // After successful signup, redirect to home
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Signup error:', err.message);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err.message);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (err: any) {
      setError(err.message);
      console.error('Logout error:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

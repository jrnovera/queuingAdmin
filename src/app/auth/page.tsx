'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Input from '../components/Input';
import Button from '../components/Button';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { user, signIn, signUp, error } = useAuth();
  const router = useRouter();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/home');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    try {
      if (isLogin) {
        // Handle login logic
        if (!email || !password) {
          setFormError('Please enter both email and password');
          return;
        }
        await signIn(email, password);
      } else {
        // Handle signup logic
        if (!name || !email || !password) {
          setFormError('Please fill in all required fields');
          return;
        }
        
        if (password !== confirmPassword) {
          setFormError('Passwords do not match');
          return;
        }
        
        if (!agreeToTerms) {
          setFormError('You must agree to the terms and conditions');
          return;
        }
        
        await signUp(name, email, username, password);
      }
    } catch (err) {
      console.error('Authentication error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow flex">
        {/* Left side with logo */}
        <div className="hidden md:flex md:w-1/2 bg-white items-center justify-center p-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/qrlogo.png" 
                alt="QUEUEV Logo" 
                width={200} 
                height={200}
                className="mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">QUEUEV</h1>
          </div>
        </div>
        
        {/* Right side with auth form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo (visible only on mobile) */}
            <div className="md:hidden flex flex-col items-center mb-8">
              <Image 
                src="/qrlogo.png" 
                alt="QUEUEV Logo" 
                width={120} 
                height={120}
                className="mx-auto"
              />
              <h1 className="text-3xl font-bold text-black mt-4">QUEUEV</h1>
            </div>
            
            {/* Auth tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`flex-1 py-3 font-medium text-center ${
                  isLogin ? 'border-b-2 border-black' : ''
                }`}
                onClick={() => setIsLogin(true)}
              >
                LOG IN
              </button>
              <button
                className={`flex-1 py-3 font-medium text-center ${
                  !isLogin ? 'border-b-2 border-black' : ''
                }`}
                onClick={() => setIsLogin(false)}
              >
                SIGN UP
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <Input
                  id="name"
                  label="FULL NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                />
              )}
              
              {!isLogin && (
                <Input
                  id="email"
                  label="EMAIL"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              )}
              
              {isLogin ? (
                <Input
                  id="email"
                  label="EMAIL"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              ) : (
                <Input
                  id="username"
                  label="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="@ADMIN1"
                />
              )}
              
              <div className="mb-4 relative">
                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="********"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <span className="text-gray-600">👁️</span>
                    ) : (
                      <span className="text-gray-600">👁️‍🗨️</span>
                    )}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <Input
                  id="confirmPassword"
                  label="CONFIRM PASSWORD"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="********"
                />
              )}
              
              <div className="flex items-center mb-6 mt-4">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 border border-gray-300"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm">
                  I have agreed to the{' '}
                  <Link href="#" className="text-black underline">
                    terms and conditions
                  </Link>
                </label>
              </div>
              
              {formError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {formError}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error.includes('auth/') ? 'Authentication failed. Please check your credentials.' : error}
                </div>
              )}
              
              <Button type="submit" className="w-full bg-black text-white">
                {isLogin ? 'LOG IN' : 'SIGN UP'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

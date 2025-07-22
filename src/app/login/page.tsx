'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      console.log('Login attempt with:', { username, password });
    } else {
      console.log('Signup attempt with:', { name, email, username, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex bg-white">
        {/* Left side with logo */}
        <div className="w-1/2 bg-white flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'white' }}>
          <div className="text-center">
            <Image 
              src="/qrlogo.png" 
              alt="QUEUEV Logo" 
              width={180} 
              height={180}
              className="mx-auto"
            />
            <h1 className="text-3xl font-bold mt-4">QUEUEV</h1>
          </div>
        </div>
        
        {/* Right side with auth form */}
        <div className="w-1/2 p-8">
          {/* Auth tabs */}
          <div className="flex border-b border-white mb-8">
            <button
              className={`flex-1 py-2 font-medium text-center ${
                activeTab === 'login' ? 'border-b-2 border-black' : ''
              }`}
              onClick={() => setActiveTab('login')}
            >
              LOG IN
            </button>
            <button
              className={`flex-1 py-2 font-medium text-center ${
                activeTab === 'signup' ? 'border-b-2 border-black' : ''
              }`}
              onClick={() => setActiveTab('signup')}
            >
              SIGN UP
            </button>
          </div>
          
          {/* Login Form */}
          
         {activeTab === 'login' && (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-xs mb-1">
                USERNAME
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="@ADMIN1"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          
           
            
            <div className="mb-6 relative">
              <label htmlFor="password" className="block text-xs mb-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span>👁️</span>
                  ) : (
                    <span>👁️‍🗨️</span>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded mt-4 mb-4"
            >LOG IN
            </button>
            
            
          </form>
         )} 

          {/* Signup Form */}
         
       {activeTab === 'signup' && (
         <form onSubmit={handleSubmit}>
         <div className="mb-6">
           <label htmlFor="username" className="block text-xs mb-1">
             CREATE USERNAME
           </label>
           <input
             id="username"
             type="text"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             required
             placeholder="@ADMIN1"
             className="w-full px-3 py-2 border border-gray-300 rounded"
           />
         </div>
         <div className="mb-6">
           <label htmlFor="username" className="block text-xs mb-1">
            CREATE PASSWORD
           </label>
           <input
             id="username"
             type="text"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             required
             placeholder="@ADMIN1"
             className="w-full px-3 py-2 border border-gray-300 rounded"
           />
         </div>
        
         
         <div className="mb-6 relative">
           <label htmlFor="password" className="block text-xs mb-1">
           CONFIRM PASSWORD
           </label>
           <div className="relative">
             <input
               id="password"
               type={showPassword ? "text" : "password"}
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               placeholder="********"
               className="w-full px-3 py-2 border border-gray-300 rounded"
             />
             <button 
               type="button"
               className="absolute right-3 top-1/2 transform -translate-y-1/2"
               onClick={() => setShowPassword(!showPassword)}
             >
               {showPassword ? (
                 <span>👁️</span>
               ) : (
                 <span>👁️‍🗨️</span>
               )}
             </button>
           </div>
         </div>
         
         <button
           type="submit"
           className="w-full bg-black text-white py-3 rounded mt-4 mb-4"
         >
           Sign up
         </button>
         
         <div className="flex items-center mb-4">
           <input
             id="terms"
             type="checkbox"
             checked={agreeToTerms}
             onChange={(e) => setAgreeToTerms(e.target.checked)}
             className="w-4 h-4 border border-gray-300"
             required
           />
           <label htmlFor="terms" className="ml-2 text-xs">
             I have agreed to the{' '}
             <Link href="#" className="underline">
               terms and conditions
             </Link>
           </label>
         </div>
       </form>  )}
        </div>
      </div>
    </div>
  );
}

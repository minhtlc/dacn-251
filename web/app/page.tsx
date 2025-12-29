"use client";

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Homepage } from '@/components/Homepage';
import { VerificationValid } from '@/components/VerificationValid';
import { VerificationRevoked } from '@/components/VerificationRevoked';
import { VerificationInvalid } from '@/components/VerificationInvalid';
import { StudentDashboard } from '@/components/StudentDashboard';
import { VerifyResult } from '@/lib/verify';

type Page = 'home' | 'valid' | 'revoked' | 'invalid' | 'not-found' | 'about' | 'student-dashboard';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerifyResult | null>(null);
  // Use ref to track login state for back button handling
  const isLoggedInRef = useRef(false);

  const handleNavigate = (page: string) => {
    // Handle page with query params (e.g., "verify?certificate=123")
    const [pageName] = page.split('?');
    setCurrentPage(pageName as Page);
  };

  const handleLogin = (name: string, walletAddress?: string) => {
    setIsLoggedIn(true);
    isLoggedInRef.current = true;
    setUserName(name);
    setCurrentPage('student-dashboard');
    // Push state to history when logging in
    window.history.pushState({ page: 'student-dashboard', loggedIn: true }, '', window.location.href);
    // Store wallet address if available (can be used later for certificate linking)
    if (walletAddress) {
      console.log('User wallet address:', walletAddress);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    isLoggedInRef.current = false;
    setUserName('');
    setCurrentPage('home');
  };

  const handleVerificationResult = (result: VerifyResult) => {
    setVerificationResult(result);
    
    // Navigate based on status
    switch (result.status) {
      case 'VALID':
        setCurrentPage('valid');
        break;
      case 'REVOKED':
        setCurrentPage('revoked');
        break;
      case 'INVALID':
      case 'NOT_FOUND':
      case 'ERROR':
        setCurrentPage('invalid');
        break;
    }
  };

  const handleBack = () => {
    setCurrentPage('home');
    setVerificationResult(null);
  };

  // Handle browser back button when logged in
  useEffect(() => {
    const handlePopState = () => {
      // If user is logged in and tries to go back, redirect to landing page
      if (isLoggedInRef.current) {
        setIsLoggedIn(false);
        isLoggedInRef.current = false;
        setUserName('');
        setCurrentPage('home');
        // Push a new state to prevent going back to dashboard
        window.history.pushState({ page: 'home', loggedIn: false }, '', window.location.href);
      }
    };

    // Listen for popstate events (browser back/forward button)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Show student dashboard without header/footer
  if (currentPage === 'student-dashboard') {
    return (
      <StudentDashboard 
        userName={userName}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }} suppressHydrationWarning>
      <Header 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
      
      {currentPage === 'home' && (
        <Homepage 
          onLogin={handleLogin} 
          onVerificationResult={handleVerificationResult} 
        />
      )}
      {currentPage === 'valid' && verificationResult && (
        <VerificationValid result={verificationResult} onBack={handleBack} />
      )}
      {currentPage === 'revoked' && verificationResult && (
        <VerificationRevoked result={verificationResult} onBack={handleBack} />
      )}
      {currentPage === 'invalid' && verificationResult && (
        <VerificationInvalid result={verificationResult} onBack={handleBack} />
      )}
      {currentPage === 'about' && (
        <div className="flex-1 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-4" style={{ color: '#0D1B2A' }}>About CertifyChain</h1>
            <p style={{ color: '#6B7280' }}>
              CertifyChain is a blockchain-backed certificate verification system that ensures the authenticity 
              and transparency of digital credentials. Our platform leverages distributed ledger technology to 
              create tamper-proof certificates that can be instantly verified by anyone, anywhere.
            </p>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

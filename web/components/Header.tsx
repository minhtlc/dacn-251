"use client";

import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isLoggedIn: boolean;
  userName: string;
  onLogout: () => void;
}

export function Header({ onNavigate, currentPage, isLoggedIn, userName, onLogout }: HeaderProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-50" suppressHydrationWarning>
      <div className="container mx-auto px-6 py-4" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <ShieldCheck className="h-8 w-8" style={{ color: '#0D1B2A' }} />
            <span className="text-xl font-semibold" style={{ color: '#0D1B2A' }}>CertifyChain</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'home' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </button>
            {/* <button
              onClick={() => onNavigate('verify')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'verify' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Verify Certificate
            </button> */}
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPage === 'about' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              About
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => onNavigate('home')}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


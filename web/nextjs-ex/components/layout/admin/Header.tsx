"use client";

import React from "react";
import { usePrivy } from '@privy-io/react-auth';
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface HeaderProps {
  title?: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  const { user, logout } = usePrivy();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đã đăng xuất thành công');
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
    }
  };

  // Get user display name
  const userName = user?.google?.name || 
                   user?.email?.address || 
                   user?.discord?.username ||
                   user?.phone?.number ||
                   (user?.id ? `User ${user.id.slice(0, 8)}` : 'Admin');

  // Get wallet address if available
  const walletAddress = user?.wallet?.address || 
                       (user?.linkedAccounts?.find((acc) => 
                         acc.type === 'wallet' && 'address' in acc
                       ) as { address?: string } | undefined)?.address;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-primary">
            Hệ thống Quản lý Văn bằng Blockchain
          </h1>
          <p className="text-sm text-muted-foreground">Người nhập văn bằng</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            {walletAddress ? (
              <p className="text-xs text-muted-foreground font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Quản trị viên</p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}


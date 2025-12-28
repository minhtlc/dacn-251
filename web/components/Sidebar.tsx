"use client";

import { 
  ShieldCheck, 
  LayoutDashboard, 
  User, 
  Settings, 
  HelpCircle,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  userName: string;
  userEmail: string;
  activeNavItem: string;
  isMobileMenuOpen: boolean;
  onNavItemChange: (item: string) => void;
  onMobileMenuToggle: () => void;
  onMobileMenuClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  userName,
  userEmail,
  activeNavItem,
  isMobileMenuOpen,
  onNavItemChange,
  onMobileMenuToggle,
  onMobileMenuClose,
  onLogout
}: SidebarProps) {
  const handleNavClick = (item: string) => {
    onNavItemChange(item);
    onMobileMenuClose();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">VeriCreds</h1>
          </div>

          {/* User Profile */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-gray-900 text-base font-medium">{userName}</h2>
                <p className="text-gray-500 text-sm">{userEmail}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeNavItem === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('profile')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeNavItem === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Profile</span>
              </button>

              <button
                onClick={() => handleNavClick('settings')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeNavItem === 'settings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Section - Help & Support & Logout */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              onMobileMenuClose();
              alert('Help & Support functionality would be implemented here');
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Help & Support</span>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              onMobileMenuClose();
              onLogout();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-red-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onMobileMenuClose}
        />
      )}
    </>
  );
}


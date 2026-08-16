// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { Menu, ArrowLeft, LogOut, User } from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';

export const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useClerk();
  const { userData } = useAppAuth();

  const isHome = location.pathname === '/dashboard';

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-right">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{userData?.name || 'User'}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {userData?.role}
            </span>
          </div>
          <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-bold">
            {userData?.name?.charAt(0) || <User size={18} />}
          </div>
        </div>
        <button 
          onClick={() => signOut(() => navigate('/signin'))}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
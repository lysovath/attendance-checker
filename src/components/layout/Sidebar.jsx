// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, Shield, CalendarCheck, X 
} from 'lucide-react';
import { useAppAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, userData } = useAppAuth();

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/admin/groups', label: 'Group Config', icon: Users },
    { to: '/admin/users', label: 'User Management', icon: Shield },
  ];

  const trainerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: `/trainer/groups/${userData.groupId}/courses`, label: 'My Courses & Group', icon: LayoutDashboard },  
  ];

  const links = role === 'ADMIN' ? adminLinks : trainerLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-slate-900 text-white z-40 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-white text-lg">
              N
            </div>
            <span className="font-bold text-lg tracking-wide text-white">NGEP Attendance</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors
                  ${isActive 
                    ? 'bg-primary text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
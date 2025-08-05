import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Receipt, Home, History, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'History', href: '/history', icon: History },
  ];

  const isActivePage = (href: string) => location.pathname === href;

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all duration-300">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">
                ScanlyAI
              </span>
              <span className="text-xs text-blue-100 font-medium hidden sm:block">
                Scan. Analyze. Organize.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePage(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
            
            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
              <div className="flex items-center space-x-2 text-blue-100">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 backdrop-blur-sm rounded-lg mx-2 mb-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePage(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-300
                      ${isActive 
                        ? 'bg-white/20 text-white shadow-md' 
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Menu */}
              <div className="border-t border-white/20 pt-3 mt-3">
                <div className="flex items-center space-x-2 px-3 py-2 text-blue-100">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-300 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle bottom border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </nav>
  );
}
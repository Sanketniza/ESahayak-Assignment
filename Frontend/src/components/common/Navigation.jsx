import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-indigo-600 font-bold text-xl flex items-center gap-2">
              <svg className="h-7 w-7 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 12.5l3 3L17.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Buyer Lead Manager</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
              <Link to="/" className="hover:text-indigo-600">Home</Link>
              <Link to="/buyers" className="hover:text-indigo-600">Leads</Link>
              <Link to="/buyers/new" className="text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700">Add Lead</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">{user.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
                  <div className="hidden sm:block text-sm text-gray-700">{user.name}</div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="px-4 py-2 text-sm text-gray-800">{user.email}</div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-700 hover:text-indigo-600">Login</Link>
                <Link to="/register" className="text-sm text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={toggleMenu} aria-label="Toggle menu" className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none">
                <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {isMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            <Link to="/buyers" className="block text-gray-700 px-2 py-2 rounded-md">Leads</Link>
            <Link to="/buyers/new" className="block text-gray-700 px-2 py-2 rounded-md">Add Lead</Link>
            {user ? (
              <button onClick={handleLogout} className="w-full text-left px-2 py-2 rounded-md text-gray-700">Sign out</button>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 px-2 py-2 rounded-md">Login</Link>
                <Link to="/register" className="block text-gray-700 px-2 py-2 rounded-md">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
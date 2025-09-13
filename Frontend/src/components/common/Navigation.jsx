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
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl">
              Buyer Lead Manager
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user ? (
                <>
                  <Link
                    to="/buyers"
                    className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Buyers
                  </Link>
                  <Link
                    to="/buyers/new"
                    className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Add Buyer
                  </Link>
                  
                  <div className="ml-4 flex items-center md:ml-6">
                    <div className="ml-3 relative">
                      <div>
                        <button
                          type="button"
                          className="max-w-xs bg-indigo-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white"
                          id="user-menu-button"
                          aria-expanded="false"
                          aria-haspopup="true"
                          onClick={toggleMenu}
                        >
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        </button>
                      </div>
                      
                      {isMenuOpen && (
                        <div
                          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="user-menu-button"
                          tabIndex="-1"
                        >
                          <div
                            className="block px-4 py-2 text-sm text-gray-700"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            {user.name}
                          </div>
                          <div
                            className="block px-4 py-2 text-sm text-gray-700"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            {user.email}
                          </div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-white bg-indigo-800 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-indigo-800 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <Link
                to="/buyers"
                className="block text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Buyers
              </Link>
              <Link
                to="/buyers/new"
                className="block text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Buyer
              </Link>
              <div className="pt-4 pb-3 border-t border-indigo-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-800 flex items-center justify-center text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium leading-none text-indigo-200">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
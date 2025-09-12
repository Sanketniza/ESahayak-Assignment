import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              Buyer Lead Intake
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className={`${location.pathname === '/' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-500'}`}
              >
                Home
              </Link>
              <Link 
                to="/buyers" 
                className={`${location.pathname === '/buyers' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-500'}`}
              >
                All Leads
              </Link>
              <Link 
                to="/buyers/new" 
                className={`${location.pathname === '/buyers/new' ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-indigo-500'}`}
              >
                Add New
              </Link>
            </nav>
            
            {/* Mobile navigation button (simplified) */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-indigo-500 focus:outline-none">
                Menu
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Buyer Lead Intake System
        </div>
      </footer>
    </div>
  );
};

export default Layout;
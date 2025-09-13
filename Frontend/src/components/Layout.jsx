import React from 'react';
import Navigation from './common/Navigation';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <Navigation />
      
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
import React from 'react';
import Navigation from './common/Navigation';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header/Navigation */}
      <Navigation />

      {/* Main content: centered container */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Buyer Lead Intake System
        </div>
      </footer>
    </div>
  );
};

export default Layout;
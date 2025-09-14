import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Buyer Lead Intake System</h1>
      <p className="text-xl mb-8 text-muted-foreground">Manage your real estate buyer leads efficiently</p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
        {user ? (
          <>
            <Link
              to="/buyers/new"
              className="px-8 py-4 text-lg font-bold rounded-xl shadow-xl border-2 bg-success text-success-foreground border-success"
            >
              ✚ Create New Lead
            </Link>
            <Link
              to="/buyers"
              className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg border-2 bg-primary text-primary-foreground border-primary"
            >
              📊 View All Leads
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-8 py-4 text-lg font-bold rounded-xl shadow-xl bg-primary text-primary-foreground"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg bg-success text-success-foreground"
            >
              Create Account
            </Link>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="card p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2 text-foreground">Create Leads</h3>
          <p className="text-muted-foreground">Capture buyer information with validation and assign to users.</p>
        </div>
        <div className="card p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2 text-foreground">Search & Filter</h3>
          <p className="text-muted-foreground">Easily find and manage leads with advanced filtering options.</p>
        </div>
        <div className="card p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2 text-foreground">Import & Export</h3>
          <p className="text-muted-foreground">Bulk import leads from CSV and export filtered results.</p>
        </div>
      </div>

      {user && (
        <div className="mt-12 card p-6 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Welcome back, {user.name}!
          </h2>
          <p className="mb-4 text-accent-foreground">
            You are now authenticated and have full access to the buyer lead management system.
          </p>
          <Link
            to="/buyers"
            className="inline-block px-8 py-4 text-lg font-bold rounded-xl shadow-xl border-2 bg-success text-success-foreground border-success"
          >
            🚀 Go to My Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mx-auto py-12 px-4 text-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Buyer Lead Intake System</h1>
      <p className="text-xl mb-8 text-gray-600">Manage your real estate buyer leads efficiently</p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
        <Link 
          to="/buyers/new" 
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create New Lead
        </Link>
        <Link 
          to="/buyers" 
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          View All Leads
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Create Leads</h3>
          <p className="text-gray-600">Capture buyer information with validation and assign to users.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Search & Filter</h3>
          <p className="text-gray-600">Easily find and manage leads with advanced filtering options.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2">Import & Export</h3>
          <p className="text-gray-600">Bulk import leads from CSV and export filtered results.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
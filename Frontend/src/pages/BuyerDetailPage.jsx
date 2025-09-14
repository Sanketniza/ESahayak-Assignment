import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BuyerDetail from '../components/BuyerDetail';

const BuyerDetailPage = ({ mode: propMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Check if the mode parameter is present in the query string or use the prop value
  const mode = propMode || new URLSearchParams(location.search).get('mode') || 'view';
  const [notFound, setNotFound] = useState(false);

  // Check if the ID parameter exists
  useEffect(() => {
    if (!id) {
      // Redirect to the buyers list if no ID is provided
      navigate('/buyers');
    }
  }, [id, navigate]);

  // If the ID is not valid (not found), show a not found message
  if (notFound) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-destructive border-l-4 border-destructive-foreground p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-destructive-foreground">Buyer not found.</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/buyers')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          Back to Buyers List
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/buyers')}
          className="flex items-center text-sm text-primary hover:text-primary/90"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Buyers List
        </button>
      </div>

      {/* Buyer detail component */}
      <BuyerDetail 
        buyerId={id} 
        mode={mode} 
        onNotFound={() => setNotFound(true)}
      />
    </div>
  );
};

export default BuyerDetailPage;
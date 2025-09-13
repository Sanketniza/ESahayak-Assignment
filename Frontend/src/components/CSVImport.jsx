import React, { useState, useRef } from 'react';
import apiClient from '../services/api';

const CSVImport = ({ onImportComplete, onCancel }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  
  // Mock user ID for now - in a real app, this would come from authentication
  const MOCK_OWNER_ID = "user-123";

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      setFile(null);
      fileInputRef.current.value = '';
      return;
    }
    
    // Validate file size (2MB max)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('File size exceeds 2MB limit');
      setFile(null);
      fileInputRef.current.value = '';
      return;
    }
    
    setFile(selectedFile);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file to upload');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerId', MOCK_OWNER_ID);

      // Send request to import endpoint via shared api client (includes baseURL and auth)
      const response = await apiClient.post('/buyers/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setImportResult(response.data);
      
      // Notify parent component if callback provided
      if (onImportComplete) {
        onImportComplete(response.data);
      }
    } catch (err) {
      console.error('CSV import error:', err);
      
      // Handle error response
      if (err.response?.data) {
        setError(err.response.data.message || 'Failed to import CSV');
        setImportResult(err.response.data);
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Import Buyers from CSV</h2>
        <p className="text-sm text-gray-600">
          Upload a CSV file with buyer information. The file must have the following headers:
        </p>
        <div className="bg-gray-50 p-3 mt-2 rounded text-xs font-mono overflow-x-auto">
          fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Maximum 200 rows will be imported. Each row will be validated.
        </p>
      </div>
      
      {/* File upload area */}
      {!importResult && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv"
              id="csv-file-input"
            />
            <label 
              htmlFor="csv-file-input"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
            >
              Select CSV File
            </label>
            {file && (
              <div className="mt-3 text-sm">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)}KB)
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!file || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload and Import'}
            </button>
          </div>
        </div>
      )}
      
      {/* Import results */}
      {importResult && (
        <div className="space-y-4">
          <div className={`rounded-md p-4 ${importResult.success ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {importResult.success ? (
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${importResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
                  {importResult.message}
                </h3>
                <div className="mt-2 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Total rows processed: {importResult.totalRows || 0}</li>
                    <li>Successfully imported: {importResult.successCount || 0}</li>
                    <li>Rows with errors: {importResult.errorCount || 0}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error table */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Error Details</h3>
              <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Row #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importResult.errors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {error.row}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                          {error.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onCancel || (() => setImportResult(null))}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
            >
              {importResult.success ? 'Done' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImport;
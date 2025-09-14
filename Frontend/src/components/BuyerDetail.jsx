import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyerFormSchema } from '../utils/validationSchema';
import BuyerHistory from './BuyerHistory';
import { buyersApi } from '../services/api';

// Mock user ID for now - in a real app, this would come from authentication
const MOCK_OWNER_ID = "user-123";

const BuyerDetail = ({ buyerId, mode = 'view', onNotFound }) => {
  const [buyer, setBuyer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [concurrencyError, setConcurrencyError] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    watch,
    reset 
  } = useForm({
    resolver: zodResolver(buyerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      city: '',
      propertyType: '',
      bhk: '',
      purpose: '',
      budgetMin: '',
      budgetMax: '',
      timeline: '',
      source: '',
      status: '',
      notes: '',
      tags: []
    }
  });

  // Watch property type for conditional rendering
  const propertyType = watch('propertyType');
  const isResidential = ['Apartment', 'Villa'].includes(propertyType);

  // Fetch buyer data
  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await buyersApi.getById(buyerId);
        
        if (response.success) {
          const buyerData = response.data;
          setBuyer(buyerData);
          setHistory(response.history || []);
          
          // Set form values
          Object.keys(buyerData).forEach(key => {
            if (key !== 'tags') {
              setValue(key, buyerData[key]);
            }
          });
          
          // Set tags
          setTags(buyerData.tags || []);
        } else {
          setError('Failed to fetch buyer details.');
          if (onNotFound) onNotFound();
        }
      } catch (err) {
        console.error('Error fetching buyer details:', err);
        setError('Error loading buyer details. Please try again later.');
        
        // Check if it's a 404 error
        if (err.response?.status === 404 && onNotFound) {
          onNotFound();
        }
      } finally {
        setLoading(false);
      }
    };

    if (buyerId) {
      fetchBuyer();
    }
  }, [buyerId, setValue, onNotFound]);

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  // Add a tag when Enter is pressed
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
      }
      setTagInput('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset the form
      reset();
      Object.keys(buyer).forEach(key => {
        if (key !== 'tags') {
          setValue(key, buyer[key]);
        }
      });
      setTags(buyer.tags || []);
    }
    setIsEditing(!isEditing);
    setConcurrencyError(false);
    setSuccessMessage('');
    setError('');
  };

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      setConcurrencyError(false);

      // Add tags from state
      data.tags = tags;
      
      // Add ownerId to the data
      data.ownerId = MOCK_OWNER_ID;
      
      // Include updatedAt for concurrency check
      data.updatedAt = buyer.updatedAt;
      
      // Send the update request
      const response = await buyersApi.update(buyerId, data);
      
      // Handle successful update
      setBuyer(response.data);
      setHistory(prev => {
        if (response.changes && Object.keys(response.changes).length > 0) {
          // Add new history entry if there were changes
          const newHistoryEntry = {
            _id: Date.now().toString(), // temporary ID
            buyerId: buyerId,
            changedBy: MOCK_OWNER_ID,
            changedAt: new Date().toISOString(),
            diff: response.changes
          };
          return [newHistoryEntry, ...prev].slice(0, 5);
        }
        return prev;
      });
      
      setSuccessMessage('Buyer updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating buyer:', err);
      
      // Check for concurrency error
      if (err.response?.status === 409) {
        setConcurrencyError(true);
      } else {
        setError(err.response?.data?.message || 'An error occurred while updating the buyer');
      }
    } finally {
      setSaving(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading buyer details...</div>
      </div>
    );
  }

  if (!buyer && !loading) {
    return (
      <div className="bg-destructive border-l-4 border-destructive-foreground p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-destructive-foreground">Buyer not found or you don't have permission to view it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">
          {isEditing ? 'Edit Buyer' : 'Buyer Details'}
        </h1>
        <div>
          <button
            type="button"
            onClick={toggleEditMode}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isEditing
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring`}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Buyer'}
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-destructive border-l-4 border-destructive-foreground p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-destructive-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {concurrencyError && (
        <div className="bg-yellow-500 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white">
                This record has been modified by another user. Please refresh the page to get the latest data.
              </p>
              <div className="mt-2">
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-white hover:text-yellow-100 focus:outline-none"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Form */}
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden updatedAt field for concurrency control */}
        <input type="hidden" {...register('updatedAt')} />

        {/* Personal Information */}
  <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-medium mb-4 text-muted-foreground">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">
                Full Name *
              </label>
              {isEditing ? (
                <>
                  <input
                    id="fullName"
                    type="text"
                    {...register('fullName')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.fullName ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.fullName}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                Email
              </label>
              {isEditing ? (
                <>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.email || '-'}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">
                Phone Number *
              </label>
              {isEditing ? (
                <>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.phone}</p>
              )}
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-muted-foreground">
                City *
              </label>
              {isEditing ? (
                <>
                  <select
                    id="city"
                    {...register('city')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.city ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="">Select City</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Mohali">Mohali</option>
                    <option value="Zirakpur">Zirakpur</option>
                    <option value="Panchkula">Panchkula</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.city}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Property Information */}
  <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-medium mb-4 text-muted-foreground">Property Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-muted-foreground">
                Property Type *
              </label>
              {isEditing ? (
                <>
                  <select
                    id="propertyType"
                    {...register('propertyType')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.propertyType ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="">Select Property Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Office">Office</option>
                    <option value="Retail">Retail</option>
                  </select>
                  {errors.propertyType && (
                    <p className="mt-1 text-sm text-destructive">{errors.propertyType.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.propertyType}</p>
              )}
            </div>
            
            {/* BHK (conditional) */}
            {(isEditing && isResidential) || (!isEditing && buyer.bhk) ? (
              <div>
                <label htmlFor="bhk" className="block text-sm font-medium text-muted-foreground">
                  BHK {isEditing && isResidential ? '*' : ''}
                </label>
                {isEditing && isResidential ? (
                  <>
                    <select
                      id="bhk"
                      {...register('bhk')}
                      className={`mt-1 block w-full px-3 py-2 border ${errors.bhk ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                    >
                      <option value="">Select BHK</option>
                      <option value="Studio">Studio</option>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                    </select>
                    {errors.bhk && (
                      <p className="mt-1 text-sm text-destructive">{errors.bhk.message}</p>
                    )}
                  </>
                ) : buyer.bhk ? (
                  <p className="mt-1 text-sm text-foreground">{buyer.bhk}</p>
                ) : null}
              </div>
            ) : null}
            
            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-muted-foreground">
                Purpose *
              </label>
              {isEditing ? (
                <>
                  <select
                    id="purpose"
                    {...register('purpose')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.purpose ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="">Select Purpose</option>
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-destructive">{errors.purpose.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.purpose}</p>
              )}
            </div>
            
            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-muted-foreground">
                Timeline *
              </label>
              {isEditing ? (
                <>
                  <select
                    id="timeline"
                    {...register('timeline')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.timeline ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="">Select Timeline</option>
                    <option value="0-3m">0-3 months</option>
                    <option value="3-6m">3-6 months</option>
                    <option value=">6m">More than 6 months</option>
                    <option value="Exploring">Exploring</option>
                  </select>
                  {errors.timeline && (
                    <p className="mt-1 text-sm text-destructive">{errors.timeline.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {buyer.timeline === '0-3m' ? '0-3 months' :
                   buyer.timeline === '3-6m' ? '3-6 months' :
                   buyer.timeline === '>6m' ? 'More than 6 months' :
                   buyer.timeline}
                </p>
              )}
            </div>
            
            {/* Budget Min */}
            <div>
              <label htmlFor="budgetMin" className="block text-sm font-medium text-muted-foreground">
                Minimum Budget (₹)
              </label>
              {isEditing ? (
                <>
                  <input
                    id="budgetMin"
                    type="number"
                    {...register('budgetMin')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.budgetMin ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  />
                  {errors.budgetMin && (
                    <p className="mt-1 text-sm text-destructive">{errors.budgetMin.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {buyer.budgetMin ? formatCurrency(buyer.budgetMin) : '-'}
                </p>
              )}
            </div>
            
            {/* Budget Max */}
            <div>
              <label htmlFor="budgetMax" className="block text-sm font-medium text-muted-foreground">
                Maximum Budget (₹)
              </label>
              {isEditing ? (
                <>
                  <input
                    id="budgetMax"
                    type="number"
                    {...register('budgetMax')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.budgetMax ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  />
                  {errors.budgetMax && (
                    <p className="mt-1 text-sm text-destructive">{errors.budgetMax.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {buyer.budgetMax ? formatCurrency(buyer.budgetMax) : '-'}
                </p>
              )}
            </div>
          </div>
        </div>
        
  {/* Additional Information */}
  <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
    <h2 className="text-lg font-medium mb-4 text-muted-foreground">Additional Information</h2>
          
          <div className="space-y-6">
            {/* Source */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-medium mb-4 text-muted-foreground">Additional Information</h2>
          
          <div className="space-y-6">
            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-muted-foreground">
                Lead Source *
              </label>
              {isEditing ? (
                <>
                  <select
                    id="source"
                    {...register('source')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.source ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="">Select Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Call">Call</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.source && (
                    <p className="mt-1 text-sm text-destructive">{errors.source.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">{buyer.source}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-muted-foreground">
                Status
              </label>
              {isEditing ? (
                <>
                  <select
                    id="status"
                    {...register('status')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.status ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Visited">Visited</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Converted">Converted</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full status-${buyer.status.toLowerCase()}`}>
                    {buyer.status}
                  </span>
                </p>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">
                Notes
              </label>
              {isEditing ? (
                <>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    rows={4}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.notes ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  ></textarea>
                  {errors.notes && (
                    <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Maximum 1000 characters</p>
                </>
              ) : (
                <div className="mt-1 text-sm text-foreground bg-secondary p-2 rounded border border-border min-h-[60px]">
                  {buyer.notes || '-'}
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tagInput" className="block text-sm font-medium text-muted-foreground">
                Tags
              </label>
              {isEditing ? (
                <>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="tagInput"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyPress}
                      className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                      placeholder="Add tags and press Enter"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Press Enter to add a tag</p>
                </>
              ) : null}
              
              <div className={`${isEditing ? 'mt-2' : 'mt-1'} flex flex-wrap gap-2`}>
                {tags && tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center"
                    >
                      <span>{tag}</span>
                      {isEditing && (
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-primary hover:text-primary/80 focus:outline-none"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-muted-foreground">
                Status
              </label>
              {isEditing ? (
                <>
                  <select
                    id="status"
                    {...register('status')}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.status ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  >
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Visited">Visited</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Converted">Converted</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${buyer.status === 'New' ? 'bg-primary/10 text-primary' :
                      buyer.status === 'Qualified' ? 'bg-primary/10 text-primary' :
                      buyer.status === 'Contacted' ? 'bg-accent text-foreground' :
                      buyer.status === 'Visited' ? 'bg-green-500/10 text-green-400' :
                      buyer.status === 'Negotiation' ? 'bg-yellow-500/10 text-yellow-400' :
                      buyer.status === 'Converted' ? 'bg-green-500/10 text-green-400' :
                      'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {buyer.status}
                  </span>
                </p>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">
                Notes
              </label>
              {isEditing ? (
                <>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    rows={4}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.notes ? 'border-destructive' : 'border-border'} rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring`}
                  ></textarea>
                  {errors.notes && (
                    <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Maximum 1000 characters</p>
                </>
              ) : (
                <div className="mt-1 text-sm text-foreground bg-secondary p-2 rounded border border-border min-h-[60px]">
                  {buyer.notes || '-'}
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tagInput" className="block text-sm font-medium text-muted-foreground">
                Tags
              </label>
              {isEditing ? (
                <>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="tagInput"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyPress}
                      className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                      placeholder="Add tags and press Enter"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Press Enter to add a tag</p>
                </>
              ) : null}
              
              <div className={`${isEditing ? 'mt-2' : 'mt-1'} flex flex-wrap gap-2`}>
                {tags && tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center"
                    >
                      <span>{tag}</span>
                      {isEditing && (
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-primary hover:text-primary/80 focus:outline-none"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={toggleEditMode}
              className="px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground bg-transparent hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
      
      {/* History Section */}
      <div className="mt-8">
        <BuyerHistory historyItems={history} />
      </div>
    </div>
  );
};

export default BuyerDetail;
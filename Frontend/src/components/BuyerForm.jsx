import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyerFormSchema } from '../utils/validationSchema';
import { buyersApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Mock user ID for now - in a real app, this would come from authentication
const MOCK_OWNER_ID = "user-123";

const BuyerForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
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
      notes: '',
      tags: []
    }
  });

  // Watch property type for conditional rendering
  const propertyType = watch('propertyType');
  const isResidential = ['Apartment', 'Villa'].includes(propertyType);

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

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError('');

      // Add tags from the state
      data.tags = tags;
      
      // Add ownerId to the data
      data.ownerId = MOCK_OWNER_ID;

      // Send the data to the API
      await buyersApi.create(data);

      // Reset form and show success message
      reset();
      setTags([]);
      
      // Redirect to the buyers list
      navigate('/buyers');
    } catch (error) {
      console.error('Error submitting form:', error);
      setServerError(error.response?.data?.message || 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Create New Buyer Lead</h1>
      
      {serverError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md border border-red-300">
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
  <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-medium mb-4 text-gray-700">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="9876543210"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <select
                id="city"
                {...register('city')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.city ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select City</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Mohali">Mohali</option>
                <option value="Zirakpur">Zirakpur</option>
                <option value="Panchkula">Panchkula</option>
                <option value="Other">Other</option>
              </select>
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Property Information */}
  <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-medium mb-4 text-gray-700">Property Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
                Property Type *
              </label>
              <select
                id="propertyType"
                {...register('propertyType')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.propertyType ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select Property Type</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Office">Office</option>
                <option value="Retail">Retail</option>
              </select>
              {errors.propertyType && (
                <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
              )}
            </div>
            
            {/* BHK (conditional) */}
            {isResidential && (
              <div>
                <label htmlFor="bhk" className="block text-sm font-medium text-gray-700">
                  BHK *
                </label>
                <select
                  id="bhk"
                  {...register('bhk')}
                  className={`mt-1 block w-full px-3 py-2 border ${errors.bhk ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  <option value="">Select BHK</option>
                  <option value="Studio">Studio</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                </select>
                {errors.bhk && (
                  <p className="mt-1 text-sm text-red-600">{errors.bhk.message}</p>
                )}
              </div>
            )}
            
            {/* Purpose */}
            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                Purpose *
              </label>
              <select
                id="purpose"
                {...register('purpose')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.purpose ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select Purpose</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>
            
            {/* Timeline */}
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                Timeline *
              </label>
              <select
                id="timeline"
                {...register('timeline')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.timeline ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select Timeline</option>
                <option value="0-3m">0-3 months</option>
                <option value="3-6m">3-6 months</option>
                <option value=">6m">More than 6 months</option>
                <option value="Exploring">Exploring</option>
              </select>
              {errors.timeline && (
                <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>
              )}
            </div>
            
            {/* Budget Min */}
            <div>
              <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700">
                Minimum Budget (₹)
              </label>
              <input
                id="budgetMin"
                type="number"
                {...register('budgetMin')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.budgetMin ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="2000000"
              />
              {errors.budgetMin && (
                <p className="mt-1 text-sm text-red-600">{errors.budgetMin.message}</p>
              )}
            </div>
            
            {/* Budget Max */}
            <div>
              <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700">
                Maximum Budget (₹)
              </label>
              <input
                id="budgetMax"
                type="number"
                {...register('budgetMax')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.budgetMax ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="3000000"
              />
              {errors.budgetMax && (
                <p className="mt-1 text-sm text-red-600">{errors.budgetMax.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
  <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-medium mb-4 text-gray-700">Additional Information</h2>
          
          <div className="space-y-6">
            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Lead Source *
              </label>
              <select
                id="source"
                {...register('source')}
                className={`mt-1 block w-full px-3 py-2 border ${errors.source ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">Select Source</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Call">Call</option>
                <option value="Other">Other</option>
              </select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
              )}
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={4}
                className={`mt-1 block w-full px-3 py-2 border ${errors.notes ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Add any additional information about this lead..."
              ></textarea>
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Maximum 1000 characters</p>
            </div>
            
            {/* Tags */}
            <div>
              <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="tagInput"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyPress}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add tags and press Enter"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Press Enter to add a tag</p>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div 
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md flex items-center"
                  >
                    <span>{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              reset();
              setTags([]);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Create Buyer Lead'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerForm;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryParams } from '../hooks/useQueryParams';
import { useDebounce } from '../hooks/useDebounce';
import { SelectFilter, SearchInput, Pagination } from './common/Filters';
import { buyersApi } from '../services/api';
import Modal from './common/Modal';
import CSVImport from './CSVImport';

// Filter options
const cityOptions = [
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Mohali', label: 'Mohali' },
  { value: 'Zirakpur', label: 'Zirakpur' },
  { value: 'Panchkula', label: 'Panchkula' },
  { value: 'Other', label: 'Other' }
];

const propertyTypeOptions = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Office', label: 'Office' },
  { value: 'Retail', label: 'Retail' }
];

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Visited', label: 'Visited' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'Converted', label: 'Converted' },
  { value: 'Dropped', label: 'Dropped' }
];

const timelineOptions = [
  { value: '0-3m', label: '0-3 months' },
  { value: '3-6m', label: '3-6 months' },
  { value: '>6m', label: 'More than 6 months' },
  { value: 'Exploring', label: 'Exploring' }
];

const sortOptions = [
  { value: 'updatedAt:-1', label: 'Updated (Newest First)' },
  { value: 'updatedAt:1', label: 'Updated (Oldest First)' },
  { value: 'fullName:1', label: 'Name (A-Z)' },
  { value: 'fullName:-1', label: 'Name (Z-A)' }
];

const BuyersList = () => {
  const {
    getParam,
    setParam,
    setParams,
    resetParams
  } = useQueryParams();

  // Get all URL params with defaults
  const page = parseInt(getParam('page', '1'));
  const limit = parseInt(getParam('limit', '10'));
  const city = getParam('city', '');
  const propertyType = getParam('propertyType', '');
  const status = getParam('status', '');
  const timeline = getParam('timeline', '');
  const search = getParam('search', '');
  const sortValue = getParam('sort', 'updatedAt:-1');

  // Parse sort value
  const [sortBy, sortOrder] = sortValue.split(':');

  // State for search input with debounce
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // State for buyers data
  const [buyers, setBuyers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch buyers when URL params change
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await buyersApi.getAll({
          page,
          limit,
          city,
          propertyType,
          status,
          timeline,
          search: debouncedSearch,
          sortBy,
          sortOrder
        });

        // buyersApi.getAll returns the parsed response body (including data, total, totalPages)
        setBuyers(result.data || []);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.total || 0);
      } catch (err) {
        console.error('Error fetching buyers:', err);
        setError('Failed to fetch buyers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [page, limit, city, propertyType, status, timeline, debouncedSearch, sortBy, sortOrder]);

  // Update URL when search input is debounced
  useEffect(() => {
    if (debouncedSearch !== search) {
      setParam('search', debouncedSearch);
      // Reset to page 1 when search changes
      setParam('page', '1');
    }
  }, [debouncedSearch, search, setParam]);

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setParams({
      [name]: value,
      page: '1' // Reset to first page when filter changes
    });
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setParam('sort', value);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setParam('page', newPage.toString());
  };

  // Reset all filters
  const handleResetFilters = () => {
    resetParams();
    setSearchInput('');
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="px-0 py-4 sm:px-0 lg:px-0">
      <div className="bg-card rounded-xl shadow-sm p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Buyer Leads</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A list of all buyer leads in your account including their details.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center px-3 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              title="Import buyers from CSV"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import
            </button>
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/buyers/export-csv${window.location.search}`}
              download
              className="inline-flex items-center justify-center px-3 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              title="Export current buyers as CSV"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </a>
          </div>

          <Link
            to="/buyers/new"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-xl text-base font-bold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all duration-200 transform hover:scale-105"
            title="Add a new buyer lead"
          >
            ✚ Add New Lead
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
  <div className="mb-6 bg-secondary p-4 rounded-lg border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search by name, phone, or email..."
            />
          </div>

          {/* Sort Dropdown */}
          <div className="col-span-1">
            <SelectFilter
              label="Sort By"
              name="sort"
              value={sortValue}
              onChange={handleSortChange}
              options={sortOptions}
              includeEmpty={false}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-foreground bg-card hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <SelectFilter
            label="City"
            name="city"
            value={city}
            onChange={(value) => handleFilterChange('city', value)}
            options={cityOptions}
          />
          <SelectFilter
            label="Property Type"
            name="propertyType"
            value={propertyType}
            onChange={(value) => handleFilterChange('propertyType', value)}
            options={propertyTypeOptions}
          />
          <SelectFilter
            label="Status"
            name="status"
            value={status}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
          />
          <SelectFilter
            label="Timeline"
            name="timeline"
            value={timeline}
            onChange={(value) => handleFilterChange('timeline', value)}
            options={timelineOptions}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive border-l-4 border-destructive-foreground p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-destructive-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-destructive-foreground">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{buyers.length}</span> results
          {totalCount > 0 && (
            <>
              {' '}of <span className="font-medium">{totalCount}</span> total
            </>
          )}
        </p>
      </div>

      {/* Buyers Table */}
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-border sm:rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-secondary">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      City
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Property Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Budget
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Timeline
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Updated At
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-sm text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : buyers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 text-center text-sm text-muted-foreground">
                        No buyers found. Try adjusting your filters.
                      </td>
                    </tr>
                  ) : (
                    buyers.map((buyer) => (
                      <tr key={buyer._id} className="hover:bg-accent">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {buyer.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {buyer.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {buyer.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {buyer.propertyType}
                          {buyer.bhk && buyer.propertyType !== 'Plot' && (
                            <span className="ml-1">({buyer.bhk})</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {buyer.budgetMin && buyer.budgetMax ? (
                            <>
                              {formatCurrency(buyer.budgetMin)} - {formatCurrency(buyer.budgetMax)}
                            </>
                          ) : buyer.budgetMin ? (
                            <>From {formatCurrency(buyer.budgetMin)}</>
                          ) : buyer.budgetMax ? (
                            <>Up to {formatCurrency(buyer.budgetMax)}</>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {buyer.timeline === '0-3m' ? '0-3 months' :
                           buyer.timeline === '3-6m' ? '3-6 months' :
                           buyer.timeline === '>6m' ? '>6 months' :
                           buyer.timeline}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-${buyer.status.toLowerCase()}`}>
                            {buyer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(buyer.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/buyers/${buyer._id}`} className="text-primary hover:text-primary/90 mr-4">
                            View
                          </Link>
                          <Link to={`/buyers/${buyer._id}/edit`} className="text-primary hover:text-primary/90">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      </div> {/* close card */}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Buyers from CSV"
      >
        <CSVImport 
          onImportComplete={() => {
            setIsImportModalOpen(false);
            // Refresh the buyer list
            setLoading(true);
            // Small delay to ensure server has time to process
            setTimeout(() => window.location.reload(), 500);
          }}
          onCancel={() => setIsImportModalOpen(false)}
        />
      </Modal>

      {/* Mobile Floating Action Button for adding a new lead */}
      <Link
        to="/buyers/new"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white shadow-2xl hover:bg-green-700 md:hidden transform hover:scale-110 transition-all duration-200"
        aria-label="Add new buyer lead"
      >
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
};

export default BuyersList;
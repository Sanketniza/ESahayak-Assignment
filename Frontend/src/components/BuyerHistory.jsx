import React from 'react';

/**
 * Component to display a history of changes for a buyer lead
 * Shows field changes with old and new values, timestamp, and user
 */
const BuyerHistory = ({ historyItems }) => {
  if (!historyItems || historyItems.length === 0) {
    return (
      <div className="bg-secondary p-4 rounded-lg border border-border">
        <h2 className="text-lg font-medium text-muted-foreground mb-2">History</h2>
        <p className="text-muted-foreground text-sm">No history records available.</p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Format field names for display
  const formatFieldName = (fieldName) => {
    const fieldNameMap = {
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      city: 'City',
      propertyType: 'Property Type',
      bhk: 'BHK',
      purpose: 'Purpose',
      budgetMin: 'Min Budget',
      budgetMax: 'Max Budget',
      timeline: 'Timeline',
      source: 'Source',
      status: 'Status',
      notes: 'Notes',
      tags: 'Tags'
    };

    return fieldNameMap[fieldName] || fieldName;
  };

  // Format field values for display
  const formatFieldValue = (fieldName, value) => {
    if (value === null || value === undefined) return '-';
    
    if (fieldName === 'budgetMin' || fieldName === 'budgetMax') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    }
    
    if (fieldName === 'tags' && Array.isArray(value)) {
      return value.join(', ') || '-';
    }
    
    return String(value);
  };

  return (
    <div className="bg-secondary p-4 rounded-lg border border-border">
      <h2 className="text-lg font-medium text-muted-foreground mb-4">History</h2>
      
      <div className="space-y-6">
        {historyItems.map((historyItem) => (
          <div 
            key={historyItem._id} 
            className="bg-card p-4 rounded-md border border-border shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(historyItem.changedAt)}
                </span>
              </div>
              <div className="text-sm font-medium">
                <span className="text-foreground">
                  {historyItem.changedBy}
                </span>
              </div>
            </div>
            
            {historyItem.diff.action ? (
              <div className="text-sm">
                <span className="font-medium">Action: </span>
                <span className="text-foreground">{historyItem.diff.action}</span>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(historyItem.diff).map(([field, change]) => (
                  <div key={field} className="grid grid-cols-[120px_1fr_1fr] gap-4 text-sm">
                    <div className="font-medium text-foreground">{formatFieldName(field)}</div>
                    <div className={`text-red-600 line-through ${!change.from ? 'opacity-50' : ''}`}>
                      {formatFieldValue(field, change.from)}
                    </div>
                    <div className={`text-green-600 ${!change.to ? 'opacity-50' : ''}`}>
                      {formatFieldValue(field, change.to)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerHistory;
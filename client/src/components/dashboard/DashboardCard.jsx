import React from 'react';
import PropTypes from 'prop-types';

const DashboardCard = ({ 
  title, 
  children, 
  className = '', 
  headerAction = null,
  loading = false,
  error = null 
}) => {
  return (
    <div className={`bg-white rounded-3xl shadow-xl p-10 border-2 border-blue-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${className}`} style={{background: 'linear-gradient(135deg, #f0f7fa 0%, #e0ecfa 100%)'}}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-800 drop-shadow-sm">{title}</h3>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {!loading && !error && children}
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  headerAction: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default DashboardCard;

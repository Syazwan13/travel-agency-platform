import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  trendDirection = 'up',
  className = '',
  loading = false 
}) => {
  const getTrendColor = () => {
    if (trendDirection === 'up') return 'text-green-600';
    if (trendDirection === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    }
    if (trendDirection === 'down') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-semibold text-gray-900">
                    {value}
                  </div>
                  {trend && (
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor()}`}>
                      {getTrendIcon()}
                      <span className="sr-only">
                        {trendDirection === 'up' ? 'Increased' : 'Decreased'} by
                      </span>
                      {trend}
                    </div>
                  )}
                </>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node.isRequired,
  trend: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down', 'neutral']),
  className: PropTypes.string,
  loading: PropTypes.bool
};

export default StatCard;

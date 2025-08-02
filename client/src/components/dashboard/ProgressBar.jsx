import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ 
  value, 
  max = 100, 
  label, 
  color = 'primary',
  size = 'md',
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const backgroundColorClasses = {
    primary: 'bg-primary bg-opacity-10',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100'
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`w-full ${backgroundColorClasses[color]} rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!label && showPercentage && (
        <div className="mt-1 text-right">
          <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showPercentage: PropTypes.bool,
  className: PropTypes.string
};

export default ProgressBar;

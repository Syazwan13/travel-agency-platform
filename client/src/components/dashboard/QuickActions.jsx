import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ actions, title = "Quick Actions" }) => {
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    } else if (action.href) {
      window.open(action.href, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors duration-200 text-left group"
            disabled={action.disabled}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:bg-opacity-20 transition-colors duration-200">
                  {action.icon}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors duration-200">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
                {action.badge && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary mt-2">
                    {action.badge}
                  </span>
                )}
              </div>
              {action.disabled && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

QuickActions.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
      onClick: PropTypes.func,
      path: PropTypes.string,
      href: PropTypes.string,
      badge: PropTypes.string,
      disabled: PropTypes.bool
    })
  ).isRequired,
  title: PropTypes.string
};

export default QuickActions;

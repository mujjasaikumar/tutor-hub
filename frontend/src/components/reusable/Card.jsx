import React from 'react';

/**
 * Reusable Card component with consistent styling
 * @param {Object} props
 * @param {ReactNode} props.children - Card content
 * @param {Function} props.onClick - Optional click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.interactive - Whether card should have hover effects
 */
export const Card = ({
  children,
  onClick,
  className = '',
  interactive = false
}) => {
  const baseClasses = interactive ? 'card-interactive' : 'card-base';
  
  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 px-6 py-4 ${className}`}>
    {children}
  </div>
);

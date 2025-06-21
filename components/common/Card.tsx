
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  footer?: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleClassName = '', footer }) => {
  return (
    <div className={`bg-pbr-bg-element p-6 rounded-lg shadow-lg ${className}`}>
      {title && (
        <h3 className={`text-xl font-inter font-semibold text-pbr-text-main mb-4 ${titleClassName}`}>
          {title}
        </h3>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card;

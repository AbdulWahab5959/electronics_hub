// src/components/common/Card.jsx
import React from 'react';

export const Card = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  hoverable = false,
  ...props 
}) => {
  const cardClass = `card ${hoverable ? 'card-hoverable' : ''} ${className}`;
  
  return (
    <div className={cardClass} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};
// src/components/common/Button.jsx
import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary',  // primary, secondary, danger, outline
  size = 'md',          // sm, md, lg
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  // Build CSS classes dynamically
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    isLoading ? 'btn-loading' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner-small"></span>}
      {children}
    </button>
  );
};
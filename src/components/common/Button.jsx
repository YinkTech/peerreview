// src/components/common/Button.jsx
import React from 'react';

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
// src/CheckEnv.jsx
import React, { useEffect } from 'react';

export default function CheckEnv() {
  useEffect(() => {
    console.log('=== ENVIRONMENT VARIABLES LOADED ===');
    console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('Mode:', import.meta.env.MODE);
    console.log('All variables:', import.meta.env);
    
    // Check which .env file is being used
    if (import.meta.env.MODE === 'development') {
      console.log('✅ Using .env file (development mode)');
      console.log('❌ .env.production is IGNORED right now');
    }
  }, []);

  return (
    <div style={{ padding: '10px', background: '#e0e0e0' }}>
      <h3>Environment Check</h3>
      <p>API URL: <strong>{import.meta.env.VITE_API_URL}</strong></p>
      <p>Mode: <strong>{import.meta.env.MODE}</strong></p>
      {import.meta.env.VITE_API_URL === 'http://localhost:8000' ? (
        <p style={{ color: 'green' }}>✅ Using LOCAL configuration (correct for development)</p>
      ) : (
        <p style={{ color: 'red' }}>⚠️ Using: {import.meta.env.VITE_API_URL}</p>
      )}
    </div>
  );
}
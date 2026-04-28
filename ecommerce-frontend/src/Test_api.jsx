// src/TestEnv.jsx
import { useEffect } from 'react';

export default function TestEnv() {
  useEffect(() => {
    console.log('=== ENVIRONMENT TEST ===');
    console.log('API URL:', import.meta.env.VITE_API_URL);
    console.log('Mode:', import.meta.env.MODE);
    
    // Test API connection
fetch(`${import.meta.env.VITE_API_URL}/test`)
      .then(res => res.json())
      .then(data => console.log('API Response:', data))
      .catch(err => console.error('API Error:', err));
  }, []);

  return (
    <div style={{
      background: '#f0f0f0',
      padding: '10px',
      margin: '10px',
      borderLeft: '4px solid green'
    }}>
      <h3>🔧 Environment Test</h3>
      <p>Open Console (F12) to see results</p>
      <p><strong>Expected API URL:</strong> {import.meta.env.VITE_API_URL}</p>
    </div>
  );
}
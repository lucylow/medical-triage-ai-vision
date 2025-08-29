import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'red' }}>🚑 TRIAGE A.I. TEST</h1>
      <p>If you can see this, React is working!</p>
      <button 
        style={{ 
          backgroundColor: 'blue', 
          color: 'white', 
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked! React is working!')}
      >
        Test Button
      </button>
    </div>
  );
};

export default TestComponent;

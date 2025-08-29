import React from 'react';

const BasicTest: React.FC = () => {
  return (
    <div>
      <h1>🚑 TRIAGE A.I. - BASIC TEST</h1>
      <p>React is working!</p>
      <button onClick={() => console.log('Button clicked!')}>
        Click Me
      </button>
    </div>
  );
};

export default BasicTest;

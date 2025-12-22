import React from 'react';

function SimpleTest() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        backgroundColor: 'red',
        margin: '20px 0'
      }}>
        Red Box
      </div>
    </div>
  );
}

export default SimpleTest;
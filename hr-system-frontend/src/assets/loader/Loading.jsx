import React from 'react';

const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%', minHeight: '200px' }}>
    <div className="loading-spinner" />
  </div>
);

export default Loading;

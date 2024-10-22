// src/components/Content.js
import React from 'react';
import './Components.css';

const Content = ({ children }) => {
  return (
    <div className="content">
      {children}
    </div>
  );
};

export default Content;

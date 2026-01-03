'use client';

import React from 'react';

const ResetButton = ({ active, onClick, children = 'Reset' }) => {
  return (
    <>
      <button
        type="button"
        className={`filter-reset-btn ${active ? 'is-active' : ''}`}
        onClick={onClick}
        disabled={!active}
      >
        {children}
      </button>
    </>
  );
};

export default ResetButton;

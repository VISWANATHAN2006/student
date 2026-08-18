import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading data...', size = 32 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1rem',
        gap: '0.85rem',
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2
        size={size}
        className="animate-spin"
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary-500)',
        }}
      />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

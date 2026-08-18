import React from 'react';

export const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const variantClass = `badge-${variant}`;
  const sizeStyle = size === 'sm' ? { fontSize: '0.7rem', padding: '0.15rem 0.5rem' } : {};

  return (
    <span className={`badge ${variantClass} ${className}`} style={sizeStyle}>
      {children}
    </span>
  );
};

export const AttendanceBadge = ({ status }) => {
  if (status === 'present') {
    return <Badge variant="success">● Present</Badge>;
  }
  if (status === 'absent') {
    return <Badge variant="danger">● Absent</Badge>;
  }
  if (status === 'leave') {
    return <Badge variant="warning">● Leave</Badge>;
  }
  return <Badge variant="primary">{status}</Badge>;
};

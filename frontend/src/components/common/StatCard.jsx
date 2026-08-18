import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorVariant = 'primary',
  onClick,
}) => {
  const iconVariantClass = `icon-${colorVariant}`;

  return (
    <div
      className="stat-card card-glow"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value ?? '—'}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>

      {Icon && (
        <div className={`stat-icon-wrapper ${iconVariantClass}`}>
          <Icon size={26} />
        </div>
      )}
    </div>
  );
};

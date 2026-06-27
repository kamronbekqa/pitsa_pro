import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel }) => {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        <div className="stat-card__icon">
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-card__value">{value}</div>
      {trend !== undefined && (
        <div className="stat-card__trend">
          <span className="trend-value">{trend}</span>
          <span className="trend-label">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

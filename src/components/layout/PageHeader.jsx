import React from 'react';
import '../../styles/global.css';

export default function PageHeader({ title, subtitle, icon, rightAction }) {
  return (
    <header className="page-header" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && <span className="page-header-icon">{icon}</span>}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}

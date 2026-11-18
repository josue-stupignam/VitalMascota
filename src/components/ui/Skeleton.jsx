import React from 'react';
import '../../styles/skeleton.css';

export function Skeleton({ width = '100%', height = 16, radius = 8 }) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton-row">
        <Skeleton width={72} height={72} radius={36} />
        <div className="skeleton-col">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
      <Skeleton width="100%" height={14} />
      <Skeleton width="85%" height={14} />
      <Skeleton width="70%" height={14} />
    </div>
  );
}

export default Skeleton;

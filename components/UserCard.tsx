"use client";

import React, { useMemo } from 'react';
import { optimizedComputeUserValue } from '@/lib/compute';
import { performanceMonitor } from '@/lib/performance';

export default function UserCard({ user }: any) {
  const expensiveValue = useMemo(() => {
    const start = performance.now();
    const val = optimizedComputeUserValue();
    const end = performance.now();
    performanceMonitor.logOperation('computeExpensiveValue', 'UserCard', end - start, 'computation');
    return val;
  }, []);

  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '15px',
        transition: 'transform 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <img
          src={user.avatar}
          alt={user.name}
          style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
        />
        <div>
          <div style={{ fontWeight: 'bold' }}>{user.name}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
        </div>
      </div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{user.bio}</div>
      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
        <span>Posts: {user.stats.posts}</span>
        <span>Followers: {user.stats.followers}</span>
        <span>Following: {user.stats.following}</span>
      </div>
      {user.details && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
          <div>Location: {user.details.location}</div>
          <div>Company: {user.details.company}</div>
          <div>Skills: {user.details.skills.join(', ')}</div>
        </div>
      )}
      <div style={{ fontSize: '11px', color: '#bbb', marginTop: '8px' }}>Computed value: {Number(expensiveValue).toFixed(2)}</div>
    </div>
  );
}

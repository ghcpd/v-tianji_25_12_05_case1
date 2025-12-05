"use client";

import React, { useMemo } from 'react';
import { optimizedComputeRelevance } from '@/lib/compute';
import { performanceMonitor } from '@/lib/performance';

export default function SearchResultItem({ result }: any) {
  const computedRelevance = useMemo(() => {
    const start = performance.now();
    const r = optimizedComputeRelevance(result.relevance);
    const end = performance.now();
    performanceMonitor.logOperation('computeRelevance', 'SearchResultItem', end - start, 'computation');
    return r;
  }, [result.relevance]);

  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '15px',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>{result.title}</div>
          <div style={{ fontSize: '14px', color: '#666' }}>{result.description}</div>
        </div>
        <span style={{
          background: result.type === 'user' ? '#667eea' : result.type === 'post' ? '#48bb78' : '#ed8936',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          textTransform: 'uppercase'
        }}>
          {result.type}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888', marginTop: '10px' }}>
        <span>By: {result.metadata.author}</span>
        <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
        <span>Relevance: {(computedRelevance * 100).toFixed(1)}%</span>
      </div>
      <div style={{ marginTop: '10px' }}>
        {result.metadata.tags.slice(0, 5).map((tag: string, idx: number) => (
          <span key={idx} style={{
            background: '#eee',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            marginRight: '5px'
          }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

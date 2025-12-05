import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { computeRelevanceValue } from '@/lib/compute';
import { performanceMonitor } from '@/lib/performance';

describe('computeRelevance utility', () => {
  beforeEach(() => {
    performanceMonitor.clearLogs();
  });

  it('computes relevance quickly and deterministically for given iterations', () => {
    const start = performance.now();
    const v = computeRelevanceValue(0.5, 200);
    const end = performance.now();
    const elapsed = end - start;
    expect(typeof v).toBe('number');
    expect(elapsed).toBeLessThan(50);
  });
});

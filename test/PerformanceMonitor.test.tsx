import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { performanceMonitor } from '@/lib/performance';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clearLogs();
  });

  it('records operations and calculates statistics', () => {
    performanceMonitor.logOperation('op1', 'A', 10, 'event');
    performanceMonitor.logOperation('op2', 'A', 50, 'computation');
    const stats = performanceMonitor.getStatistics();
    expect(stats.count).toBe(2);
    expect(stats.average).toBeGreaterThan(20);
  });
});

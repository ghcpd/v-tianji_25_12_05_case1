import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { performanceMonitor } from '../lib/performance';
import api from '../lib/api';

vi.mock('@/lib/api');

const makeAnalytics = (n = 30) => {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      date: new Date().toISOString(),
      visitors: 1000 + i,
      pageViews: 5000 + i * 10,
      bounceRate: 0.5,
      avgSessionDuration: 60,
      conversions: 10,
      revenue: 1000,
      devices: { desktop: 50, mobile: 40, tablet: 10 },
      sources: { organic: 30, direct: 40, social: 20, referral: 10 }
    });
  }
  return arr;
};

test('AnalyticsDashboard compute should be optimized under threshold', async () => {
  // Arrange
  (api as any).get = vi.fn().mockResolvedValue({ data: { analytics: makeAnalytics(30), aggregated: { totalVisitors: 10000, totalPageViews: 50000, avgBounceRate: 0.5, totalRevenue: 10000, totalConversions: 100 } } });
  performanceMonitor.clearLogs();
  performanceMonitor.setThreshold(50);

  // Act
  render(<AnalyticsDashboard />);

  // Wait for analytics to be loaded and operations to be logged
  const start = performance.now();
  render(<AnalyticsDashboard />);
  await waitFor(() => {
    expect(screen.getByText('Total Visitors')).toBeDefined();
  }, { timeout: 2000 });
  const end = performance.now();
  const elapsed = end - start;
  // Expect optimized elapsed under 300ms
  expect(elapsed).toBeLessThan(300);
});

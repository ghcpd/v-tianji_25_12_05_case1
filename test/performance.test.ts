import { describe, it, expect } from 'vitest';
import { performanceMonitor } from '../lib/performance';

describe('performance monitor', () => {
  it('logs operations and respects max log size', () => {
    performanceMonitor.clearLogs();
    performanceMonitor.setThreshold(1e9); // very high so no warnings

    for (let i = 0; i < 1200; i++) {
      performanceMonitor.logOperation('op'+i, 'TestComp', i % 10, 'computation');
    }

    const logs = performanceMonitor.getLogs();
    expect(logs.length).toBeLessThanOrEqual(1000);
  });

  it('records render times and returns stats', () => {
    performanceMonitor.clearLogs();
    const end = performanceMonitor.startRender('TestComp');
    // simulate small render
    for (let i = 0; i < 1000; i++) {
      Math.sqrt(i);
    }
    end();
    const stats = performanceMonitor.getRenderStats('TestComp');
    expect(stats.count).toBeGreaterThanOrEqual(1);
    expect(stats.total).toBeGreaterThan(0);
  });
});

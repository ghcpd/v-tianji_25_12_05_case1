import { describe, it, expect } from 'vitest';
import { calculateMetrics, formatDateString, processPostTags, computeRelevance, computeExpensiveValueOptimized } from '../lib/compute';

describe('compute utilities', () => {
  it('calculateMetrics produces expected length and numeric values', () => {
    const analytics = [
      { visitors: 100, pageViews: 200 },
      { visitors: 0, pageViews: 0 }
    ];
    const res = calculateMetrics(analytics as any);
    expect(res.length).toBe(2);
    expect(typeof res[0]).toBe('number');
  });

  it('formatDateString returns localized date', () => {
    const s = formatDateString('2020-01-01T00:00:00Z');
    expect(s).toBeDefined();
    expect(typeof s).toBe('string');
  });

  it('processPostTags normalizes tags', () => {
    const tags = ['React', ' JS ', 'Test'];
    const out = processPostTags(tags as any);
    expect(out).toEqual(['react', 'js', 'test']);
  });

  it('computeRelevance bounds value between 0 and 1', () => {
    const r = computeRelevance({ relevance: 4 });
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1);
  });

  it('computeExpensiveValueOptimized returns weighted sum', () => {
    const user = { stats: { posts: 10, followers: 50, following: 20 } };
    const v = computeExpensiveValueOptimized(user as any);
    expect(v).toBeCloseTo(10 * 0.5 + 50 * 0.3 + 20 * 0.2);
  });
});

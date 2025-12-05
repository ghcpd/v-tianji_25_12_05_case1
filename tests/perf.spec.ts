import { describe, it, expect } from 'vitest';
const {
  legacyProcessPostTags,
  optimizedProcessPostTags,
  legacyComputeUserValue,
  optimizedComputeUserValue,
  legacyComputeRelevance,
  optimizedComputeRelevance
} = require('../lib/compute.js');
const { getUsers } = require('../lib/dataService.mock.js');

function measure(fn: () => any, runs = 30) {
  const start = performance.now();
  for (let i = 0; i < runs; i++) fn();
  const end = performance.now();
  return end - start;
}

describe('Performance baseline and optimized comparisons', () => {
  it('optimizedProcessPostTags should be significantly faster than legacy', () => {
    const tags = Array.from({ length: 5 }, (_, i) => `Tag${i + 1}`);

    const legacyRuns = 200;
    const optRuns = 2000;
    const legacyTime = measure(() => legacyProcessPostTags(tags), legacyRuns);
    const optimizedTime = measure(() => optimizedProcessPostTags(tags), optRuns);

    const legacyAvg = legacyTime / legacyRuns;
    const optAvg = optimizedTime / optRuns;

    // optimized should be faster on average
    expect(optAvg).toBeLessThan(legacyAvg);
  });

  it('optimizedComputeUserValue should be faster than legacy', () => {
    const legacyRuns = 20;
    const optRuns = 200;
    const legacyTime = measure(() => legacyComputeUserValue(), legacyRuns);
    const optimizedTime = measure(() => optimizedComputeUserValue(), optRuns);

    const legacyAvg = legacyTime / legacyRuns;
    const optAvg = optimizedTime / optRuns;

    expect(optAvg).toBeLessThan(legacyAvg);
  });

  it('optimizedComputeRelevance is faster and produces value in [0,1]', () => {
    const relevance = 0.8;
    const legacyRuns = 50;
    const optRuns = 500;
    const legacyTime = measure(() => legacyComputeRelevance(relevance), legacyRuns);
    const optimizedTime = measure(() => optimizedComputeRelevance(relevance), optRuns);

    const legacyAvg = legacyTime / legacyRuns;
    const optAvg = optimizedTime / optRuns;

    expect(optAvg).toBeLessThan(legacyAvg);
    const val = optimizedComputeRelevance(relevance);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it('dataService should be faster on repeated calls due to caching', async () => {
    // Warm-up / clean cache is module-level; ensure at least two runs and compare
    // first call builds the cache
    const t1Start = performance.now();
    await getUsers(1, 20, '');
    const t1 = performance.now() - t1Start;

    // subsequent calls should be faster on average
    const nextRuns = 5;
    let sum = 0;
    for (let i = 0; i < nextRuns; i++) {
      const s = performance.now();
      await getUsers(1, 20, '');
      sum += (performance.now() - s);
    }
    const avgNext = sum / nextRuns;
    expect(avgNext).toBeLessThan(t1);
  });
});

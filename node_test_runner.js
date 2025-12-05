const assert = require('assert');
const compute = require('./lib/compute.cjs.js');
const performance = require('./lib/performance.cjs.js');

function runComputeTests() {
  // calculateMetrics
  const analytics = [{ visitors: 100, pageViews: 200 }, { visitors: 0, pageViews: 0 }];
  const metrics = compute.calculateMetrics(analytics);
  assert.strictEqual(metrics.length, 2);
  assert.strictEqual(typeof metrics[0], 'number');

  // formatDateString
  const dateStr = compute.formatDateString('2020-01-01T00:00:00Z');
  assert.strictEqual(typeof dateStr, 'string');

  // processPostTags
  const tags = ['React', ' JS ', 'Test'];
  const out = compute.processPostTags(tags);
  assert.deepStrictEqual(out, ['react', 'js', 'test']);

  // computeRelevance
  const r = compute.computeRelevance({ relevance: 4 });
  assert(r >= 0 && r <= 1);

  // computeExpensiveValueOptimized
  const user = { stats: { posts: 10, followers: 50, following: 20 } };
  const v = compute.computeExpensiveValueOptimized(user);
  assert(Math.abs(v - (10 * 0.5 + 50 * 0.3 + 20 * 0.2)) < 1e-6);
}

function runPerformanceTests() {
  // clear logs and set a high threshold
  performance.performanceMonitor.clearLogs();
  performance.performanceMonitor.setThreshold(1e9);

  for (let i = 0; i < 1200; i++) {
    performance.performanceMonitor.logOperation('op' + i, 'TestComp', i % 10, 'computation');
  }
  const logs = performance.performanceMonitor.getLogs();
  assert(logs.length <= 1000, 'logs exceeded max size');

  // render stats
  performance.performanceMonitor.clearLogs();
  const end = performance.performanceMonitor.startRender('TestComp');
  for (let i = 0; i < 1000; i++) Math.sqrt(i);
  end();
  const stats = performance.performanceMonitor.getRenderStats('TestComp');
  assert(stats.count >= 1 && stats.total >= 0);
}

try {
  runComputeTests();
  runPerformanceTests();
  console.log('All tests passed');
  process.exit(0);
} catch (err) {
  console.error('Test failed:', err);
  process.exit(1);
}

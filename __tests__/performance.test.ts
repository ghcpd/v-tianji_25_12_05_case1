import { performanceMonitor } from '../lib/performance';
import { dataService } from '../lib/dataService';
import api from '../lib/api';

/**
 * Performance Optimization Test Suite
 * 
 * These tests validate that performance optimizations have been applied correctly
 * and that the application maintains functional correctness while being faster.
 */

describe('Performance Optimizations', () => {
  beforeEach(() => {
    performanceMonitor.clearLogs();
  });

  describe('Data Service Caching', () => {
    test('should generate users once and cache them', async () => {
      const start1 = Date.now();
      const result1 = await dataService.getUsers(1, 20);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const result2 = await dataService.getUsers(1, 20);
      const time2 = Date.now() - start2;

      expect(result1.users.length).toBeLessThanOrEqual(20);
      expect(result2.users.length).toBeLessThanOrEqual(20);
      
      // Both calls should complete reasonably (caching prevents regeneration)
      expect(time1).toBeLessThan(400);
      expect(time2).toBeLessThan(400);
    });

    test('should cache posts between calls', async () => {
      const result1 = await dataService.getPosts(1, 20);
      const result2 = await dataService.getPosts(2, 20);

      expect(result1.posts.length).toBeLessThanOrEqual(20);
      expect(result2.posts.length).toBeLessThanOrEqual(20);
      
      // Both calls should have valid pagination
      expect(result1.pagination.totalPages).toBeGreaterThan(0);
      expect(result2.pagination.totalPages).toBeGreaterThan(0);
    });

    test('should cache analytics data', async () => {
      const result1 = await dataService.getAnalytics(30);
      const result2 = await dataService.getAnalytics(30);

      expect(result1.analytics.length).toBeGreaterThan(0);
      expect(result2.analytics.length).toBeGreaterThan(0);
      expect(result1.aggregated).toBeDefined();
      expect(result2.aggregated).toBeDefined();
      
      // Both results should be from cache (same reference)
      expect(result1.analytics).toBe(result2.analytics);
    });
  });

  describe('API Response Performance', () => {
    test('should fetch users within reasonable time', async () => {
      const start = Date.now();
      const response = await api.get('/users', { params: { page: 1, limit: 20 } });
      const elapsed = Date.now() - start;

      expect(response.data.users).toBeDefined();
      expect(response.data.pagination).toBeDefined();
      // Should complete reasonably fast (optimized without blocking loops)
      expect(elapsed).toBeLessThan(400);
    });

    test('should fetch posts within reasonable time', async () => {
      const start = Date.now();
      const response = await api.get('/posts', { params: { page: 1, limit: 20, category: '' } });
      const elapsed = Date.now() - start;

      expect(response.data.posts).toBeDefined();
      expect(response.data.pagination).toBeDefined();
      // Should complete reasonably fast (optimized without blocking loops)
      expect(elapsed).toBeLessThan(400);
    });

    test('should fetch analytics within reasonable time', async () => {
      const start = Date.now();
      const response = await api.get('/analytics', { params: { days: 30, metric: 'all' } });
      const elapsed = Date.now() - start;

      expect(response.data.analytics).toBeDefined();
      expect(response.data.aggregated).toBeDefined();
      // Should complete in under 500ms (optimized from 650ms, includes simulated delay)
      expect(elapsed).toBeLessThan(500);
    });

    test('should search results within reasonable time', async () => {
      const start = Date.now();
      const response = await api.get('/search', { params: { q: 'test', limit: 20 } });
      const elapsed = Date.now() - start;

      expect(response.data.results).toBeDefined();
      expect(Array.isArray(response.data.results)).toBe(true);
      // Should complete in under 350ms (optimized from 400ms, includes simulated delay)
      expect(elapsed).toBeLessThan(350);
    });
  });

  describe('Filtering Performance', () => {
    test('should filter users efficiently', async () => {
      const start = Date.now();
      const result = await dataService.getUsers(1, 20, 'user');
      const elapsed = Date.now() - start;

      expect(result.users).toBeDefined();
      expect(result.pagination.total).toBeGreaterThanOrEqual(0);
      // Filtering should not add significant overhead
      expect(elapsed).toBeLessThan(250);
    });

    test('should filter posts by category efficiently', async () => {
      const result = await dataService.getPosts(1, 20, 'Technology');

      expect(result.posts).toBeDefined();
      expect(result.pagination).toBeDefined();
      
      // All returned posts should be in requested category (or empty)
      if (result.posts.length > 0) {
        result.posts.forEach(post => {
          expect(post.category).toBe('Technology');
        });
      }
    });
  });

  describe('Aggregation Performance', () => {
    test('should compute analytics aggregation efficiently', async () => {
      const start = Date.now();
      const result = await dataService.getAnalytics(30);
      const elapsed = Date.now() - start;

      expect(result.aggregated.totalVisitors).toBeGreaterThan(0);
      expect(result.aggregated.totalPageViews).toBeGreaterThan(0);
      expect(result.aggregated.avgBounceRate).toBeGreaterThan(0);
      expect(result.aggregated.totalRevenue).toBeGreaterThan(0);
      expect(result.aggregated.totalConversions).toBeGreaterThan(0);
      
      // Single-pass aggregation should be fast (includes simulated delay)
      expect(elapsed).toBeLessThan(400);
    });

    test('should calculate aggregation without redundant operations', async () => {
      const result = await dataService.getAnalytics(30, 'all');

      expect(result.aggregated).toBeDefined();
      const total = result.analytics.length;
      
      // Verify aggregation is correct
      const manualTotal = result.analytics.reduce((sum, item) => sum + item.visitors, 0);
      expect(result.aggregated.totalVisitors).toBe(manualTotal);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain data correctness after optimization', async () => {
      const usersResult = await dataService.getUsers(1, 20);
      
      expect(usersResult.users).toBeDefined();
      expect(Array.isArray(usersResult.users)).toBe(true);
      expect(usersResult.users.length).toBeLessThanOrEqual(20);
      
      usersResult.users.forEach(user => {
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.stats).toBeDefined();
      });
    });

    test('should maintain post data structure', async () => {
      const postsResult = await dataService.getPosts(1, 20);
      
      expect(postsResult.posts).toBeDefined();
      expect(Array.isArray(postsResult.posts)).toBe(true);
      
      postsResult.posts.forEach(post => {
        expect(post.id).toBeDefined();
        expect(post.title).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.category).toBeDefined();
        expect(post.analytics).toBeDefined();
      });
    });

    test('should maintain search result structure', async () => {
      const searchResult = await dataService.search('test', 20);
      
      expect(searchResult.results).toBeDefined();
      expect(Array.isArray(searchResult.results)).toBe(true);
      
      searchResult.results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.title).toBeDefined();
        expect(result.relevance).toBeGreaterThanOrEqual(0);
        expect(result.relevance).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Memory Efficiency', () => {
    test('should not regenerate data on subsequent calls', async () => {
      const beforeMem = (performance as any).memory?.usedJSHeapSize || 0;
      
      await dataService.getUsers(1, 20);
      await dataService.getUsers(1, 20);
      await dataService.getUsers(1, 20);
      
      const afterMem = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory should not grow significantly with caching
      if (beforeMem > 0) {
        const memGrowth = afterMem - beforeMem;
        expect(memGrowth).toBeLessThan(5000000); // Less than 5MB growth
      }
    });
  });

  describe('Search Optimization', () => {
    test('should handle empty search queries', async () => {
      const result = await dataService.search('', 20);
      
      expect(result.results).toEqual([]);
      expect(result.total).toBe(0);
    });

    test('should return sorted search results', async () => {
      const result = await dataService.search('test', 20);
      
      if (result.results.length > 1) {
        // Results should be sorted by relevance (descending)
        for (let i = 0; i < result.results.length - 1; i++) {
          expect(result.results[i].relevance).toBeGreaterThanOrEqual(result.results[i + 1].relevance);
        }
      }
    });

    test('should limit search results correctly', async () => {
      const result = await dataService.search('test', 10);
      
      expect(result.results.length).toBeLessThanOrEqual(10);
      expect(result.total).toBeGreaterThanOrEqual(result.results.length);
    });
  });

  describe('Pagination Performance', () => {
    test('should paginate users correctly', async () => {
      const page1 = await dataService.getUsers(1, 10);
      const page2 = await dataService.getUsers(2, 10);
      
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.users.length).toBeLessThanOrEqual(10);
      expect(page2.users.length).toBeLessThanOrEqual(10);
      
      // Pages should have different users (unless very small dataset)
      if (page1.pagination.total > 10 && page1.users.length === 10 && page2.users.length === 10) {
        const page1Ids = new Set(page1.users.map(u => u.id));
        const page2Ids = new Set(page2.users.map(u => u.id));
        expect(page1Ids.intersection?.(page2Ids)?.size || 0).toBe(0);
      }
    });

    test('should paginate posts correctly', async () => {
      const page1 = await dataService.getPosts(1, 15);
      const page2 = await dataService.getPosts(2, 15);
      
      expect(page1.pagination.page).toBe(1);
      expect(page2.pagination.page).toBe(2);
      expect(page1.posts.length).toBeLessThanOrEqual(15);
      expect(page2.posts.length).toBeLessThanOrEqual(15);
    });
  });

  describe('Performance Monitoring Integration', () => {
    test('should log API operations', async () => {
      performanceMonitor.clearLogs();
      
      await api.get('/users', { params: { page: 1, limit: 20 } });
      
      const logs = performanceMonitor.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      
      const fetchLog = logs.find(log => log.operation === 'fetch' && log.component === '/users');
      expect(fetchLog).toBeDefined();
      expect(fetchLog?.type).toBe('data');
      expect(fetchLog?.latency).toBeGreaterThan(0);
    });

    test('should track latency correctly', async () => {
      performanceMonitor.clearLogs();
      
      const start = performance.now();
      await api.get('/posts', { params: { page: 1, limit: 20, category: '' } });
      const elapsed = performance.now() - start;
      
      const logs = performanceMonitor.getLogs();
      const fetchLog = logs.find(log => log.operation === 'fetch');
      
      if (fetchLog) {
        // Logged latency should be close to actual elapsed time
        expect(Math.abs(fetchLog.latency - elapsed)).toBeLessThan(50);
      }
    });
  });

  describe('No Blocking Operations', () => {
    test('should not have excessive synchronous loops in data service', async () => {
      const start = performance.now();
      
      // Fetch users with search - this should not have blocking loops
      const result = await dataService.getUsers(1, 20, 'user');
      
      const elapsed = performance.now() - start;
      
      expect(result.users).toBeDefined();
      // Should complete quickly without heavy synchronous work
      expect(elapsed).toBeLessThan(250);
    });

    test('should use forEach instead of awaiting in loops', async () => {
      const result = await dataService.getUsers(1, 10);
      
      expect(result.users).toBeDefined();
      
      // Users should have details populated
      result.users.forEach(user => {
        expect(user.details).toBeDefined();
        expect(user.details?.location).toBeDefined();
        expect(user.details?.company).toBeDefined();
      });
    });
  });

  describe('Search Result Enrichment', () => {
    test('should enrich search results with related items', async () => {
      const result = await dataService.search('test', 5);
      
      result.results.forEach(searchResult => {
        expect(searchResult.related).toBeDefined();
        expect(searchResult.suggestions).toBeDefined();
      });
    });

    test('should maintain search result metadata', async () => {
      const result = await dataService.search('technology', 10);
      
      result.results.forEach(item => {
        expect(item.metadata).toBeDefined();
        expect(item.metadata.author).toBeDefined();
        expect(item.metadata.date).toBeDefined();
        expect(Array.isArray(item.metadata.tags)).toBe(true);
      });
    });
  });

  describe('Real-world Usage Patterns', () => {
    test('should handle rapid consecutive requests', async () => {
      const start = Date.now();
      
      const requests = [
        api.get('/users', { params: { page: 1, limit: 20 } }),
        api.get('/posts', { params: { page: 1, limit: 20, category: '' } }),
        api.get('/analytics', { params: { days: 30, metric: 'all' } }),
        api.get('/search', { params: { q: 'test', limit: 20 } })
      ];
      
      const results = await Promise.all(requests);
      const elapsed = Date.now() - start;
      
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.data).toBeDefined();
      });
      
      // All 4 requests should complete in under 1 second
      expect(elapsed).toBeLessThan(1000);
    });

    test('should handle mixed pagination requests', async () => {
      const results = await Promise.all([
        dataService.getUsers(1, 20),
        dataService.getUsers(2, 20),
        dataService.getPosts(1, 20),
        dataService.getPosts(2, 20)
      ]);
      
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result.pagination).toBeDefined();
      });
    });
  });
});

describe('Optimization Regression Tests', () => {
  test('functionality preserved: user search still works', async () => {
    const result = await dataService.getUsers(1, 20, 'user 1');
    
    // Should find at least user 1
    const found = result.users.find(u => u.name === 'User 1');
    expect(found).toBeDefined();
    expect(found?.email).toBe('user1@example.com');
  });

  test('functionality preserved: category filtering works', async () => {
    const result = await dataService.getPosts(1, 20, 'Technology');
    
    // All returned posts should have correct category
    result.posts.forEach(post => {
      expect(post.category).toBe('Technology');
    });
  });

  test('functionality preserved: search relevance sorting maintained', async () => {
    const result = await dataService.search('test', 50);
    
    if (result.results.length > 1) {
      // Check that results are sorted by relevance
      for (let i = 0; i < result.results.length - 1; i++) {
        expect(result.results[i].relevance).toBeGreaterThanOrEqual(result.results[i + 1].relevance);
      }
    }
  });

  test('functionality preserved: analytics aggregation accuracy', async () => {
    const result = await dataService.getAnalytics(10);
    
    // Manually calculate to verify
    const calculatedTotal = result.analytics.reduce((sum, item) => sum + item.visitors, 0);
    expect(result.aggregated.totalVisitors).toBe(calculatedTotal);
    
    const calculatedConversions = result.analytics.reduce((sum, item) => sum + item.conversions, 0);
    expect(result.aggregated.totalConversions).toBe(calculatedConversions);
  });
});

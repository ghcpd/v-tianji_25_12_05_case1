import { dataService } from './dataService';
import { performanceMonitor } from './performance';

const api = {
  async get(endpoint: string, config?: { params?: any }) {
    const startTime = performance.now();
    const params = config?.params || {};
    let result: any;

    try {
      switch (endpoint) {
        case '/users':
          result = await dataService.getUsers(params.page, params.limit, params.search);
          break;
        case '/posts':
          result = await dataService.getPosts(params.page, params.limit, params.category);
          break;
        case '/analytics':
          result = await dataService.getAnalytics(params.days, params.metric);
          break;
        case '/search':
          result = await dataService.search(params.q, params.limit);
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      const endTime = performance.now();
      const latency = endTime - startTime;

      performanceMonitor.logOperation('fetch', endpoint, latency, 'data', {});

      return { data: result };
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;
      performanceMonitor.logOperation('fetch', endpoint, latency, 'data', { error: true });
      throw error;
    }
  }
};

export default api;


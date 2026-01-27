interface PerformanceLog {
  operation: string;
  component: string;
  latency: number;
  timestamp: string;
  type: 'render' | 'computation' | 'event' | 'data';
  details?: any;
}

class PerformanceMonitor {
  private logs: PerformanceLog[] = [];
  private renderTimes: Map<string, number[]> = new Map();
  private threshold: number = 100;
  private maxLogs: number = 1000;

  logOperation(operation: string, component: string, latency: number, type: PerformanceLog['type'] = 'computation', details?: any) {
    const log: PerformanceLog = {
      operation,
      component,
      latency,
      timestamp: new Date().toISOString(),
      type,
      details
    };
    this.logs.push(log);
    // Keep logs bounded to avoid memory growth and expensive operations
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(0, this.logs.length - this.maxLogs);
    }
    
    if (latency > this.threshold) {
      console.warn(`[PERFORMANCE WARNING] ${component}.${operation} exceeded threshold: ${latency}ms > ${this.threshold}ms`);
    }
  }

  startRender(component: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const latency = endTime - startTime;
      this.logOperation('render', component, latency, 'render');
      
      if (!this.renderTimes.has(component)) {
        this.renderTimes.set(component, []);
      }
      this.renderTimes.get(component)!.push(latency);
    };
  }

  getLogs(): PerformanceLog[] {
    return this.logs.slice();
  }

  getLogsByComponent(component: string): PerformanceLog[] {
    return this.logs.filter(log => log.component === component);
  }

  getAverageLatency(component?: string, type?: PerformanceLog['type']): number {
    let relevantLogs = component 
      ? this.logs.filter(log => log.component === component)
      : this.logs;
    
    if (type) {
      relevantLogs = relevantLogs.filter(log => log.type === type);
    }
    
    if (relevantLogs.length === 0) return 0;
    
    const sum = relevantLogs.reduce((acc, log) => acc + log.latency, 0);
    return sum / relevantLogs.length;
  }

  getSlowestOperations(count: number = 10): PerformanceLog[] {
    return [...this.logs]
      .sort((a, b) => b.latency - a.latency)
      .slice(0, count);
  }

  getOperationsAboveThreshold(): PerformanceLog[] {
    return this.logs.filter(log => log.latency > this.threshold);
  }

  getRenderStats(component: string) {
    const times = this.renderTimes.get(component) || [];
    if (times.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        total: 0
      };
    }

    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      total: times.reduce((a, b) => a + b, 0)
    };
  }

  getStatistics() {
    const allLatencies = this.logs.map(log => log.latency);
    if (allLatencies.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        aboveThreshold: 0,
        byType: {
          render: 0,
          computation: 0,
          event: 0,
          data: 0
        }
      };
    }

    const sorted = [...allLatencies].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    const byType = {
      render: this.getAverageLatency(undefined, 'render'),
      computation: this.getAverageLatency(undefined, 'computation'),
      event: this.getAverageLatency(undefined, 'event'),
      data: this.getAverageLatency(undefined, 'data')
    };

    return {
      count: this.logs.length,
      average: this.getAverageLatency(),
      min: Math.min(...allLatencies),
      max: Math.max(...allLatencies),
      p50: sorted[p50Index] || 0,
      p95: sorted[p95Index] || 0,
      p99: sorted[p99Index] || 0,
      aboveThreshold: this.getOperationsAboveThreshold().length,
      byType
    };
  }

  clearLogs() {
    this.logs = [];
    this.renderTimes.clear();
  }

  setThreshold(threshold: number) {
    this.threshold = threshold;
  }

  getThreshold(): number {
    return this.threshold;
  }
}

export const performanceMonitor = new PerformanceMonitor();

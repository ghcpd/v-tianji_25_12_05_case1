function PerformanceMonitor() {
  this.logs = [];
  this.renderTimes = new Map();
  this.threshold = 100;
  this.maxLogs = 1000;
}

PerformanceMonitor.prototype.logOperation = function(operation, component, latency, type, details) {
  var log = {
    operation: operation,
    component: component,
    latency: latency,
    timestamp: new Date().toISOString(),
    type: type || 'computation',
    details: details
  };
  this.logs.push(log);
  if (this.logs.length > this.maxLogs) {
    this.logs.splice(0, this.logs.length - this.maxLogs);
  }
  if (latency > this.threshold) {
    // console.warn could be noisy in tests
  }
};

PerformanceMonitor.prototype.startRender = function(component) {
  var start = Date.now();
  var self = this;
  return function() {
    var end = Date.now();
    var latency = end - start;
    self.logOperation('render', component, latency, 'render');
    if (!self.renderTimes.has(component)) self.renderTimes.set(component, []);
    self.renderTimes.get(component).push(latency);
  };
};

PerformanceMonitor.prototype.getLogs = function() {
  return this.logs.slice();
};

PerformanceMonitor.prototype.getLogsByComponent = function(component) {
  return this.logs.filter(function(l){return l.component === component;});
};

PerformanceMonitor.prototype.getAverageLatency = function(component, type) {
  var relevant = component ? this.logs.filter(function(l){return l.component===component;}) : this.logs;
  if (type) relevant = relevant.filter(function(l){return l.type===type;});
  if (relevant.length===0) return 0;
  var sum = relevant.reduce(function(a,b){return a+b.latency;},0);
  return sum / relevant.length;
};

PerformanceMonitor.prototype.getSlowestOperations = function(count){
  return this.logs.slice().sort(function(a,b){return b.latency-a.latency;}).slice(0,count);
};

PerformanceMonitor.prototype.getOperationsAboveThreshold = function(){
  return this.logs.filter(function(l){return l.latency > this.threshold;}, this);
};

PerformanceMonitor.prototype.getRenderStats = function(component){
  var times = this.renderTimes.get(component) || [];
  if (times.length===0) return { count:0, average:0, min:0, max:0, total:0 };
  var total = times.reduce(function(a,b){return a+b;},0);
  return { count: times.length, average: total / times.length, min: Math.min.apply(null, times), max: Math.max.apply(null, times), total: total };
};

PerformanceMonitor.prototype.getStatistics = function(){
  var all = this.logs.map(function(l){return l.latency;});
  if (all.length===0) return { count:0, average:0, min:0, max:0, p50:0, p95:0, p99:0, aboveThreshold:0, byType: { render:0, computation:0, event:0, data:0 } };
  var sorted = all.slice().sort(function(a,b){return a-b;});
  var p50 = Math.floor(sorted.length * 0.5);
  var p95 = Math.floor(sorted.length * 0.95);
  var p99 = Math.floor(sorted.length * 0.99);
  return {
    count: this.logs.length,
    average: this.getAverageLatency(),
    min: Math.min.apply(null, all),
    max: Math.max.apply(null, all),
    p50: sorted[p50] || 0,
    p95: sorted[p95] || 0,
    p99: sorted[p99] || 0,
    aboveThreshold: this.getOperationsAboveThreshold().length,
    byType: { render: this.getAverageLatency(undefined,'render'), computation: this.getAverageLatency(undefined,'computation'), event: this.getAverageLatency(undefined,'event'), data: this.getAverageLatency(undefined,'data') }
  };
};

PerformanceMonitor.prototype.clearLogs = function(){ this.logs = []; this.renderTimes = new Map(); };
PerformanceMonitor.prototype.setThreshold = function(t){ this.threshold = t; };
PerformanceMonitor.prototype.getThreshold = function(){ return this.threshold; };

module.exports = { performanceMonitor: new PerformanceMonitor() };

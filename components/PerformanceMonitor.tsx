'use client';

import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance';

interface PerformanceLog {
  operation: string;
  component: string;
  latency: number;
  timestamp: string;
  type: 'render' | 'computation' | 'event' | 'data';
  details?: any;
}

export default function PerformanceMonitor() {
  const [logs, setLogs] = useState(performanceMonitor.getLogs());
  const [threshold, setThreshold] = useState(performanceMonitor.getThreshold());
  const [stats, setStats] = useState(performanceMonitor.getStatistics());

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...performanceMonitor.getLogs()]);
      setStats(performanceMonitor.getStatistics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleThresholdChange = (newThreshold: number) => {
    performanceMonitor.setThreshold(newThreshold);
    setThreshold(newThreshold);
  };

  const slowestOperations = performanceMonitor.getSlowestOperations(10);
  const aboveThreshold = performanceMonitor.getOperationsAboveThreshold();
  const renderStats = {
    UserList: performanceMonitor.getRenderStats('UserList'),
    PostList: performanceMonitor.getRenderStats('PostList'),
    AnalyticsDashboard: performanceMonitor.getRenderStats('AnalyticsDashboard'),
    SearchComponent: performanceMonitor.getRenderStats('SearchComponent')
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Performance Monitor</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px' }}>Threshold (ms):</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => handleThresholdChange(Number(e.target.value))}
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100px'
            }}
          />
          <button
            onClick={() => {
              performanceMonitor.clearLogs();
              setLogs([]);
              setStats(performanceMonitor.getStatistics());
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#dc3545',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Requests</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.count}</div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Average Latency</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.average.toFixed(0)}ms</div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Min Latency</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.min}ms</div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Max Latency</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: stats.max > threshold ? '#dc3545' : '#333' }}>
            {stats.max}ms
          </div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>P95 Latency</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.p95.toFixed(2)}ms</div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>P99 Latency</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.p99.toFixed(2)}ms</div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Avg Render</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.byType.render.toFixed(2)}ms</div>
        </div>
        <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Avg Computation</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.byType.computation.toFixed(2)}ms</div>
        </div>
        <div style={{ background: aboveThreshold.length > 0 ? '#fff3cd' : '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Above Threshold</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: aboveThreshold.length > 0 ? '#856404' : '#333' }}>
            {aboveThreshold.length}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Component Render Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          {Object.entries(renderStats).map(([component, stats]) => (
            <div key={component} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>{component}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <div>Renders: {stats.count}</div>
                <div>Avg: {stats.average.toFixed(2)}ms</div>
                <div>Min: {stats.min.toFixed(2)}ms</div>
                <div>Max: {stats.max.toFixed(2)}ms</div>
                <div>Total: {stats.total.toFixed(2)}ms</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>Slowest Operations</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Component</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Operation</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Latency (ms)</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {slowestOperations.map((log, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{log.component}</td>
                  <td style={{ padding: '12px' }}>{log.operation}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: log.type === 'render' ? '#667eea' : log.type === 'computation' ? '#48bb78' : log.type === 'event' ? '#ed8936' : '#9f7aea',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: log.latency > threshold ? 'bold' : 'normal',
                    color: log.latency > threshold ? '#dc3545' : '#333'
                  }}>
                    {log.latency.toFixed(2)}ms
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>All Operations</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Component</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Operation</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Latency (ms)</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice().reverse().map((log, idx) => (
                <tr key={idx} style={{
                  borderBottom: '1px solid #eee',
                  background: log.latency > threshold ? '#fff3cd' : 'transparent'
                }}>
                  <td style={{ padding: '12px' }}>{log.component}</td>
                  <td style={{ padding: '12px' }}>{log.operation}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: log.type === 'render' ? '#667eea' : log.type === 'computation' ? '#48bb78' : log.type === 'event' ? '#ed8936' : '#9f7aea',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: log.latency > threshold ? 'bold' : 'normal',
                    color: log.latency > threshold ? '#dc3545' : '#333'
                  }}>
                    {log.latency.toFixed(2)}ms
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


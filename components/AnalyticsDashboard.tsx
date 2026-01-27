'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { performanceMonitor } from '@/lib/performance';
import { calculateMetrics, formatDateString } from '@/lib/compute';

interface AnalyticsData {
  date: string;
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  revenue: number;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  sources: {
    organic: number;
    direct: number;
    social: number;
    referral: number;
  };
}

interface AnalyticsDashboardProps {
  onLoadComplete?: (latency: number) => void;
}

export default function AnalyticsDashboard({ onLoadComplete }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState('all');
  const [aggregated, setAggregated] = useState<any>(null);

  const fetchAnalytics = async (daysCount: number, metricType: string) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await api.get('/analytics', {
        params: { days: daysCount, metric: metricType }
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      setAnalytics(response.data.analytics);
      setAggregated(response.data.aggregated);
      
      if (onLoadComplete) {
        onLoadComplete(latency);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days, metric);
  }, [days, metric]);

  useEffect(() => {
    const endRender = performanceMonitor.startRender('AnalyticsDashboard');
    return () => {
      endRender();
    };
  }, [analytics, loading, aggregated]);

  const metrics = useMemo(() => {
    const start = performance.now();
    const res = calculateMetrics(analytics);
    const end = performance.now();
    if (analytics && analytics.length > 0) {
      performanceMonitor.logOperation('calculateMetrics', 'AnalyticsDashboard', end - start, 'computation');
    }
    return res;
  }, [analytics]);

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Analytics Dashboard</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Days:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>365 days</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '10px' }}>Metric:</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All Metrics</option>
            <option value="visitors">Visitors</option>
            <option value="revenue">Revenue</option>
            <option value="conversions">Conversions</option>
          </select>
        </div>
      </div>

      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}

      {aggregated && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Visitors</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{aggregated.totalVisitors.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Page Views</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{aggregated.totalPageViews.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Avg Bounce Rate</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{(aggregated.avgBounceRate * 100).toFixed(1)}%</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${aggregated.totalRevenue.toLocaleString()}</div>
          </div>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Conversions</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{aggregated.totalConversions.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Visitors</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Page Views</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Bounce Rate</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Session Duration</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Conversions</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((item: AnalyticsData, idx: number) => {
              const formattedDate = formatDateString(item.date);
              return (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{formattedDate}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.visitors.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.pageViews.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{(item.bounceRate * 100).toFixed(1)}%</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.avgSessionDuration}s</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.conversions.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>${item.revenue.toLocaleString()}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


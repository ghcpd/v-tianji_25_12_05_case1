'use client';

import { useState } from 'react';
import UserList from '@/components/UserList';
import PostList from '@/components/PostList';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SearchComponent from '@/components/SearchComponent';
import PerformanceMonitor from '@/components/PerformanceMonitor';

export default function Home() {
  const [activeTab, setActiveTab] = useState('performance');

  const tabs = [
    { id: 'performance', label: 'Performance Monitor' },
    { id: 'users', label: 'Users' },
    { id: 'posts', label: 'Posts' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'search', label: 'Search' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
          Performance Test Application
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
          Monitor and analyze API performance metrics
        </p>
      </header>

      <div style={{ background: 'white', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '15px 30px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab.id ? '#667eea' : '#666',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'performance' && <PerformanceMonitor />}
        {activeTab === 'users' && <UserList />}
        {activeTab === 'posts' && <PostList />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'search' && <SearchComponent />}
      </div>
    </div>
  );
}


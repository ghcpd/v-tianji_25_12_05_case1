import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { test, expect, vi } from 'vitest';
import PostList from '../components/PostList';
import { performanceMonitor } from '../lib/performance';
import api from '../lib/api';

vi.mock('@/lib/api');

const makePosts = (n = 20) => {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({
      id: i,
      title: `Post ${i}`,
      content: 'Lorem ipsum dolor sit amet',
      author: { id: i, name: `Author ${i}`, avatar: '' },
      category: 'Technology',
      tags: ['tag1', 'tag2', 'tag3'],
      createdAt: new Date().toISOString(),
      views: 100 + i,
      likes: 10 + i,
      comments: 2 + i,
      image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
      analytics: { engagement: 1.2, reach: 1000, impressions: 2000 }
    });
  }
  return arr;
};

test('PostList tag processing should be optimized under threshold', async () => {
  (api as any).get = vi.fn().mockResolvedValue({ data: { posts: makePosts(20), pagination: { totalPages: 1 } } });
  performanceMonitor.clearLogs();
  performanceMonitor.setThreshold(50);

  render(<PostList />);

  const start = performance.now();
  render(<PostList />);
  await waitFor(() => {
    expect(document.querySelector('img')).not.toBeNull();
  }, { timeout: 2000 });
  const end = performance.now();
  const elapsed = end - start;
  // Expect optimized elapsed under 300ms
  expect(elapsed).toBeLessThan(300);
});

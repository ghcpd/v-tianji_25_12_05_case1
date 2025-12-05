'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/lib/api';
import { performanceMonitor } from '@/lib/performance';
import PostCard from './PostCard';

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  image: string;
  relatedPosts?: Post[];
  analytics?: {
    engagement: number;
    reach: number;
    impressions: number;
  };
}

interface PostListProps {
  onLoadComplete?: (latency: number) => void;
}

export default function PostList({ onLoadComplete }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const categories = ['Technology', 'Science', 'Arts', 'Sports', 'Business', 'Health', 'Education', 'Entertainment'];

  const fetchPosts = async (pageNum: number, categoryFilter: string) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await api.get('/posts', {
        params: { page: pageNum, limit: 20, category: categoryFilter }
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination.totalPages);
      
      if (onLoadComplete) {
        onLoadComplete(latency);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page, category);
  }, [page, category]);

  useEffect(() => {
    const endRender = performanceMonitor.startRender('PostList');
    return () => {
      endRender();
    };
  }, [posts, loading, selectedPost]);

  const handleCategoryClick = (cat: string) => {
    const startTime = performance.now();
    setCategory(cat);
    setPage(1);
    const endTime = performance.now();
    performanceMonitor.logOperation('categoryClick', 'PostList', endTime - startTime, 'event');
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Posts</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setCategory('')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            background: category === '' ? '#667eea' : '#eee',
            color: category === '' ? 'white' : '#333',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: category === cat ? '#667eea' : '#eee',
              color: category === cat ? 'white' : '#333',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {useMemo(() => posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onSelect={(p) => {
              const startTime = performance.now();
              setSelectedPost(p);
              const endTime = performance.now();
              performanceMonitor.logOperation('selectPost', 'PostList', endTime - startTime, 'event');
            }}
          />
        )), [posts])}
      </div>

      {selectedPost && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '20px', fontSize: '28px' }}>{selectedPost.title}</h2>
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '4px', marginBottom: '20px' }}
            />
            <div style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.6' }}>{selectedPost.content}</div>
            {selectedPost.relatedPosts && selectedPost.relatedPosts.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '10px' }}>Related Posts</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {selectedPost.relatedPosts.map((related) => (
                    <div key={related.id} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{related.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setSelectedPost(null)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                background: '#667eea',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            background: page === 1 ? '#ccc' : '#667eea',
            color: 'white',
            cursor: page === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        <span style={{ padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            background: page === totalPages ? '#ccc' : '#667eea',
            color: 'white',
            cursor: page === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { performanceMonitor } from '@/lib/performance';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  details?: {
    location: string;
    company: string;
    skills: string[];
  };
}

interface UserListProps {
  onLoadComplete?: (latency: number) => void;
}

export default function UserList({ onLoadComplete }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (pageNum: number, searchTerm: string) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await api.get('/users', {
        params: { page: pageNum, limit: 20, search: searchTerm }
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
      
      if (onLoadComplete) {
        onLoadComplete(latency);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search !== '') {
        fetchUsers(1, search);
        setPage(1);
      } else {
        fetchUsers(page, '');
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const endRender = performanceMonitor.startRender('UserList');
    return () => {
      endRender();
    };
  }, [users, loading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = performance.now();
    setSearch(e.target.value);
    const endTime = performance.now();
    performanceMonitor.logOperation('searchChange', 'UserList', endTime - startTime, 'event');
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Users</h2>
      
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={handleSearchChange}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px'
        }}
      />

      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {users.map((user) => {
          const computeExpensiveValue = () => {
            let sum = 0;
            for (let i = 0; i < 100000; i++) {
              sum += Math.sqrt(i) * Math.random();
            }
            return sum;
          };
          const expensiveValue = computeExpensiveValue();
          
          return (
          <div
            key={user.id}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '15px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{user.bio}</div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
              <span>Posts: {user.stats.posts}</span>
              <span>Followers: {user.stats.followers}</span>
              <span>Following: {user.stats.following}</span>
            </div>
            {user.details && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                <div>Location: {user.details.location}</div>
                <div>Company: {user.details.company}</div>
                <div>Skills: {user.details.skills.join(', ')}</div>
              </div>
            )}
          </div>
          );
        })}
      </div>

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


'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { performanceMonitor } from '@/lib/performance';
import UserCard from './UserCard';

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

  // Consolidate fetching into a single effect with both page and search as dependencies.
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers(page, search);
    }, 300);

    return () => clearTimeout(debounce);
  }, [page, search]);

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
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
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


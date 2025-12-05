'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { performanceMonitor } from '@/lib/performance';
import SearchResultItem from './SearchResultItem';

interface SearchResult {
  id: number;
  type: string;
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata: {
    author: string;
    date: string;
    tags: string[];
  };
  suggestions?: SearchResult[];
  related?: SearchResult[];
}

interface SearchComponentProps {
  onLoadComplete?: (latency: number) => void;
}

export default function SearchComponent({ onLoadComplete }: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await api.get('/search', {
        params: { q: searchQuery, limit: 20 }
      });
      
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      setResults(response.data.results);
      setTotal(response.data.total);
      
      if (onLoadComplete) {
        onLoadComplete(latency);
      }
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const endRender = performanceMonitor.startRender('SearchComponent');
    return () => {
      endRender();
    };
  }, [results, loading, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = performance.now();
    setQuery(e.target.value);
    const endTime = performance.now();
    performanceMonitor.logOperation('inputChange', 'SearchComponent', endTime - startTime, 'event');
  };

  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Search</h2>
      
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px'
        }}
      />

      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Searching...</div>}

      {query && !loading && (
        <div style={{ marginBottom: '10px', color: '#666' }}>
          Found {total} results for "{query}"
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {results.map((result) => (
          <SearchResultItem key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { performanceMonitor } from '@/lib/performance';
import { computeRelevance } from '@/lib/compute';

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
        {results.map((result) => {
          const computedRelevance = useMemo(() => {
            const start = performance.now();
            const val = computeRelevance(result);
            const end = performance.now();
            performanceMonitor.logOperation('computeRelevance', 'SearchComponent', end - start, 'computation');
            return val;
          }, [result.relevance]);
          
          return (
          <div
            key={result.id}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '15px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#f9f9f9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'white';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>{result.title}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{result.description}</div>
              </div>
              <span style={{
                background: result.type === 'user' ? '#667eea' : result.type === 'post' ? '#48bb78' : '#ed8936',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}>
                {result.type}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888', marginTop: '10px' }}>
              <span>By: {result.metadata.author}</span>
              <span>{new Date(result.metadata.date).toLocaleDateString()}</span>
              <span>Relevance: {(computedRelevance * 100).toFixed(1)}%</span>
            </div>
            <div style={{ marginTop: '10px' }}>
              {result.metadata.tags.slice(0, 5).map((tag, idx) => (
                <span key={idx} style={{
                  background: '#eee',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginRight: '5px'
                }}>
                  {tag}
                </span>
              ))}
            </div>
            {result.related && result.related.length > 0 && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>Related:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {result.related.map((related) => (
                    <div key={related.id} style={{ fontSize: '12px', color: '#888' }}>
                      {related.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}


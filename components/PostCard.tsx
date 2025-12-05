import React, { memo, useMemo } from 'react';
import { performanceMonitor } from '@/lib/performance';
import { processTags } from '@/lib/compute';

interface PostCardProps {
  post: any;
  onSelect: (post: any) => void;
}

function PostCardInner({ post, onSelect }: PostCardProps) {
  const processedTags = useMemo(() => {
    const startTime = performance.now();
    const processed = processTags(post.tags);
    const endTime = performance.now();
    performanceMonitor.logOperation('processPostData', 'PostCard', endTime - startTime, 'computation');
    return processed;
  }, [post.tags]);

  return (
    <div
      key={post.id}
      style={{
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onClick={() => onSelect(post)}
      onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';}}
      onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.transform = 'scale(1)';}}
    >
      <img
        src={post.image}
        alt={post.title}
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
      />
      <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>{post.title}</div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {post.content}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <img
          src={post.author.avatar}
          alt={post.author.name}
          style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
        />
        <span style={{ fontSize: '14px', color: '#666' }}>{post.author.name}</span>
      </div>
      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
        <span>Views: {post.views}</span>
        <span>Likes: {post.likes}</span>
        <span>Comments: {post.comments}</span>
      </div>
      <div style={{ marginTop: '10px' }}>
        <span style={{ background: '#667eea', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>
          {post.category}
        </span>
        {processedTags.slice(0, 3).map((tag: string, idx: number) => (
          <span key={idx} style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', marginRight: '5px' }}>
            {tag}
          </span>
        ))}
      </div>
      {post.analytics && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
          <div>Engagement: {post.analytics.engagement.toFixed(2)}%</div>
          <div>Reach: {post.analytics.reach.toLocaleString()}</div>
          <div>Impressions: {post.analytics.impressions.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

export const PostCard = memo(PostCardInner);

export default PostCard;

// Lightweight, optimized computation utilities used by React components.
export function calculateMetrics(analytics: any[]): number[] {
  if (!analytics || analytics.length === 0) return [];
  // Use a deterministic, low-cost aggregate instead of expensive loops
  return analytics.map(item => {
    const score = Math.sqrt(item.visitors || 0) * 0.6 + Math.log1p(item.pageViews || 0) * 0.4;
    return Number(score.toFixed(4));
  });
}

export function formatDateString(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
}

export function processPostTags(tags: string[] | undefined): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map(t => (String(t || '')).toLowerCase().trim());
}

export function computeRelevance(result: any): number {
  const base = typeof result.relevance === 'number' ? result.relevance : 0.5;
  return Math.min(1, Math.sqrt(Math.abs(base)));
}

export function computeExpensiveValueOptimized(user: any): number {
  const stats = user && user.stats ? user.stats : { posts: 0, followers: 0, following: 0 };
  return stats.posts * 0.5 + stats.followers * 0.3 + stats.following * 0.2;
}

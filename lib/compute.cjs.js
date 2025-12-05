// CommonJS runtime copy of compute utilities for Node tests
function calculateMetrics(analytics) {
  if (!analytics || analytics.length === 0) return [];
  return analytics.map(function (item) {
    var score = Math.sqrt(item.visitors || 0) * 0.6 + Math.log1p(item.pageViews || 0) * 0.4;
    return Number(score.toFixed(4));
  });
}

function formatDateString(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return dateStr;
  }
}

function processPostTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(function (t) { return String(t || '').toLowerCase().trim(); });
}

function computeRelevance(result) {
  var base = typeof result.relevance === 'number' ? result.relevance : 0.5;
  return Math.min(1, Math.sqrt(Math.abs(base)));
}

function computeExpensiveValueOptimized(user) {
  var stats = user && user.stats ? user.stats : { posts: 0, followers: 0, following: 0 };
  return stats.posts * 0.5 + stats.followers * 0.3 + stats.following * 0.2;
}

module.exports = {
  calculateMetrics: calculateMetrics,
  formatDateString: formatDateString,
  processPostTags: processPostTags,
  computeRelevance: computeRelevance,
  computeExpensiveValueOptimized: computeExpensiveValueOptimized
};

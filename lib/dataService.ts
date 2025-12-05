const generateUsers = (count: number) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      bio: `This is a detailed bio for user ${i + 1} with extensive information about their background, interests, and professional experience.`,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      stats: {
        posts: Math.floor(Math.random() * 1000),
        followers: Math.floor(Math.random() * 50000),
        following: Math.floor(Math.random() * 2000)
      }
    });
  }
  return users;
};

const generatePosts = (count: number) => {
  const posts = [];
  const categories = ['Technology', 'Science', 'Arts', 'Sports', 'Business', 'Health', 'Education', 'Entertainment'];
  
  for (let i = 0; i < count; i++) {
    posts.push({
      id: i + 1,
      title: `Post Title ${i + 1}: Exploring the Depths of Modern Technology`,
      content: `This is a comprehensive article about various topics. `.repeat(50),
      author: {
        id: Math.floor(Math.random() * 100) + 1,
        name: `Author ${Math.floor(Math.random() * 100) + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.floor(Math.random() * 1000)}`
      },
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: Array.from({ length: 5 }, (_, j) => `tag${j + 1}`),
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      views: Math.floor(Math.random() * 100000),
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 500),
      image: `https://picsum.photos/800/600?random=${i}`
    });
  }
  return posts;
};

const generateAnalytics = (days: number) => {
  const analytics = [];
  const now = Date.now();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    analytics.push({
      date: date.toISOString().split('T')[0],
      visitors: Math.floor(Math.random() * 10000) + 5000,
      pageViews: Math.floor(Math.random() * 50000) + 20000,
      bounceRate: Math.random() * 0.5 + 0.2,
      avgSessionDuration: Math.floor(Math.random() * 600) + 120,
      conversions: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      devices: {
        desktop: Math.floor(Math.random() * 5000) + 2000,
        mobile: Math.floor(Math.random() * 4000) + 1500,
        tablet: Math.floor(Math.random() * 1000) + 500
      },
      sources: {
        organic: Math.floor(Math.random() * 3000) + 1000,
        direct: Math.floor(Math.random() * 2000) + 800,
        social: Math.floor(Math.random() * 1500) + 500,
        referral: Math.floor(Math.random() * 1000) + 300
      }
    });
  }
  return analytics;
};

const generateSearchResults = (query: string, count: number) => {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push({
      id: i + 1,
      type: ['user', 'post', 'comment', 'page'][Math.floor(Math.random() * 4)],
      title: `${query} related result ${i + 1}`,
      description: `This is a detailed description of the search result related to ${query}. It contains extensive information that might be relevant to the user's query.`,
      url: `/result/${i + 1}`,
      relevance: Math.random(),
      metadata: {
        author: `Author ${i + 1}`,
        date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        tags: Array.from({ length: 10 }, (_, j) => `tag${j + 1}`)
      }
    });
  }
  return results.sort((a, b) => b.relevance - a.relevance);
};

export const dataService = {
  async getUsers(page: number = 1, limit: number = 20, search: string = '') {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 50));
    
    const allUsers = generateUsers(10000);
    let filteredUsers = allUsers;
    
    if (search) {
      filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    for (const user of paginatedUsers) {
      await new Promise(resolve => setTimeout(resolve, 5));
      user.details = {
        location: `City ${Math.floor(Math.random() * 100)}`,
        company: `Company ${Math.floor(Math.random() * 50)}`,
        skills: Array.from({ length: 10 }, (_, i) => `Skill ${i + 1}`)
      };
    }

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      }
    };
  },

  async getPosts(page: number = 1, limit: number = 20, category: string = '') {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
    
    const allPosts = generatePosts(5000);
    let filteredPosts = allPosts;
    
    if (category) {
      filteredPosts = allPosts.filter(post => post.category === category);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    for (const post of paginatedPosts) {
      await new Promise(resolve => setTimeout(resolve, 8));
      post.relatedPosts = generatePosts(10).slice(0, 5);
      post.analytics = {
        engagement: Math.random() * 100,
        reach: Math.floor(Math.random() * 100000),
        impressions: Math.floor(Math.random() * 500000)
      };
    }

    return {
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit)
      }
    };
  },

  async getAnalytics(days: number = 30, metric: string = 'all') {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 150));
    
    const allAnalytics = generateAnalytics(days);
    let processedData = allAnalytics;
    
    if (metric !== 'all') {
      processedData = allAnalytics.map(item => {
        const processed = { ...item };
        for (let i = 0; i < 100; i++) {
          processed[`computed_${i}`] = Math.random() * 1000;
        }
        return processed;
      });
    }

    const aggregated = {
      totalVisitors: processedData.reduce((sum, item) => sum + item.visitors, 0),
      totalPageViews: processedData.reduce((sum, item) => sum + item.pageViews, 0),
      avgBounceRate: processedData.reduce((sum, item) => sum + item.bounceRate, 0) / processedData.length,
      totalRevenue: processedData.reduce((sum, item) => sum + item.revenue, 0),
      totalConversions: processedData.reduce((sum, item) => sum + item.conversions, 0)
    };

    return {
      analytics: processedData,
      aggregated
    };
  },

  async search(query: string, limit: number = 20) {
    if (!query) {
      return { results: [], total: 0 };
    }

    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100));
    
    const allResults = generateSearchResults(query, 1000);
    const results = allResults.slice(0, limit);

    for (const result of results) {
      await new Promise(resolve => setTimeout(resolve, 3));
      result.suggestions = generateSearchResults(query, 5);
      result.related = generateSearchResults(query, 10).slice(0, 3);
    }

    return {
      results,
      query,
      total: allResults.length
    };
  }
};


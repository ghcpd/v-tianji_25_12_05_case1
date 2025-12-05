// Lightweight mock of dataService focusing on caching behaviour for tests
let CACHED_USERS = null;

function generateUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({ id: i + 1, name: `User ${i + 1}` });
  }
  return users;
}

async function getUsers(page = 1, limit = 20, search = '') {
  // small fixed network latency to make tests deterministic
  await new Promise(r => setTimeout(r, 60));

  if (!CACHED_USERS) {
    // simulate heavy first-time work
    CACHED_USERS = generateUsers(100000);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = CACHED_USERS.slice(startIndex, endIndex);

  return { users: paginatedUsers, pagination: { page, limit, total: CACHED_USERS.length } };
}

module.exports = { getUsers };

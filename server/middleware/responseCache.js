const RESPONSE_CACHE_TTL = 10 * 1000;

const getCache = () => {
  if (!globalThis.__retechexResponseCache) {
    globalThis.__retechexResponseCache = new Map();
  }
  return globalThis.__retechexResponseCache;
};

const hashToken = (value = '') => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const getCacheKey = (req) => {
  const authScope = hashToken(req.get('authorization') || 'public');
  return `${authScope}:${req.originalUrl}`;
};

export const clearResponseCache = () => {
  getCache().clear();
};

export const responseCache = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const cache = getCache();
  const isRead = req.method === 'GET';
  const key = isRead ? getCacheKey(req) : null;

  if (isRead) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL) {
      res.set('x-retechex-cache', 'HIT');
      return res.status(cached.status).json(cached.body);
    }
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (isRead) {
        cache.set(key, {
          timestamp: Date.now(),
          status: res.statusCode,
          body,
        });
        res.set('x-retechex-cache', 'MISS');
      } else {
        clearResponseCache();
      }
    }

    return originalJson(body);
  };

  return next();
};

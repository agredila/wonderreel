import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, AUTH_RATE_LIMIT_MAX_REQUESTS, AUTH_RATE_LIMIT_WINDOW_MS } from '../config/constants.js';

const buckets = new Map();
const authBuckets = new Map();

function checkBucket(map, key, windowMs, maxRequests, res) {
  const now = Date.now();
  let bucket = map.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    map.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > maxRequests) {
    res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' }
    });
    return false;
  }
  return true;
}

export function authRateLimit(req, res, next) {
  const key = req.ip || 'unknown';
  if (!checkBucket(authBuckets, key, AUTH_RATE_LIMIT_WINDOW_MS, AUTH_RATE_LIMIT_MAX_REQUESTS, res)) return;
  next();
}

export function rateLimit(req, res, next) {
  // Status polling during video generation — allow frequent reads
  if (req.method === 'GET' && req.path.startsWith('/api/generate/')) {
    return next();
  }

  const key = req.accountId || req.ip;
  if (!checkBucket(buckets, key, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, res)) return;
  next();
}

import { config } from '../config/index.js';

const Redis = (await import('ioredis')).default as any;
const redisUrl = process.env.REDIS_URL;

const redis = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    })
  : null;

if (redis) {
  redis.on('error', () => undefined);
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) as T : null;
    } catch {
      return null;
    }
  },
  async set(key: string, value: unknown, ttlSeconds = 300) {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // ignore cache failures in development
    }
  },
  async del(key: string) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch {
      // ignore cache failures
    }
  },
  async connect() {
    if (!redis) return;
    try {
      await redis.connect();
      if (config.env !== 'test') {
        console.info('Redis connected');
      }
    } catch {
      // continue without Redis in local/dev environments
    }
  },
};

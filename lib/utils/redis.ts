import Redis from 'ioredis'

declare global {
  // eslint-disable-next-line no-var
  var redis: Redis | undefined
}

let redis: Redis

if (typeof window === 'undefined') {
  if (global.redis) {
    redis = global.redis
  } else {
    redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    })
    global.redis = redis
  }
}

export default redis!

// Rate limiting with sliding window counter
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now()
  const windowStart = now - windowSec * 1000
  const redisKey = `rl:${key}`

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(redisKey, 0, windowStart)
  pipeline.zadd(redisKey, now, `${now}-${Math.random()}`)
  pipeline.zcard(redisKey)
  pipeline.expire(redisKey, windowSec)

  const results = await pipeline.exec()
  const count = (results?.[2]?.[1] as number) ?? 0

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetIn: windowSec,
  }
}

// Cache helper
export async function cached<T>(
  key: string,
  ttlSec: number,
  fn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached) as T

  const result = await fn()
  await redis.setex(key, ttlSec, JSON.stringify(result))
  return result
}

// Pub/Sub helper for SSE
export function createRedisSubscriber(): Redis {
  return new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
}

import { Redis } from '@upstash/redis'

// Initialize Redis client
// Upstash provides KV_REST_API_URL and KV_REST_API_TOKEN when connected via Vercel
// Fall back to UPSTASH_REDIS_REST_URL/TOKEN if those are set instead
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '',
})


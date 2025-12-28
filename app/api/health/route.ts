import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export async function GET() {
  const status = {
    redis: false,
    fallback: false,
    message: '',
    envVars: {
      hasUPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
      hasUPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      hasKV_REST_API_URL: !!process.env.KV_REST_API_URL,
      hasKV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    },
  }

  // Initialize Redis (check env vars on each request for serverless)
  let redis: Redis | null = null

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }

  if (redis) {
    try {
      // Try a simple ping operation to test connection
      await redis.ping()
      status.redis = true
      status.message = '✅ Using Upstash Redis storage'
    } catch (error: any) {
      status.message = `❌ Redis connection failed: ${error?.message || error}`
    }
  } else {
    status.fallback = true
    const missing = []
    if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
      missing.push('UPSTASH_REDIS_REST_URL or KV_REST_API_URL')
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.KV_REST_API_TOKEN) {
      missing.push('UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN')
    }
    status.message = `⚠️ Missing environment variables: ${missing.join(', ')}. Using in-memory fallback (NOT PERSISTENT)`
  }

  return NextResponse.json(status)
}


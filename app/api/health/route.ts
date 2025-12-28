import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

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

  // Check if Redis is configured
  if (!redis) {
    status.fallback = true
    const missing = []
    if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
      missing.push('UPSTASH_REDIS_REST_URL or KV_REST_API_URL')
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN && !process.env.KV_REST_API_TOKEN) {
      missing.push('UPSTASH_REDIS_REST_TOKEN or KV_REST_API_TOKEN')
    }
    status.message = `⚠️ Missing environment variables: ${missing.join(', ')}. Using in-memory fallback (NOT PERSISTENT)`
    return NextResponse.json(status)
  }

  try {
    // Try a simple ping operation to test connection
    await redis.ping()
    status.redis = true
    status.message = '✅ Using Upstash Redis storage'
  } catch (error: any) {
    status.message = `❌ Redis connection failed: ${error?.message || error}`
  }

  return NextResponse.json(status)
}


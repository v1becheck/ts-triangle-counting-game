import { NextResponse } from 'next/server'
import { createClient } from 'redis'

export async function GET() {
  const status = {
    redis: false,
    kv: false,
    fallback: false,
    message: '',
  }

  // Check Redis
  if (process.env.REDIS_URL) {
    try {
      const client = createClient({ url: process.env.REDIS_URL })
      await client.connect()
      await client.ping()
      await client.quit()
      status.redis = true
      status.message = 'Using Redis storage'
    } catch (error) {
      status.message = `Redis connection failed: ${error}`
    }
  }

  // Check Vercel KV
  if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const kv = require('@vercel/kv').kv
      await kv.ping()
      if (!status.redis) {
        status.kv = true
        status.message = 'Using Vercel KV storage'
      }
    } catch (error) {
      if (!status.redis) {
        status.message = `KV connection failed: ${error}`
      }
    }
  }

  // Fallback
  if (!status.redis && !status.kv) {
    status.fallback = true
    status.message = 'Using in-memory fallback (NOT PERSISTENT)'
  }

  return NextResponse.json(status, {
    status: status.fallback ? 200 : 200, // Still 200, but shows warning
  })
}


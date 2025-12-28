import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  const status = {
    kv: false,
    fallback: false,
    message: '',
    envVars: {
      hasKV_REST_API_URL: !!process.env.KV_REST_API_URL,
      hasKV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      hasKV_URL: !!process.env.KV_URL,
      hasREDIS_URL: !!process.env.REDIS_URL,
    },
  }

  // Check Vercel KV
  // @vercel/kv expects KV_REST_API_URL and KV_REST_API_TOKEN
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      // Try a simple get operation to test connection
      await kv.get('_health_check')
      status.kv = true
      status.message = '✅ Using Vercel KV storage'
    } catch (error: any) {
      status.message = `❌ KV connection failed: ${error?.message || error}`
    }
  } else {
    status.fallback = true
    const missing = []
    if (!process.env.KV_REST_API_URL) missing.push('KV_REST_API_URL')
    if (!process.env.KV_REST_API_TOKEN) missing.push('KV_REST_API_TOKEN')
    status.message = `⚠️ Missing environment variables: ${missing.join(', ')}. Using in-memory fallback (NOT PERSISTENT)`
  }

  return NextResponse.json(status)
}


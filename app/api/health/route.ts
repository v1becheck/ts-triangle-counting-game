import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET() {
  const status = {
    kv: false,
    fallback: false,
    message: '',
  }

  // Check Vercel KV
  // @vercel/kv expects KV_REST_API_URL and KV_REST_API_TOKEN
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      // Try a simple get operation to test connection
      await kv.get('_health_check')
      status.kv = true
      status.message = 'Using Vercel KV storage'
    } catch (error) {
      status.message = `KV connection failed: ${error}`
    }
  } else {
    status.fallback = true
    status.message = 'Using in-memory fallback (NOT PERSISTENT)'
  }

  return NextResponse.json(status)
}


import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const VOTE_KEY = 'triangle_game_votes'

// Helper function to get Redis client
// Initialize on each request to ensure env vars are available in serverless
// Try Redis.fromEnv() first (looks for UPSTASH_REDIS_REST_URL/TOKEN)
// Then fall back to KV_REST_API_URL/TOKEN (what Upstash provides)
function getRedis(): Redis | null {
  try {
    // Try fromEnv() which looks for UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
    return Redis.fromEnv()
  } catch (error) {
    // If fromEnv() fails, use KV_REST_API_URL/TOKEN (what Upstash actually provides)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      return new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    }
  }
  return null
}

// Fallback in-memory storage for development (not persistent across deployments)
let fallbackVotes: { [key: string]: number } = {
  '24': 0,
  '47': 0,
  '199': 0,
  'many': 0,
}

interface VoteData {
  [key: string]: number
}

// GET - Retrieve all votes
export async function GET(request: NextRequest) {
  // Debug endpoint - add ?debug=true to see environment variable status
  const url = new URL(request.url)
  if (url.searchParams.get('debug') === 'true') {
    return NextResponse.json({
      envVars: {
        hasUPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
        hasUPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        hasKV_REST_API_URL: !!process.env.KV_REST_API_URL,
        hasKV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      },
      upstash_url_length: process.env.UPSTASH_REDIS_REST_URL?.length || process.env.KV_REST_API_URL?.length || 0,
      upstash_token_length: process.env.UPSTASH_REDIS_REST_TOKEN?.length || process.env.KV_REST_API_TOKEN?.length || 0,
    })
  }

  // Get Redis client (check env vars on each request)
  const redis = getRedis()
  
  if (!redis) {
    console.warn('⚠️ Redis not configured. Using fallback (NOT PERSISTENT).')
    console.warn('⚠️ Looking for KV_REST_API_URL:', !!process.env.KV_REST_API_URL)
    console.warn('⚠️ Looking for KV_REST_API_TOKEN:', !!process.env.KV_REST_API_TOKEN)
    return NextResponse.json(fallbackVotes)
  }

  try {
    const votesJson = await redis.get(VOTE_KEY)
    const votes = votesJson ? (votesJson as VoteData) : null
    
    if (!votes) {
      return NextResponse.json({
        '24': 0,
        '47': 0,
        '199': 0,
        'many': 0,
      })
    }

    console.log('✅ Using Redis storage')
    return NextResponse.json(votes)
  } catch (error: any) {
    console.error('Error fetching votes:', error)
    return NextResponse.json(fallbackVotes)
  }
}

// POST - Submit a vote
export async function POST(request: NextRequest) {
  try {
    const { answer } = await request.json()

    if (!answer || !['24', '47', '199', 'many'].includes(answer)) {
      return NextResponse.json(
        { error: 'Invalid answer' },
        { status: 400 }
      )
    }

    // Get Redis client (check env vars on each request)
    const redis = getRedis()
    
    if (!redis) {
      console.warn('⚠️ Redis not configured. Using fallback (NOT PERSISTENT).')
      const currentVotes = { ...fallbackVotes }
      currentVotes[answer] = (currentVotes[answer] || 0) + 1
      fallbackVotes = { ...currentVotes }
      return NextResponse.json({ success: true, votes: currentVotes })
    }

    try {
      // Get current votes from Redis
      const votesJson = await redis.get(VOTE_KEY)
      const currentVotes = votesJson ? (votesJson as VoteData) : {
        '24': 0,
        '47': 0,
        '199': 0,
        'many': 0,
      }

      // Increment the selected answer
      currentVotes[answer] = (currentVotes[answer] || 0) + 1

      // Save back to Redis
      await redis.set(VOTE_KEY, currentVotes)

      console.log('✅ Using Redis storage - vote saved')
      return NextResponse.json({ success: true, votes: currentVotes })
    } catch (error: any) {
      console.error('Error saving vote to Redis:', error)
      // Fallback to in-memory
      const currentVotes = { ...fallbackVotes }
      currentVotes[answer] = (currentVotes[answer] || 0) + 1
      fallbackVotes = { ...currentVotes }
      return NextResponse.json({ success: true, votes: currentVotes })
    }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}


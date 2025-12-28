import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const VOTE_KEY = 'triangle_game_votes'

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

  // Check if Redis is configured
  if (!redis) {
    console.warn('⚠️ Redis not configured. Using fallback (NOT PERSISTENT).')
    console.warn('⚠️ KV_REST_API_URL:', !!process.env.KV_REST_API_URL)
    console.warn('⚠️ KV_REST_API_TOKEN:', !!process.env.KV_REST_API_TOKEN)
    console.warn('⚠️ UPSTASH_REDIS_REST_URL:', !!process.env.UPSTASH_REDIS_REST_URL)
    console.warn('⚠️ UPSTASH_REDIS_REST_TOKEN:', !!process.env.UPSTASH_REDIS_REST_TOKEN)
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

    // Check if Redis is configured
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


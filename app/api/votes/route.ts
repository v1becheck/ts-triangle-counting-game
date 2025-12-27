import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

const VOTE_KEY = 'triangle_game_votes'

// Initialize Redis client
let redisClient: ReturnType<typeof createClient> | null = null

// Try to initialize Redis if REDIS_URL is available (from marketplace Redis)
if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    })
    redisClient.on('error', (err) => console.error('Redis Client Error', err))
    // Note: We'll connect on first use to avoid connection issues
  } catch (error) {
    console.warn('Redis not available:', error)
  }
}

// Fallback: Try Vercel KV if KV_URL is available
let kv: any = null
if (!redisClient && process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
  try {
    kv = require('@vercel/kv').kv
  } catch (error) {
    console.warn('KV not available:', error)
  }
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
export async function GET() {
  try {
    // Try Redis first (from marketplace)
    if (process.env.REDIS_URL) {
      try {
        if (!redisClient) {
          redisClient = createClient({ url: process.env.REDIS_URL })
          redisClient.on('error', (err) => console.error('Redis Client Error', err))
        }
        if (!redisClient.isOpen) {
          await redisClient.connect()
        }
        const votesJson = await redisClient.get(VOTE_KEY)
        if (votesJson) {
          const votes = JSON.parse(votesJson) as VoteData
          console.log('✅ Using Redis storage')
          return NextResponse.json(votes)
        }
        console.log('✅ Using Redis storage (empty, returning defaults)')
        return NextResponse.json({
          '24': 0,
          '47': 0,
          '199': 0,
          'many': 0,
        })
      } catch (error) {
        console.error('❌ Redis connection failed:', error)
        // Fall through to other options
      }
    } else {
      console.warn('⚠️ REDIS_URL not found in environment variables')
    }

    // Fallback to Vercel KV
    if (kv && process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
      const votes = (await kv.get(VOTE_KEY)) as VoteData | null
      if (!votes) {
        return NextResponse.json({
          '24': 0,
          '47': 0,
          '199': 0,
          'many': 0,
        })
      }
      return NextResponse.json(votes)
    }

    // No storage configured
    console.warn('⚠️ No storage configured. Using fallback (NOT PERSISTENT - votes will reset).')
    console.warn('⚠️ REDIS_URL:', process.env.REDIS_URL ? 'SET' : 'NOT SET')
    console.warn('⚠️ KV_URL:', process.env.KV_URL ? 'SET' : 'NOT SET')
    return NextResponse.json(fallbackVotes)
  } catch (error) {
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

    let currentVotes: VoteData

    // Try Redis first (from marketplace)
    if (process.env.REDIS_URL) {
      try {
        if (!redisClient) {
          redisClient = createClient({ url: process.env.REDIS_URL })
          redisClient.on('error', (err) => console.error('Redis Client Error', err))
        }
        if (!redisClient.isOpen) {
          await redisClient.connect()
        }
        const votesJson = await redisClient.get(VOTE_KEY)
        currentVotes = votesJson ? (JSON.parse(votesJson) as VoteData) : {
          '24': 0,
          '47': 0,
          '199': 0,
          'many': 0,
        }
        currentVotes[answer] = (currentVotes[answer] || 0) + 1
        await redisClient.set(VOTE_KEY, JSON.stringify(currentVotes))
        console.log('✅ Using Redis storage - vote saved')
        return NextResponse.json({ success: true, votes: currentVotes })
      } catch (error) {
        console.error('❌ Redis connection failed:', error)
        // Fall through to other options
      }
    }

    // Fallback to Vercel KV
    if (kv && process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
      currentVotes = ((await kv.get(VOTE_KEY)) as VoteData | null) || {
        '24': 0,
        '47': 0,
        '199': 0,
        'many': 0,
      }
      currentVotes[answer] = (currentVotes[answer] || 0) + 1
      await kv.set(VOTE_KEY, currentVotes)
      return NextResponse.json({ success: true, votes: currentVotes })
    }

    // No storage configured - use fallback
    console.warn('⚠️ No storage configured. Using fallback (NOT PERSISTENT - votes will reset).')
    currentVotes = { ...fallbackVotes }
    currentVotes[answer] = (currentVotes[answer] || 0) + 1
    fallbackVotes = { ...currentVotes }

    return NextResponse.json({ success: true, votes: currentVotes })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}


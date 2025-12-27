import { NextRequest, NextResponse } from 'next/server'

const VOTE_KEY = 'triangle_game_votes'

// Initialize KV only if environment variables are set
let kv: any = null
try {
  if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
    kv = require('@vercel/kv').kv
  }
} catch (error) {
  console.warn('KV not available:', error)
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
    // Check if KV is configured
    if (!kv || !process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
      // Return fallback votes for development
      console.warn('KV not configured. Using fallback storage (not persistent).')
      return NextResponse.json(fallbackVotes)
    }

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
  } catch (error) {
    console.error('Error fetching votes:', error)
    // Return fallback on error
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

    // Check if KV is configured
    if (!kv || !process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
      // Use fallback storage for development
      console.warn('KV not configured. Using fallback storage (not persistent across deployments).')
      currentVotes = { ...fallbackVotes }
    } else {
      // Get current votes from KV
      currentVotes = ((await kv.get(VOTE_KEY)) as VoteData | null) || {
        '24': 0,
        '47': 0,
        '199': 0,
        'many': 0,
      }
    }

    // Increment the selected answer
    currentVotes[answer] = (currentVotes[answer] || 0) + 1

    // Save back to storage
    if (kv && process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
      // Save to KV for persistence
      await kv.set(VOTE_KEY, currentVotes)
    } else {
      // Update fallback storage
      fallbackVotes = { ...currentVotes }
    }

    return NextResponse.json({ success: true, votes: currentVotes })
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}


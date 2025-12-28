import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

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
export async function GET() {
  try {
    // Try to use KV - it will throw if env vars are missing
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
  } catch (error: any) {
    // If KV is not configured, @vercel/kv will throw an error
    if (error?.message?.includes('KV_REST_API_URL') || error?.message?.includes('environment variables')) {
      console.warn('⚠️ Vercel KV not configured. Using fallback (NOT PERSISTENT).')
      return NextResponse.json(fallbackVotes)
    }
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

    // Try to use KV - it will throw if env vars are missing
    try {
      // Get current votes from KV
      const currentVotes = ((await kv.get(VOTE_KEY)) as VoteData | null) || {
        '24': 0,
        '47': 0,
        '199': 0,
        'many': 0,
      }

      // Increment the selected answer
      currentVotes[answer] = (currentVotes[answer] || 0) + 1

      // Save back to KV
      await kv.set(VOTE_KEY, currentVotes)

      return NextResponse.json({ success: true, votes: currentVotes })
    } catch (error: any) {
      // If KV is not configured, @vercel/kv will throw an error
      if (error?.message?.includes('KV_REST_API_URL') || error?.message?.includes('environment variables')) {
        console.warn('⚠️ Vercel KV not configured. Using fallback (NOT PERSISTENT).')
        const currentVotes = { ...fallbackVotes }
        currentVotes[answer] = (currentVotes[answer] || 0) + 1
        fallbackVotes = { ...currentVotes }
        return NextResponse.json({ success: true, votes: currentVotes })
      }
      throw error // Re-throw if it's a different error
    }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}


# Triangle Counting Game

A joke puzzle game where users try to count triangles in a complex pattern. The answer is "Many" - it's designed to make people overthink it!

## Features

- Complex triangle pattern that's nearly impossible to count
- Multiple choice answers (24, 47, 199, Many)
- 30+ roast messages for incorrect answers
- Visual feedback with animations
- Real-time voting results graph
- Retry functionality

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Deploy to Vercel:
```bash
vercel
```

## Setup Vercel KV (for persistent storage)

1. Deploy to Vercel: `vercel`
2. Go to Vercel dashboard → Storage → Create Database → KV
3. Environment variables are automatically added
4. Redeploy

Or manually add to `.env.local`:
```
KV_URL=your-kv-rest-api-url
KV_REST_API_TOKEN=your-kv-rest-api-token
```

## Tech Stack

Next.js 14, TypeScript, Recharts, Vercel KV

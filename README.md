# Triangle Counting Game

A joke puzzle game where users try to count triangles in a complex pattern. The answer is "Many" - it's designed to make people overthink it!

Demo: https://ts-triangle-counting-game-h47getfne-ecoexplorers-projects.vercel.app/

## Features

- Complex triangle pattern
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

## Setup Vercel KV (for persistent storage)

According to the [Vercel Storage docs](https://vercel.com/docs/storage), KV is available through the Marketplace. Here's how to set it up:

### Option 1: Use Upstash (Recommended for KV)

1. Go to your Vercel dashboard → Your Project
2. Navigate to **Storage** → **Create Database**
3. Select **Upstash** from Marketplace Database Providers
4. Choose **Redis** when creating the database
5. Vercel will automatically add the environment variables
6. **Important**: Upstash provides `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
7. You'll need to map these to `KV_URL` and `KV_REST_API_TOKEN` in your environment variables

### Option 2: Use Redis from Marketplace

1. Go to your Vercel dashboard → Your Project
2. Navigate to **Storage** → **Create Database**
3. Select **Redis** from Marketplace Database Providers
4. Create the database
5. Get the connection details and add them as:
   - `KV_URL` = Your Redis REST API URL
   - `KV_REST_API_TOKEN` = Your Redis REST API Token

### Adding Environment Variables Manually

If the variables aren't automatically added:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - Key: `KV_URL` → Value: Your KV/Redis REST API URL
   - Key: `KV_REST_API_TOKEN` → Value: Your KV/Redis REST API Token
3. Select **All Environments** (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project for changes to take effect

### Verify Setup

After deploying, check:
- Visit `/api/health` to see storage status
- Check Vercel function logs - you should see "✅ Using Vercel KV storage" instead of fallback warnings

## Tech Stack

Next.js 14, TypeScript, Recharts, Vercel KV

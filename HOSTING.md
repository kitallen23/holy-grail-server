# Vercel Serverless Deployment

The Diablo 2 Holy Grail Server is deployed on Vercel using serverless functions with Neon PostgreSQL.

## Architecture

- **API**: `https://holy-grail-api.chuggs.net` (deployed via Route53 CNAME)
- **Backend**: Vercel Serverless Functions with Fastify
- **Database**: Neon PostgreSQL (serverless, auto-scales to zero)
- **Cost**: ~$0-5/month (Neon free tier + Vercel hobby/pro costs)

## Initial Setup

### Prerequisites

- Vercel CLI installed (`npm i -g vercel`)
- Node.js 22+ and pnpm
- Neon account (free at https://neon.tech)
- Vercel account

### Neon Database Setup

1. Create a Neon account at https://neon.tech
2. Create a new project with PostgreSQL 16 or 17
3. Choose AWS Sydney region (ap-southeast-2) for optimal performance
4. Copy your connection string from the Neon dashboard

### Environment Variables Setup

You can set environment variables via the Vercel web UI or CLI:

**Via Vercel CLI:**

```bash
# Store OAuth credentials and database connection
vercel env add DATABASE_URL
vercel env add CLIENT_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET
vercel env add BASE_URL
```

**Via Web UI:**

1. Go to your project dashboard on vercel.com
2. Navigate to Settings → Environment Variables
3. Add the required variables for all environments (Development, Preview, Production)

### Database Setup

Run migrations locally using the standard Drizzle workflow (see "Database Migrations" section below).

## Regular Deployment

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs [deployment-url]
```

**Build Process Note:** The `pnpm run vercel:build` command only runs TypeScript type checking since Vercel handles the serverless function bundling automatically.

## Database Migrations

Database migrations are handled locally using the standard Drizzle workflow.

### Running Migrations

**Initial database setup:**

```bash
# 1. Set your DATABASE_URL locally
export DATABASE_URL="postgresql://username:password@your-neon-endpoint/dbname?sslmode=require"

# 2. Push schema changes directly to Neon database
pnpm db:migrate

# 3. Deploy your API
vercel --prod
```

**Future schema changes:**

```bash
# 1. Update your schema in src/db/schema.ts
# 2. Push changes to database: pnpm db:migrate
# 3. Deploy API: vercel --prod
```

**Note:** This project uses `drizzle-kit push` which directly applies schema changes to the database. If you need versioned migration files (for team development), use `pnpm db:generate` to create migration files before pushing.

### Benefits

- ✅ Run schema changes from your local machine
- ✅ Proper schema diffing and conflict detection
- ✅ Interactive prompts for destructive changes
- ✅ No need to deploy code just to update schema
- ✅ Simple push-based workflow for rapid development

## Key Files

- `vercel.json` - Vercel deployment configuration
- `api/` - Serverless function endpoints (auto-routed by Vercel)
- `src/` - Application source code

## Environment Variables

All secrets are stored in Vercel environment variables:

- `DATABASE_URL`
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `BASE_URL`

## Domain Configuration

- **Current**: Custom domain `holy-grail-api.chuggs.net` via AWS Route53 CNAME record
- **Setup**: Route53 → CNAME → Vercel deployment URL

## Database

- **Provider**: Neon PostgreSQL (serverless)
- **Region**: AWS Sydney (ap-southeast-2) for optimal performance
- **Connection**: Pooled connection with SSL required
- **Auto-scaling**: Scales to zero when idle (free tier available)
- **Backups**: Automatic backups with point-in-time recovery

## Security Features

- Database accessible over internet with SSL/TLS encryption
- Connection pooling for optimal serverless performance
- Vercel edge network with DDoS protection
- Environment variables encrypted at rest
- Serverless functions auto-scale with built-in limits

## OAuth Configuration

OAuth callback URLs are configured for the deployed domain:

- **Google**: `https://holy-grail-api.chuggs.net/auth/google/callback`
- **Discord**: `https://holy-grail-api.chuggs.net/auth/discord/callback`

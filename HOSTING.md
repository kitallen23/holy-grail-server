# AWS Serverless Deployment

The Diablo 2 Holy Grail Server is deployed on AWS using a serverless architecture with Lambda + Neon PostgreSQL + CloudFront CDN.

## Architecture

- **API**: `https://holy-grail-api.chuggs.net` (CloudFront CDN)
- **Backend**: AWS Lambda with Fastify
- **Database**: Neon PostgreSQL (serverless, auto-scales to zero)
- **Cost**: ~$0-5/month (Neon free tier + AWS Lambda costs)

## Initial Setup

### Prerequisites

- AWS CLI configured with credentials
- AWS SAM CLI installed (`brew install aws-sam-cli`)
- Node.js 22+ and pnpm
- Neon account (free at https://neon.tech)

### Neon Database Setup

1. Create a Neon account at https://neon.tech
2. Create a new project with PostgreSQL 16 or 17
3. Choose AWS Sydney region (ap-southeast-2) for best performance
4. Copy your connection string from the Neon dashboard

### Store Secrets

```bash
# Store OAuth credentials and database password in AWS Parameter Store
aws ssm put-parameter --name "/holy-grail/prod/google-client-id" --value "your-value" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/google-client-secret" --value "your-value" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/discord-client-id" --value "your-value" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/discord-client-secret" --value "your-value" --type "String"
aws ssm put-parameter --name "/holy-grail/prod/db-password" --value "your-neon-password" --type "String"
```

### First Deployment

```bash
pnpm build
sam build
sam deploy --guided
```

Follow prompts:

- Stack name: `holy-grail-server`
- Region: `ap-southeast-4` (Melbourne)
- Environment: `prod`
- Confirm all other defaults

### Database Setup

Run migrations locally using the standard Drizzle workflow (see "Database Migrations" section below).

## Regular Deployment

```bash
# Build and deploy updates
pnpm build
sam build
sam deploy

# View logs
sam logs -n HolyGrailApi --tail
```

## Database Migrations

Database migrations are handled locally using the standard Drizzle workflow. No more complex API endpoints or VPC networking issues!

### Running Migrations

**Initial database setup:**

```bash
# 1. Set your DATABASE_URL locally
export DATABASE_URL="postgresql://username:password@your-neon-endpoint/dbname?sslmode=require"

# 2. Generate migration files from schema
pnpm db:generate

# 3. Apply migrations to Neon database
pnpm db:migrate

# 4. Build and deploy your API
pnpm build
sam build
sam deploy
```

**Future schema changes:**

```bash
# 1. Update your schema in src/db/schema.ts
# 2. Generate new migration: pnpm db:generate
# 3. Apply migration: pnpm db:migrate
# 4. Deploy API: pnpm build && sam build && sam deploy
```

### Benefits

- ✅ Run migrations from your local machine
- ✅ Proper schema diffing and conflict detection
- ✅ Interactive prompts for destructive changes
- ✅ No need to deploy code just to run migrations
- ✅ Standard Drizzle workflow that other developers expect

## Key Files

- `template.yaml` - Complete AWS infrastructure as code
- `src/lambda.ts` - Lambda handler for Fastify app
- `samconfig.toml` - Deployment configuration (safe to commit)

## Secrets Management

All secrets are stored in AWS Parameter Store:

- `/holy-grail/prod/google-client-id`
- `/holy-grail/prod/google-client-secret`
- `/holy-grail/prod/discord-client-id`
- `/holy-grail/prod/discord-client-secret`
- `/holy-grail/prod/db-password`

## CloudFront Caching

- **Cached**: `/items*` and `/runewords*` endpoints (static game data)
- **Not Cached**: `/auth*` and `/user-items*` endpoints (dynamic user data)
- **Custom Policy**: Forwards all query parameters while maintaining cache efficiency

## CloudFront Origin Request Policies

Critical configuration for OAuth and session management:

### Policy Requirements

- **`/auth*` endpoints**: Must use `AllViewerExceptHostHeader` policy
  - Forwards all query parameters (required for OAuth state validation)
  - Forwards all cookies (required for session management)
  - Without this, OAuth callbacks will fail with state validation errors

- **`/user-items*` endpoints**: Must use `AllViewerExceptHostHeader` policy  
  - Forwards session cookies for authentication
  - Must match `/auth*` policy to prevent cookie forwarding mismatches

- **`/items*` and `/runewords*`**: Can use `CORS-S3Origin` policy
  - Public endpoints that don't require cookies or complex query parameters
  - Optimized for caching static game data

### Session Cookie Configuration

Session cookies are set with `domain: ".chuggs.net"` to enable sharing between:
- Frontend: `holy-grail.chuggs.net` 
- API: `holy-grail-api.chuggs.net`

This allows the frontend to access session cookies set by the API after OAuth redirects.

## Database

- **Provider**: Neon PostgreSQL (serverless)
- **Region**: AWS Sydney (ap-southeast-2) for optimal performance with Lambda in Melbourne (ap-southeast-4)
- **Connection**: Pooled connection with SSL required
- **Auto-scaling**: Scales to zero when idle (free tier available)
- **Backups**: Automatic backups with point-in-time recovery

## Security Features

- Database accessible over internet with SSL/TLS encryption
- Connection pooling for optimal Lambda performance
- AWS Shield Standard DDoS protection
- API Gateway rate limiting
- Lambda concurrency limits prevent runaway costs
- All secrets stored in AWS Parameter Store

## OAuth Configuration

Update OAuth applications with CloudFront URLs:

- **Google**: `https://holy-grail-api.chuggs.net/auth/google/callback`
- **Discord**: `https://holy-grail-api.chuggs.net/auth/discord/callback`

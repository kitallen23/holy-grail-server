# Diablo 2 Holy Grail Server

A TypeScript backend for tracking Diablo 2 unique item collections (Holy Grail). Built with Fastify, Drizzle ORM, and PostgreSQL.

## Features

- **Authentication**: OAuth social login (Google/Discord) with session management
- **Item Tracking**: Mark Diablo 2 unique items, set items, and runewords as found/unfound
- **Public API**: Browse all items without authentication
- **Account Linking**: Automatically links accounts when using the same email across providers
- **Type Safety**: Full TypeScript support with shared type definitions

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL (via Docker)
- **ORM**: Drizzle ORM
- **Auth**: OAuth 2.0 with Google and Discord providers using @oslojs/oauth2
- **Dev Tools**: ESLint, Prettier, tsx
- **API Testing**: Bruno (collection included in `bruno/` directory)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker Desktop
- Google OAuth app (Google Cloud Console)
- Discord OAuth app (Discord Developer Portal)

### Installation

1. **Clone and install dependencies:**

    ```bash
    git clone <repo-url>
    cd holy-grail-server
    pnpm install
    ```

2. **Set up environment variables:**

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your OAuth credentials and configuration.

3. **Set up OAuth applications:**

    **Google:**

    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create OAuth 2.0 Client ID
    - Add authorized origins and redirect URIs

    **Discord:**

    - Go to [Discord Developer Portal](https://discord.com/developers/applications)
    - Create new application
    - Set up OAuth2 redirect URIs

4. **Start the database:**

    ```bash
    pnpm db:start
    ```

    This starts a PostgreSQL container via Docker.

5. **Run database migrations:**

    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```

6. **Start the development server:**
    ```bash
    pnpm dev
    ```

The server will be running at `http://localhost:3000`.

## Database Setup

The project uses PostgreSQL running in Docker for easy setup:

- **Container name**: `d2-postgres`
- **Database**: `d2_holy_grail`
- **Port**: `5432`
- **Credentials**: `postgres/password` (local development only)

### First Time Setup

If you don't have the database container yet, create it:

```bash
docker run --name d2-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=d2_holy_grail -p 5432:5432 -d postgres:15
```

### Database Commands

```bash
pnpm db:start # Start PostgreSQL container
pnpm db:stop # Stop PostgreSQL container
pnpm db:restart # Restart PostgreSQL container
pnpm db:logs # View database logs
pnpm db:generate # Generate new migrations
pnpm db:migrate # Apply migrations to database
```

## API Endpoints

### Public Routes

- `GET /health` - Health check
- `GET /items?types=uniqueItems,setItems,runes,baseItems` - Get items by type (requires types query parameter)
- `GET /items/:itemKey` - Get specific item by key
- `GET /runewords` - Get all runewords
- `GET /runewords/:runewordKey` - Get specific runeword by key

### Authentication Routes

- `GET /auth/me` - Get current user information
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/discord` - Initiate Discord OAuth login
- `GET /auth/google/callback` - Google OAuth callback (handled automatically)
- `GET /auth/discord/callback` - Discord OAuth callback (handled automatically)
- `POST /auth/logout` - Logout user

### Protected Routes (require authentication)

- `GET /user-items` - Get all user's found items
- `POST /user-items/set` - Mark single item as found/unfound
- `POST /user-items/set-bulk` - Bulk import multiple items
- `DELETE /user-items/clear` - Clear all user items

## OAuth Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Set application type to "Web application"
5. Add authorized JavaScript origins:
    - `http://localhost:5173` (development)
    - `https://yourdomain.com` (production)
6. Add authorized redirect URIs:
    - `http://localhost:3000/auth/google/callback` (development)
    - `https://yourdomain.com/auth/google/callback` (production)

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to "OAuth2" tab
4. Add redirect URIs:
    - `http://localhost:3000/auth/discord/callback` (development)
    - `https://yourdomain.com/auth/discord/callback` (production)
5. Copy Client ID and Client Secret

## API Testing

The project includes Bruno API tests in the `bruno/` directory. Install [Bruno](https://usebruno.com) and open the collection to test all endpoints.

For testing authenticated endpoints, log in through your browser first and copy the session cookie to Bruno.

Example:

- domain: localhost
- path: /
- key: session
- value: `<id>`
- Tick "HTTP Only"

## Development

### Scripts

```bash
pnpm dev # Start development server with hot reload
pnpm build # Build for production
pnpm start # Start production server
pnpm lint # Run ESLint
pnpm lint:fix # Fix ESLint issues
pnpm format # Format code with Prettier
pnpm format:check # Check code formatting
```

### Project Structure

```
src/
├── db/
│ ├── index.ts # Database connection
│ └── schema.ts # Database schema definitions
├── lib/
│ ├── auth.ts # Session management utilities
│ └── oauth.ts # OAuth URL generators
├── middleware/
│ └── auth.ts # Authentication middleware
├── routes/
│ ├── auth.ts # OAuth authentication routes
│ ├── items.ts # Item routes
│ └── userItems.ts # User item tracking routes
├── types/
│ └── items.ts # TypeScript type definitions
├── data/
│ └── items.ts # Static item data
└── server.ts # Main server file
```

## Deployment

For production deployment:

1. Update environment variables for production URLs
2. Use a managed PostgreSQL service instead of Docker
3. Configure OAuth apps with production URLs
4. Build the project: `pnpm build`
5. Start with: `pnpm start`

## Contributing

1. Follow the existing code style (ESLint + Prettier)
2. Add types for new features
3. Update API tests in Bruno
4. Test locally before submitting PRs

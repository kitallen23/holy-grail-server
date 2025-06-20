# Diablo 2 Holy Grail Server

A TypeScript backend for tracking Diablo 2 unique item collections (Holy Grail). Built with Fastify, Drizzle ORM, and PostgreSQL.

## Features

- **Authentication**: Email/password registration and login with session management
- **Item Tracking**: Mark Diablo 2 unique items, set items, and runewords as found/unfound
- **Public API**: Browse all items without authentication
- **Type Safety**: Full TypeScript support with shared type definitions

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL (via Docker)
- **ORM**: Drizzle ORM
- **Auth**: Custom implementation with Oslo crypto utilities
- **Dev Tools**: ESLint, Prettier, tsx
- **API Testing**: Bruno (collection included in `bruno/` directory)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Docker Desktop

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

    Update `.env` with your configuration (default values work for local development).

3. **Start the database:**

    ```bash
    pnpm db:start
    ```

    This starts a PostgreSQL container via Docker.

4. **Run database migrations:**

    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```

5. **Start the development server:**
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
- `GET /items` - Get all items (unique items, set items, runewords)
- `GET /items/:itemKey` - Get specific item by key

### Authentication Routes

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Protected Routes (require authentication)

- `GET /user-items` - Get user's found items
- `POST /user-items/set` - Mark item as found/unfound

## API Testing

The project includes Bruno API tests in the `bruno/` directory. Install [Bruno](https://usebruno.com) and open the collection to test all endpoints.

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
│ └── auth.ts # Authentication utilities
├── middleware/
│ └── auth.ts # Authentication middleware
├── routes/
│ ├── auth.ts # Authentication routes
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

1. Update environment variables for production
2. Use a managed PostgreSQL service instead of Docker
3. Build the project: `pnpm build`
4. Start with: `pnpm start`

## Contributing

1. Follow the existing code style (ESLint + Prettier)
2. Add types for new features
3. Update API tests in Bruno
4. Test locally before submitting PRs

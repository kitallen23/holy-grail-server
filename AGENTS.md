# Agent Guidelines for Holy Grail Server

## Build/Lint/Test Commands

- `pnpm dev` - Start development server with hot reload
- `pnpm build:vercel` - Build for Vercel deployment (TypeScript check only)
- `pnpm lint` - Run ESLint on src/
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting without changes
- No test framework configured (test script exits with error)
- **Node Version**: v22.13 (see .nvmrc)

## Code Style Guidelines

- **Imports**: Use `.js` extensions for local imports, no extensions for packages
- **Formatting**: 4-space tabs, 100 char width, semicolons, double quotes
- **Types**: Strict TypeScript, explicit return types for functions
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **Error Handling**: Use custom `HttpError` class for API errors with statusCode
- **Console**: Only `console.info/warn/error` allowed (ESLint warns on `console.log`)
- **Architecture**: Fastify server with route plugins, Drizzle ORM for database
- **File Structure**: Routes in `/routes`, types in `/types`, utilities in `/lib`

## Database

- Use `pnpm db:generate` to generate migration files (optional, for versioned migrations)
- Use `pnpm db:migrate` to push schema changes directly to database
- **Production**: Neon PostgreSQL
- **Local Development**: Docker PostgreSQL available (`pnpm db:start`, `pnpm db:stop`, etc.)
- Secrets stored in Vercel environment variables

## Deployment

- `vercel --prod` - Deploy to production
- `pnpm build:vercel` - Build for Vercel (TypeScript check only)
- Vercel handles serverless function bundling automatically

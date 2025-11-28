# SignalSync - Getting Started Guide

Welcome to SignalSync development! This guide will help you set up your development environment and start contributing.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 8+** - Install via: `corepack enable && corepack prepare pnpm@8.12.0 --activate`
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/EAasen/signalsync-core.git
cd signalsync-core
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo using pnpm workspaces.

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose a name, database password, and region
4. Wait for project creation (~2 minutes)

#### Apply Database Migrations

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and run each migration file in order:
   - `packages/database/supabase/migrations/001_initial_schema.sql`
   - `packages/database/supabase/migrations/002_rls_policies.sql`
   - `packages/database/supabase/migrations/003_functions.sql`

#### Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
```

Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Start Development Servers

```bash
pnpm dev
```

This starts:
- **Web Dashboard:** http://localhost:3000
- **Monitoring Worker:** Background service (check logs)

## 🎯 What's Next?

### Verify Everything Works

1. Open http://localhost:3000 in your browser
2. You should see the SignalSync landing page
3. Check the terminal for worker logs - it should say "Worker started successfully"

### Explore the Codebase

```
signalsync-core/
├── apps/
│   ├── web/              # Next.js dashboard - START HERE for UI work
│   └── worker/           # Monitoring engine - START HERE for backend work
├── packages/
│   ├── database/         # Database schema and migrations
│   ├── types/            # Shared TypeScript types
│   └── logger/           # Logging utility
└── .github/
    └── issues/           # Epic documentation - READ THESE for context
```

### Pick Your First Issue

1. Browse [Phase 1 issues](https://github.com/EAasen/signalsync-core/issues?q=is%3Aissue+is%3Aopen+label%3Aphase-1)
2. Look for `good first issue` label
3. Read the epic documentation in `.github/issues/`
4. Comment on the issue to claim it

### Recommended First Issues

- **Issue #7:** Monitor CRUD UI - Good for frontend developers
- **Issue #1:** HTTP Monitor Implementation - Good for backend developers
- **Issue #17:** Public Status Page - Good for full-stack developers

## 🛠️ Development Commands

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter @signalsync/web dev
pnpm --filter @signalsync/worker dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

## 🐳 Alternative: Docker Setup

If you prefer Docker:

```bash
# Copy environment file
cp .env.example .env
# Edit .env with Supabase credentials

# Start with Docker Compose
cd docker
docker-compose up
```

Access:
- Web: http://localhost:3000

## 📖 Documentation

- **Development Plan:** [DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md)
- **Project Structure:** [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md)
- **Epics Overview:** [.github/EPICS-OVERVIEW.md](.github/EPICS-OVERVIEW.md)

## 🤝 Contributing Workflow

### 1. Create a Branch

```bash
git checkout -b feature/issue-number-short-description
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation

### 3. Test Your Changes

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm dev  # Manual testing
```

### 4. Commit

Use conventional commits:

```bash
git commit -m "feat: add HTTP monitor implementation (#1)"
git commit -m "fix: resolve status page loading issue (#25)"
```

### 5. Push and Create PR

```bash
git push origin feature/issue-number-short-description
```

Then open a Pull Request on GitHub targeting `main` branch.

## 🔧 Troubleshooting

### "Cannot find module '@signalsync/...'"

```bash
# Rebuild packages
pnpm build
```

### Database Migration Errors

Make sure you ran all migrations in order:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_functions.sql`

### Worker Not Running Checks

1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Verify monitors exist in database:
   ```sql
   SELECT * FROM monitors;
   ```
3. Check worker logs for errors

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 pnpm dev
```

## 💬 Get Help

- **Discord:** [Join our community](#)
- **GitHub Discussions:** [Ask questions](https://github.com/EAasen/signalsync-core/discussions)
- **Issues:** [Report bugs](https://github.com/EAasen/signalsync-core/issues)

## 🎉 You're Ready!

Start contributing by:
1. Reading [Epic 1 documentation](.github/issues/EPIC-1-MONITORING-ENGINE.md)
2. Picking an issue to work on
3. Making your first commit

Happy coding! 🚀

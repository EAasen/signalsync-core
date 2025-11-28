# Database Package

This package contains the database schema, migrations, and Supabase client configuration for SignalSync.

## Setup

1. Create a Supabase project at https://supabase.com
2. Copy your project credentials to `.env`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

## Running Migrations

To apply migrations to your Supabase database:

### Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Manual Migration

Copy the SQL files from `supabase/migrations/` and run them in the Supabase SQL Editor:

1. `001_initial_schema.sql` - Creates tables and indexes
2. `002_rls_policies.sql` - Implements Row Level Security
3. `003_functions.sql` - Creates utility functions and views

## Generating Types

After applying migrations, generate TypeScript types:

```bash
pnpm db:generate-types
```

This creates `src/types.ts` with type-safe database definitions.

## Schema Overview

### Multi-Tenancy Hierarchy
- `organizations` → `projects` → `monitors`
- Each organization has team members with roles
- RLS policies enforce strict tenant isolation

### Core Tables
- **organizations**: Top-level tenant
- **projects**: Groups monitors within an org
- **monitors**: Uptime monitoring configurations
- **check_results**: Time-series monitoring data
- **incidents**: Downtime events and tracking
- **notification_preferences**: Alert configurations

### Security
All tables have RLS policies that enforce:
- Users can only access data from their organizations
- Role-based permissions (owner, admin, editor, viewer)
- Service role can insert check results (worker)

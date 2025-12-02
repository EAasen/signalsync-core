# Supabase Setup Instructions

## Step 1: Create Supabase Project (5 minutes)

1. **Sign in to Supabase**: https://supabase.com/dashboard
   - If you don't have an account, create one (it's free)

2. **Create a New Project**:
   - Click "New Project"
   - Choose your organization (or create one)
   - Project name: `signalsync` (or any name you prefer)
   - Database password: **Save this password!** You'll need it
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for project to initialize

3. **Get Your API Credentials**:
   - Once project is ready, go to **Settings** → **API**
   - Copy these values:
     - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role secret** key (click "Reveal") → This is your `SUPABASE_SERVICE_ROLE_KEY`

4. **Update .env File**:
   - Open `.env` in the project root
   - Replace the placeholder values with your actual credentials
   - Save the file

---

## Step 2: Apply Database Migrations

### Method 1: Using Supabase Dashboard (Recommended)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of these files **in order**:

   **Migration 1: Initial Schema**
   - File: `packages/database/supabase/migrations/001_initial_schema.sql`
   - Creates tables: organizations, projects, monitors, check_results, incidents
   - Click "Run" after pasting

   **Migration 2: RLS Policies**
   - File: `packages/database/supabase/migrations/002_rls_policies.sql`
   - Sets up Row Level Security for multi-tenancy
   - Click "Run" after pasting

   **Migration 3: Functions**
   - File: `packages/database/supabase/migrations/003_functions.sql`
   - Creates database functions and triggers
   - Click "Run" after pasting

4. **Verify Tables Created**:
   - Go to **Table Editor** in Supabase Dashboard
   - You should see: organizations, projects, monitors, check_results, incidents, team_members, notification_preferences

### Method 2: Using Supabase CLI (Alternative)

```powershell
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

---

## Step 3: Start Development Servers

Once your .env is configured and migrations are applied:

### Terminal 1 - Web Application
```powershell
cd apps\web
pnpm dev
```
This will start the Next.js app at http://localhost:3000

### Terminal 2 - Worker
```powershell
cd apps\worker
pnpm dev
```
This will start the background worker that checks monitors

---

## Verification Checklist

✅ Supabase project created  
✅ API credentials copied to .env  
✅ All 3 migrations applied successfully  
✅ Tables visible in Supabase Table Editor  
✅ Web server running on http://localhost:3000  
✅ Worker running and showing "Scheduler started" in logs  

---

## Quick Test

1. Open http://localhost:3000
2. Click "Get Started" → Sign Up
3. Enter email and password
4. You should be redirected to onboarding page
5. Create your first organization
6. You should land on the dashboard

---

## Troubleshooting

**"Missing Supabase environment variables" error**
- Check that .env file exists in project root
- Verify all three credentials are filled in (no placeholder text)
- Restart the dev server

**Migration fails with "already exists" error**
- This is okay if you're re-running migrations
- Skip to the next migration file

**Worker not starting**
- Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env
- Check that you're using the service_role key, not the anon key

**TypeScript errors**
- Run: `pnpm -r build` to build all packages
- Restart VS Code TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## Next Steps After Setup

Once everything is running, you can:
1. Sign up and create your first organization
2. Create test monitors via SQL Editor
3. Watch the worker logs to see checks executing
4. Start building the Monitor Management UI

See `docs/QUICK-START.md` for more details!

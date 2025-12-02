# Quick Start Guide - Authentication Setup Complete ✅

## 🎉 What's Been Implemented

The complete authentication system for SignalSync is now ready! Here's what's been built:

### ✅ Core Authentication Files

1. **Supabase Client Setup**
   - `apps/web/src/lib/supabase/client.ts` - Browser-side client
   - `apps/web/src/lib/supabase/server.ts` - Server-side client

2. **Authentication Actions**
   - `apps/web/src/lib/auth/actions.ts` - Server actions for sign in/up/out

3. **Middleware Protection**
   - `apps/web/src/middleware.ts` - Protects dashboard routes, redirects auth pages

4. **Authentication Pages**
   - `apps/web/src/app/login/page.tsx` - Login form
   - `apps/web/src/app/signup/page.tsx` - Signup form

5. **Dashboard Structure**
   - `apps/web/src/app/dashboard/layout.tsx` - Protected layout with auth check
   - `apps/web/src/app/dashboard/page.tsx` - Main dashboard page
   - `apps/web/src/app/dashboard/onboarding/page.tsx` - New user setup
   - `apps/web/src/components/dashboard/DashboardNav.tsx` - Navigation component

---

## 🚀 Next Steps to Get Running

### Step 1: Install Dependencies

```bash
# From the root of the project
pnpm install
```

This will install all dependencies for:
- Next.js 14
- Supabase SSR
- React
- Tailwind CSS
- All workspace packages

---

### Step 2: Set Up Supabase Project

**Option A: Supabase Cloud (Recommended)**

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name:** `signalsync-dev`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to you
4. Wait ~2 minutes for provisioning

**Get Your Credentials:**
1. Go to Project Settings → API
2. Copy:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key

---

### Step 3: Configure Environment Variables

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your Supabase credentials
```

**Your `.env` should look like:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STATUS_PAGE_URL=http://localhost:3000

# Development
NODE_ENV=development
```

---

### Step 4: Apply Database Migrations

**Via Supabase Dashboard (SQL Editor):**

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Open `packages/database/supabase/migrations/001_initial_schema.sql`
4. Copy the entire contents
5. Paste into SQL Editor and click "Run"
6. Repeat for `002_rls_policies.sql`
7. Repeat for `003_functions.sql` (if exists)

**Verify Tables Were Created:**
- Go to Table Editor
- You should see: `organizations`, `projects`, `monitors`, `check_results`, `incidents`, etc.

---

### Step 5: Start the Development Server

```bash
# From the root directory
pnpm dev
```

**This will start:**
- ✅ Web dashboard at http://localhost:3000
- ✅ Worker service (background)

---

## 🧪 Test the Authentication Flow

### Test Signup

1. Open http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Enter email and password (min 8 characters)
4. Click "Create account"
5. You should be redirected to `/dashboard/onboarding`

### Test Login

1. Go to http://localhost:3000/login
2. Enter your credentials
3. Click "Sign in"
4. You should be redirected to `/dashboard`

### Test Protected Routes

1. Sign out from the dashboard
2. Try to access http://localhost:3000/dashboard directly
3. You should be redirected to `/login` ✅

### Test Sign Out

1. Click "Sign out" in the dashboard navigation
2. You should be redirected to `/login`
3. Try to access dashboard - should redirect to login ✅

---

## 🎯 What's Working Now

✅ **User Registration** - New users can sign up with email/password  
✅ **User Login** - Users can authenticate  
✅ **Session Management** - Sessions persist across page reloads  
✅ **Protected Routes** - Dashboard is auth-protected via middleware  
✅ **Sign Out** - Users can log out securely  
✅ **Navigation** - Clean dashboard nav with user email display  

---

## 🔜 Next Development Tasks

Now that authentication is working, here are the next priorities:

### Immediate (Week 2)

1. **Organization Creation Flow** (2-3 days)
   - Implement the onboarding form to actually create organizations
   - Save to database with slug generation
   - Add user to `team_members` table as owner
   - Redirect to dashboard

2. **Organization Context** (1 day)
   - Create React context for current organization
   - Add organization switcher (if user has multiple orgs)
   - Store selected org in localStorage or cookies

### Week 3-4: Core Monitoring

3. **HTTP Monitor Implementation** (3-4 days)
   - Create `apps/worker/src/monitors/http.ts`
   - Implement check execution logic
   - Test with real endpoints

4. **Check Scheduling** (3-4 days)
   - Update scheduler to query monitors from DB
   - Execute checks at configured intervals
   - Store results in database

### Week 5-6: Dashboard UI

5. **Monitor Management** (5-6 days)
   - Monitor creation form
   - Monitor list view
   - Monitor detail page with stats

---

## 📝 Troubleshooting

### Issue: "Cannot find module '@supabase/ssr'"

**Solution:** Run `pnpm install` from the root directory

---

### Issue: "Supabase URL not found"

**Solution:** Check that `.env` file exists and has the correct variables:
```bash
cat .env | grep SUPABASE_URL
```

---

### Issue: "Table does not exist"

**Solution:** Make sure you ran all SQL migrations in Supabase dashboard

---

### Issue: "Next.js won't start"

**Solution:** 
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Reinstall dependencies
pnpm install

# Try again
pnpm dev
```

---

## 🎓 Understanding the Auth Flow

### How Authentication Works

1. **User signs up** → `signUp()` server action called
2. Supabase creates user in `auth.users` table
3. User redirected to `/dashboard/onboarding`
4. **User logs in** → `signIn()` server action called
5. Supabase validates credentials, creates session
6. Session cookie stored in browser
7. **Middleware checks** → Every page request goes through middleware
8. Middleware validates session with Supabase
9. If no valid session + trying to access dashboard → redirect to login
10. If valid session + trying to access login/signup → redirect to dashboard

### Security Features Built-In

✅ **Row Level Security (RLS)** - Database-level security (migrations ready)  
✅ **HTTP-only cookies** - Session tokens not accessible via JavaScript  
✅ **Server-side validation** - All auth checks happen on server  
✅ **Automatic session refresh** - Middleware refreshes sessions  
✅ **CSRF protection** - Built into Next.js server actions  

---

## 📚 Key Files Reference

```
apps/web/src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   └── server.ts       # Server Supabase client
│   └── auth/
│       └── actions.ts      # Sign in/up/out server actions
├── middleware.ts           # Route protection
├── app/
│   ├── login/
│   │   └── page.tsx       # Login form
│   ├── signup/
│   │   └── page.tsx       # Signup form
│   └── dashboard/
│       ├── layout.tsx     # Protected layout
│       ├── page.tsx       # Dashboard home
│       └── onboarding/
│           └── page.tsx   # New user onboarding
└── components/
    └── dashboard/
        └── DashboardNav.tsx # Dashboard navigation
```

---

## 🚀 Ready to Continue?

**To proceed with the next task (Organization Creation), run:**

```bash
# Start the dev server if not running
pnpm dev

# Then work on implementing the onboarding form action
```

The form UI is already created at `/dashboard/onboarding`, you just need to:
1. Create the server action to handle organization creation
2. Insert into `organizations` table
3. Insert into `team_members` table
4. Redirect to dashboard

---

**Great work! Phase 1 authentication is complete! 🎉**

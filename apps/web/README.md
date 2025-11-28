# Web Dashboard

The admin dashboard for SignalSync. Built with Next.js 14, React Server Components, and Tailwind CSS.

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                  # Next.js 14 App Router
│   ├── (auth)/          # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/       # Main dashboard
│   │   └── [orgSlug]/   # Organization-specific pages
│   ├── mission-control/ # Multi-org overview
│   ├── api/             # API routes
│   └── layout.tsx
├── components/          # React components
├── lib/                 # Utilities and helpers
└── styles/              # Global styles
```

## Features (Planned)

- [ ] Authentication with Supabase Auth
- [ ] Mission Control dashboard (multi-org view)
- [ ] Monitor configuration and management
- [ ] Incident management
- [ ] Team member management
- [ ] Settings and integrations

# DC AI Receptionist

An AI-powered call center dashboard built for **Developers of Chicago**.  
Connects a [Vapi](https://vapi.ai) voice assistant with [Supabase](https://supabase.com) and presents everything through a real-time Next.js dashboard.

When someone calls your business number, the AI answers, routes the call to the right department, transcribes the conversation, and logs it — all automatically, all visible live in the dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS + Realtime) |
| Auth | Supabase Auth |
| AI Voice | Vapi |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
AI-Agent-Demo/
└── dc-ai-receptionist/          # Next.js app (Vercel root directory)
    ├── app/
    │   ├── (auth)/              # Login, forgot password, reset password
    │   ├── (dashboard)/         # Protected dashboard pages
    │   │   ├── dashboard/       # Stats, charts, live call feed
    │   │   ├── calls/           # Call log + detail view
    │   │   ├── dialer/          # Outbound call launcher
    │   │   ├── departments/     # Department routing config
    │   │   ├── assistant/       # Vapi assistant settings
    │   │   └── settings/        # IVR greeting, business hours
    │   ├── api/
    │   │   ├── auth/            # Login / logout / forgot-password
    │   │   ├── calls/           # CSV export
    │   │   ├── departments/     # CRUD
    │   │   ├── settings/        # Read / update
    │   │   └── vapi/            # webhook · assistant · dialer
    │   ├── globals.css
    │   └── layout.tsx
    ├── components/
    │   ├── auth/                # LoginForm
    │   ├── calls/               # Table, filters, audio player, transcript
    │   ├── dashboard/           # Shell, sidebar, topbar, charts, stats
    │   ├── shared/              # Logo, LiveBadge
    │   └── ui/                  # shadcn/ui primitives
    ├── lib/
    │   ├── db.ts                # All Supabase queries
    │   ├── vapi.ts              # Vapi REST client
    │   ├── types.ts             # TypeScript interfaces
    │   ├── format.ts            # Phone, duration, transcript helpers
    │   ├── calls-search.ts      # URL param parser
    │   ├── supabase.ts          # Browser Supabase client
    │   ├── supabase-server.ts   # Server Supabase client
    │   └── supabase-admin.ts    # Admin client (bypasses RLS)
    ├── supabase/
    │   └── schema.sql           # Full DB schema + seed data (run once)
    ├── scripts/
    │   └── test-webhook.ts      # Local webhook test script
    ├── .env.example             # Environment variable template
    └── package.json
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/developersofchicago-company/AI-Agent-Demo.git
cd AI-Agent-Demo/dc-ai-receptionist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your real values (see [Environment Variables](#environment-variables) below).

### 4. Set up the database

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in the Supabase dashboard
3. Paste and run `supabase/schema.sql` — this creates all tables, RLS policies, and seeds default data

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (secret) |
| `VAPI_API_KEY` | Vapi Dashboard → Account → API Keys |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Vapi Dashboard → Account → API Keys |
| `VAPI_WEBHOOK_SECRET` | Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `VAPI_ASSISTANT_ID` | Vapi Dashboard → Assistants → your assistant → ID |
| `VAPI_PHONE_NUMBER_ID` | Vapi Dashboard → Phone Numbers → your number → ID |

> ⚠️ Never commit `.env.local` — it is gitignored.

---

## Vapi Webhook Setup

1. Run your app (locally with ngrok, or deploy to Vercel)
2. In **Vapi Dashboard → your assistant**:
   - **Server URL**: `https://your-domain.com/api/vapi/webhook`
   - **Server URL Secret**: value of `VAPI_WEBHOOK_SECRET` in your `.env.local`

---

## Deployment (Vercel)

1. Push to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import this repo
3. Set **Root Directory** to `dc-ai-receptionist`
4. Add all environment variables in Vercel dashboard
5. Deploy

Every `git push` to `main` auto-deploys.

---

## How It Works

```
Caller dials number
    → Vapi AI answers (Urdu / English)
    → AI routes to correct department
    → Vapi sends webhook events to /api/vapi/webhook
    → Events saved to Supabase in real time
    → Dashboard updates live (no refresh needed)
    → Recording + transcript + AI summary stored after call ends
```

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # ESLint check
npx tsx scripts/test-webhook.ts   # Test webhook locally
```

---

Built by [Developers of Chicago](https://developersofchicago.com)

# Smart Bookmark App

A full-stack bookmark manager built as a take-home assessment for ABSTRABIT. Users can save, organize, and manage bookmarks with real-time sync across tabs — all behind Google authentication.

**Live URL:** [Add your Vercel URL here]  
**GitHub:** [Add your GitHub repo URL here]

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Backend / Auth / Realtime:** Supabase (PostgreSQL + Google OAuth + Realtime)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

---

## Supabase Auth & Row Level Security

### Google OAuth Setup

Google OAuth is configured through Supabase's Authentication Providers. The flow works as follows:

1. User clicks "Continue with Google" → triggers a Server Action that calls `supabase.auth.signInWithOAuth()`
2. Supabase redirects to Google's consent screen
3. After approval, Google redirects back to `/auth/callback`
4. The callback route calls `supabase.auth.exchangeCodeForSession(code)` to complete the session
5. Middleware then refreshes the session on every request using `@supabase/ssr`

### Database Schema

```sql
create table public.bookmarks (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default timezone('utc', now()) not null,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null,
  url         text        not null,
  tags        text[]      default array[]::text[],
  description text
);
```

### Row Level Security Policies

RLS is enabled at the database level — not just the frontend. This means even if someone bypasses the UI and calls the Supabase API directly, they still cannot access another user's data.

```sql
-- Enable RLS
alter table public.bookmarks enable row level security;

-- SELECT: users can only read their own bookmarks
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

-- INSERT: users can only create bookmarks for themselves
create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can only update their own bookmarks
create policy "Users can update own bookmarks"
  on public.bookmarks for update
  using (auth.uid() = user_id);

-- DELETE: users can only delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);
```

**Why these policies are correct:**

- Every policy checks `auth.uid() = user_id` — this is the Supabase function that returns the ID of the currently authenticated user from the JWT token
- `USING` clause applies to rows being read/modified (SELECT, UPDATE, DELETE)
- `WITH CHECK` clause applies to rows being written (INSERT) — ensures the `user_id` being inserted matches the authenticated user
- `on delete cascade` on the foreign key ensures a user's bookmarks are automatically deleted when their account is removed
- Without RLS, any authenticated user could query `select * from bookmarks` and see everyone's data — RLS prevents this entirely at the database engine level

---

## Real-Time Sync

### Implementation

Real-time sync is implemented using Supabase's `postgres_changes` feature inside the `BookmarkList` client component:

```typescript
const channel = supabase
  .channel('bookmarks_realtime')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'bookmarks' },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setBookmarks(cur => [payload.new as Bookmark, ...cur])
      } else if (payload.eventType === 'DELETE') {
        setBookmarks(cur => cur.filter(b => b.id !== payload.old.id))
      } else if (payload.eventType === 'UPDATE') {
        setBookmarks(cur => cur.map(b => b.id === payload.new.id ? payload.new as Bookmark : b))
      }
    }
  )
  .subscribe()
```

### How it works

- Supabase Realtime listens for PostgreSQL WAL (Write-Ahead Log) changes on the `bookmarks` table
- When any INSERT, UPDATE, or DELETE happens, Supabase pushes the change over a WebSocket connection to all subscribed clients
- RLS applies to Realtime too — users only receive events for rows they have SELECT access to (i.e. their own bookmarks)
- The React state is updated directly from the payload without needing a full page refresh or re-fetch

### Subscription cleanup

The subscription is created inside a `useEffect` and properly cleaned up on unmount to prevent memory leaks and duplicate listeners:

```typescript
useEffect(() => {
  const channel = supabase.channel('bookmarks_realtime').on(...).subscribe()
  return () => {
    supabase.removeChannel(channel) // cleanup on unmount
  }
}, [supabase])
```

This ensures that if the component unmounts (e.g. user navigates away), the WebSocket channel is properly closed.

---

## Bonus Feature — Smart Tagging System

I added a **tagging system** as the bonus feature.

**What it does:**
- Users can add up to 5 tags when saving a bookmark
- Tags appear as colored badges on each bookmark card
- A tag filter bar appears automatically once any tag exists
- Clicking a tag filters the list to only show bookmarks with that tag
- A search bar lets users search across title, URL, and description

**Why I chose this:**

Bookmarks quickly become unmanageable without organization. Tags solve this at the right level of complexity — they're simple enough to add in seconds but powerful enough to organize hundreds of links. I deliberately chose tags over folders because a bookmark can belong to multiple categories (e.g. a Next.js tutorial is both "learning" and "javascript"), which folders don't support well.

From a product sense perspective, the first time a user has 20+ bookmarks with no way to filter them is the moment they abandon the app. Tags prevent that.

---

## Problems & Solutions

**1. Hydration mismatch on date formatting**  
`toLocaleDateString()` returns different formats on the server (Node.js) vs the client (browser locale). Fixed by passing an explicit locale: `toLocaleDateString('en-GB')` so both server and client render the same string.

**2. CSS `@import` ordering error**  
Placing a Google Fonts `@import url()` after `@import "tailwindcss"` in globals.css caused a PostCSS parse error because `@import` rules must precede all other rules. Fixed by loading the font via `next/font/google` in `layout.tsx` instead — which is the correct Next.js pattern and also provides automatic font optimization.

**3. Supabase middleware session refresh**  
Without properly refreshing the session in middleware, server components would sometimes see a stale/expired session and redirect logged-in users back to the login page. Fixed by implementing the Supabase SSR middleware pattern that refreshes the session cookie on every request before the route handler runs.

**4. Realtime not filtering by user**  
Initially worried that Realtime would broadcast all users' bookmark changes. Verified that Supabase Realtime respects RLS policies — users only receive change events for rows they have access to. No extra filtering needed in the client.

---

## What I'd Improve With More Time

If I had more time, I would add **full-text search** powered by PostgreSQL's `tsvector`. The current search is client-side (filtering already-loaded bookmarks), which works fine for small collections but doesn't scale. A server-side `fts` column on the bookmarks table with a GIN index would allow efficient search across thousands of bookmarks and could be exposed via a Supabase RPC function.

---

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd smart-bookmark-app
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run the SQL setup in Supabase SQL Editor
# (contents of supabase-setup.sql)

# 4. Configure Google OAuth in Supabase Dashboard
# Authentication → Providers → Google

# 5. Start development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Your deployment URL (for OAuth redirect) |

---

## Project Structure

```
smart-bookmark-app/
├── app/
│   ├── actions/
│   │   ├── auth.ts          # signInWithGoogle, signOut server actions
│   │   └── bookmarks.ts     # createBookmark, deleteBookmark server actions
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts     # OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx         # Main dashboard (server component)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Login page
├── components/
│   ├── AddBookmarkForm.tsx  # Add bookmark modal (client)
│   ├── BookmarkCard.tsx     # Individual bookmark card (client)
│   ├── BookmarkList.tsx     # List + real-time subscription (client)
│   └── DeleteConfirmDialog.tsx
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       └── server.ts        # Server Supabase client
├── types/
│   └── database.ts          # TypeScript types for DB schema
├── middleware.ts             # Session refresh + route protection
└── supabase-setup.sql       # Database schema + RLS policies
```

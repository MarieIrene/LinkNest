# LinkNest

Smart NFC business cards backed by a Linktree-style profile. Each user gets one public page (`/username`);
their NFC card or social media tag is programmed with `/c/<user id>`, so tapping it on a phone pops up a
notification that opens the profile.
Built with Next.js 15 (App Router, TypeScript), PostgreSQL, Prisma ORM and Tailwind CSS.

Brand colors: primary `#164E63`, secondary `#5EEAD4` (see `tailwind.config.ts`).

## Features

- Sign up and log in (bcrypt-hashed passwords, signed HTTP-only session cookie)
- Forgot password: one-time reset link by email (via Resend; printed in the terminal when `RESEND_API_KEY` is empty)
- Claim a username; your page lives at `/your-username`
- Add, edit, delete, hide/show and reorder links
- Live phone preview in the dashboard
- Page-view and per-link click counting (clicks go through `/go/:id`)
- Profile: name, username, bio, photo upload (cropped and resized in the browser) or photo link
- Links by type (Instagram, LinkedIn, WhatsApp, TikTok, email, phone, location…), each shown with its icon;
  handles and phone numbers are turned into full URLs
- NFC card link `/c/:id` that survives username changes and counts card taps
- Landing page with pricing (Business Smart Card 10,000 RWF, Social Media Tag 5,000 RWF) and a booking form;
  staff listed in `ADMIN_EMAILS` see bookings at `/dashboard/bookings`
- Input validation with Zod on every API route; unsafe URLs such as `javascript:` are rejected

## Getting started

Requirements: Node.js 18.18+ and PostgreSQL 14+ (or Docker).

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL and a random AUTH_SECRET (openssl rand -base64 32)

# 3. Start PostgreSQL (skip if you already have one running)
docker compose up -d

# 4. Create the database tables
npx prisma migrate dev --name init

# 5. Optional: add a demo account (demo@linknest.app / password123)
npm run db:seed

# 6. Run the app
npm run dev
```

Open http://localhost:3000, create an account, then visit http://localhost:3000/your-username.

## Project structure

```
prisma/
  schema.prisma          User and Link models
  seed.ts                Demo data
src/
  middleware.ts          Protects /dashboard, redirects signed-in users away from /login
  lib/
    prisma.ts            Shared Prisma client
    session-token.ts     JWT sign/verify (edge-safe, used by middleware)
    auth.ts              Read the current user, set or clear the session cookie
    validations.ts       Zod schemas, username rules, URL normalisation
    api.ts               JSON error helpers for route handlers
    client-api.ts        fetch wrapper used by client components
  components/
    LinkPage.tsx         The public page (also used for the dashboard preview)
    dashboard/           Dashboard UI: share bar, add form, link list and rows, profile form
  app/
    page.tsx             Landing page
    (auth)/login, register
    dashboard/           Signed-in area
    [username]/          Public profile page
    go/[id]/             Click counter + redirect
    api/                 REST endpoints (below)
```

## API

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account `{ email, username, password }` |
| POST | `/api/auth/login` | Log in `{ email, password }` |
| POST | `/api/auth/logout` | Log out |
| POST | `/api/auth/forgot-password` | Email a 1-hour reset link `{ email }` (same answer whether or not the account exists) |
| POST | `/api/auth/reset-password` | Set a new password from the link `{ token, password }`, then log in |
| GET | `/api/links` | List your links |
| POST | `/api/links` | Create `{ platform?, title?, url }` |
| PATCH | `/api/links/:id` | Update `{ platform?, title?, url?, isActive? }` |
| DELETE | `/api/links/:id` | Delete a link |
| PUT | `/api/links/reorder` | Save order `{ ids: string[] }` |
| GET | `/api/profile` | Your profile |
| PATCH | `/api/profile` | Update `{ username?, displayName?, bio?, avatarUrl? }` |
| GET | `/go/:id` | Public: count a click and redirect |
| GET | `/c/:userId` | Public: NFC card target. Counts a tap and redirects to the profile |
| POST | `/api/bookings` | Public: book a card `{ product, quantity, name, phone, email?, message? }` |

All `/api/links` and `/api/profile` routes require a session and only touch the signed-in user's data.

## Deploying

1. Create a hosted PostgreSQL database (Neon, Supabase, Railway, etc.).
2. Set `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL` in your host (e.g. Vercel).
3. Run `npx prisma migrate deploy` against the production database.
4. Build with `npm run build`.

## Ideas for next steps

- Drag-and-drop reordering (e.g. `@dnd-kit`)
- Move uploaded photos to object storage if they grow beyond small avatars
- "Save contact" (vCard) button on profiles
- Themes per user, scheduled links
- Rate limiting on login and the `/go` counter
- Analytics by day and by referrer

# Supabase + Google OAuth setup

The site runs without any of this — the public landing page, the logo, the nav, and the
footer all render fine with no credentials, and protected routes send visitors to a sign-in
page that explains the situation. Follow this when you are ready to turn on accounts.

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com).
2. Note the **Project URL** and the **anon public** key from *Project Settings → API*.
3. From the same page, copy the **service_role** key. Treat it like a password — it bypasses
   every row-level-security policy in the database.

## 2. Run the schema

Open *SQL Editor* in the Supabase dashboard, paste the whole of
[`supabase/schema.sql`](../supabase/schema.sql), and run it. It is idempotent, so re-running
after a change is safe.

This creates seven tables, enables RLS on all of them, and adds:

- a trigger that creates a `profiles` row automatically on first sign-in
- a trigger that blocks a user from granting themselves `is_admin`
- `unique (slot_id) where status <> 'cancelled'` on `demo_bookings` — the constraint that makes
  double-booking impossible regardless of application code
- `unique (user_id)` on `applications` — one application per person

## 3. Configure Google OAuth

**In Google Cloud Console:**

1. *APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application*.
2. Under **Authorized redirect URIs**, add your Supabase callback:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret**.

**In Supabase:**

1. *Authentication → Providers → Google* → enable it.
2. Paste the Client ID and Client secret. Save.
3. *Authentication → URL Configuration* → set **Site URL** to your deployed origin, and add
   these to **Redirect URLs**:
   - `http://localhost:3200/auth/callback` (local development)
   - `https://<your-domain>/auth/callback` (production)

## 4. Environment variables

Create `.env.local` in the repo root (it is gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

Set the same three in Vercel under *Project Settings → Environment Variables*.

**The service-role key must never carry a `NEXT_PUBLIC_` prefix.** `lib/supabase/admin.ts`
imports `server-only`, so importing it from a Client Component is a build error — but the
prefix rule is the thing that actually keeps it out of the browser bundle.

## 5. Make yourself an admin

There is no UI for this on purpose — self-service admin promotion is how an admin panel
becomes public. Sign in once through the site so your `profiles` row exists, then run this in
the SQL editor:

```sql
update public.profiles
set is_admin = true
where email = 'you@example.com';
```

`/admin` becomes reachable immediately. The trigger from step 2 means a signed-in user cannot
set this column on themselves through the API — only the service role can change it.

## 6. Publish some call availability

Applicants can only book times that exist. Go to **/admin → Availability** and add a few
slots, otherwise the booking step honestly reports that no times are open.

## Verifying it works

| Check | Expected |
| --- | --- |
| Visit `/dashboard` signed out | Redirect to `/signin?next=/dashboard` |
| Sign in with Google | Land back on `/dashboard`; a `profiles` row exists |
| Visit `/admin` as a non-admin | Redirect to `/dashboard`, no admin content rendered |
| `POST /api/admin/partners` as a non-admin | `403`, regardless of client state |
| Book the same slot from two browsers | One succeeds; the other gets `409` and a clear message |
| Submit an application twice | Second returns `ok: true, duplicate: true`, no second row |

## What is deliberately absent

The `partners` and `site_content` tables ship **empty**, and there are no seed rows anywhere
in the schema. The Global Spotlight renders a written empty state until real chapter leaders
are published, and the landing page's fourth stat tile does not exist until an admin sets a
real chapter count. This is a product requirement, not an oversight — see
[`docs/SPEC.md`](./SPEC.md) §"Verified facts".

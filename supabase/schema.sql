-- ============================================================================
-- Financing the Future — database schema
-- Run this once in the Supabase SQL editor. Idempotent: safe to re-run.
--
-- Design note: every table has RLS enabled and an explicit policy. There is no
-- "allow all" policy anywhere. If a query needs to cross a user boundary it
-- goes through the service-role client behind a server-side admin check.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles — mirrors auth.users with app-level fields
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: update own non-privileged fields" on public.profiles;
create policy "profiles: update own non-privileged fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Privilege escalation guard: a user may update their own row, but must not be
-- able to flip their own is_admin. RLS `with check` cannot see the OLD row, so
-- this is enforced with a trigger instead.
create or replace function public.prevent_self_admin_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    -- Only the service role (which bypasses RLS and runs as `service_role`)
    -- may change this column.
    if current_setting('request.jwt.claims', true)::jsonb ->> 'role'
       is distinct from 'service_role' then
      raise exception 'is_admin cannot be modified by this role';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_admin_grant on public.profiles;
create trigger profiles_prevent_self_admin_grant
  before update on public.profiles
  for each row execute function public.prevent_self_admin_grant();

-- Create the profile row automatically on signup, from the Google identity.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.application_status as enum
    ('new', 'demo_scheduled', 'onboarded', 'active_chapter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.applying_as as enum ('individual', 'team');
exception when duplicate_object then null; end $$;

create table if not exists public.applications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  full_name      text not null,
  email          text not null,
  organization   text not null,
  city           text not null,
  country        text not null,
  grade_or_role  text not null,
  motivation     text not null,
  applying_as    public.applying_as not null default 'individual',
  team_details   text,
  status         public.application_status not null default 'new',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- One application per user. Enforced here, not in application code, so a
-- double-submit or a concurrent request cannot create a duplicate.
create unique index if not exists applications_user_id_key
  on public.applications (user_id);

alter table public.applications enable row level security;

drop policy if exists "applications: read own" on public.applications;
create policy "applications: read own"
  on public.applications for select
  using (auth.uid() = user_id);

drop policy if exists "applications: insert own" on public.applications;
create policy "applications: insert own"
  on public.applications for insert
  with check (auth.uid() = user_id);

-- Note: no user-facing UPDATE policy. Status transitions are an admin action
-- and run through the service-role client after `requireAdminApi()`.

-- ---------------------------------------------------------------------------
-- demo_slots — admin-defined availability
-- ---------------------------------------------------------------------------
create table if not exists public.demo_slots (
  id               uuid primary key default gen_random_uuid(),
  starts_at        timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 240),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create unique index if not exists demo_slots_starts_at_key on public.demo_slots (starts_at);
create index if not exists demo_slots_active_idx on public.demo_slots (starts_at) where is_active;

alter table public.demo_slots enable row level security;

-- Any signed-in user may see the slot list in order to book one.
drop policy if exists "demo_slots: read active" on public.demo_slots;
create policy "demo_slots: read active"
  on public.demo_slots for select
  to authenticated
  using (is_active);

-- ---------------------------------------------------------------------------
-- demo_bookings
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.booking_format as enum ('video', 'phone');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum
    ('confirmed', 'cancelled', 'completed', 'no_show');
exception when duplicate_object then null; end $$;

create table if not exists public.demo_bookings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  slot_id    uuid not null references public.demo_slots (id) on delete restrict,
  timezone   text not null,
  format     public.booking_format not null default 'video',
  note       text,
  status     public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now()
);

-- THE constraint that makes double-booking impossible. Two concurrent requests
-- for the same slot cannot both succeed regardless of what the app code does;
-- the loser gets a unique-violation (23505) which the API turns into a clean
-- "already taken" response. A partial index so a cancelled booking frees the slot.
create unique index if not exists demo_bookings_slot_unique
  on public.demo_bookings (slot_id)
  where status <> 'cancelled';

create index if not exists demo_bookings_user_idx on public.demo_bookings (user_id);

alter table public.demo_bookings enable row level security;

drop policy if exists "bookings: read own" on public.demo_bookings;
create policy "bookings: read own"
  on public.demo_bookings for select
  using (auth.uid() = user_id);

drop policy if exists "bookings: insert own" on public.demo_bookings;
create policy "bookings: insert own"
  on public.demo_bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookings: cancel own" on public.demo_bookings;
create policy "bookings: cancel own"
  on public.demo_bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- partners — the Global Spotlight collection
--
-- Ships EMPTY. There are no seed rows on purpose: the spotlight shows real
-- chapter leaders or it shows an honest empty state. Do not add sample data.
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  photo_url     text,
  location      text not null,
  country       text not null,
  bio           text not null,
  quote         text,
  chapter_stats text,
  is_published  boolean not null default false,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists partners_published_idx
  on public.partners (sort_order, created_at) where is_published;

alter table public.partners enable row level security;

-- Public read, but only published rows — a draft entry is invisible to anon.
drop policy if exists "partners: public read published" on public.partners;
create policy "partners: public read published"
  on public.partners for select
  to anon, authenticated
  using (is_published);

-- Writes go through the service-role client after an admin check.

-- ---------------------------------------------------------------------------
-- checklist_progress
-- ---------------------------------------------------------------------------
create table if not exists public.checklist_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  item_key    text not null,
  is_complete boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique (user_id, item_key)
);

alter table public.checklist_progress enable row level security;

drop policy if exists "checklist: manage own" on public.checklist_progress;
create policy "checklist: manage own"
  on public.checklist_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- site_content — small admin-editable content blocks
--
-- Also ships EMPTY. A missing key renders nothing, never placeholder text.
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

alter table public.site_content enable row level security;

drop policy if exists "site_content: public read" on public.site_content;
create policy "site_content: public read"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_touch on public.applications;
create trigger applications_touch before update on public.applications
  for each row execute function public.touch_updated_at();

drop trigger if exists checklist_touch on public.checklist_progress;
create trigger checklist_touch before update on public.checklist_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

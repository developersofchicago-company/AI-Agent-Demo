-- =============================================================================
-- DC AI Receptionist — Full Database Setup
-- Run this once in the Supabase SQL Editor on a fresh project.
-- Includes: extensions · tables · indexes · functions · RLS · realtime · seed
-- =============================================================================

create extension if not exists "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

create table if not exists public.departments (
  id                   uuid primary key default uuid_generate_v4(),
  name                 text not null,
  phone_numbers        text[]  default array[]::text[],
  hours_start          time,
  hours_end            time,
  languages            text[]  default array['urdu','english'],
  routing_keywords     text[],
  backup_department_id uuid references public.departments(id),
  is_active            boolean default true,
  created_at           timestamp default now()
);

create table if not exists public.calls (
  id                  uuid primary key default uuid_generate_v4(),
  vapi_call_id        text unique,
  phone_number        text not null,
  caller_name         text,
  direction           text check (direction in ('inbound','outbound')),
  status              text check (status in ('completed','missed','failed','in_progress')),
  language_selected   text check (language_selected in ('urdu','english')),
  department_id       uuid references public.departments(id),
  department_selected text,
  duration_seconds    integer,
  transcript          text,
  recording_url       text,
  ai_confidence       float,
  notes               text,
  tags                text[],
  ivr_completed_at    timestamp,
  ai_started_at       timestamp,
  started_at          timestamp,
  ended_at            timestamp,
  created_at          timestamp default now()
);

create index if not exists calls_department_id_idx on public.calls (department_id);
create index if not exists calls_created_at_idx    on public.calls (created_at desc);
create index if not exists calls_status_idx        on public.calls (status);

create table if not exists public.contacts (
  id             uuid primary key default uuid_generate_v4(),
  phone_number   text unique not null,
  name           text,
  email          text,
  tags           text[],
  last_called_at timestamp,
  total_calls    integer default 0,
  created_at     timestamp default now()
);

create table if not exists public.settings (
  id         uuid primary key default uuid_generate_v4(),
  key        text unique not null,
  value      jsonb,
  updated_at timestamp default now()
);

create table if not exists public.team_members (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  role          text check (role in ('admin','manager','viewer')),
  department_id uuid references public.departments(id),
  created_at    timestamp default now()
);

create unique index if not exists team_members_user_id_uniq on public.team_members (user_id);

-- =============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER — bypasses RLS for policy checks)
-- =============================================================================

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.team_members where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_department()
returns uuid language sql stable security definer set search_path = public as $$
  select department_id from public.team_members where user_id = auth.uid() limit 1;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.departments  enable row level security;
alter table public.calls        enable row level security;
alter table public.contacts     enable row level security;
alter table public.settings     enable row level security;
alter table public.team_members enable row level security;

-- Departments: any authenticated user reads; only admin writes
drop policy if exists "departments_read"  on public.departments;
drop policy if exists "departments_write" on public.departments;
create policy "departments_read"  on public.departments for select to authenticated using (true);
create policy "departments_write" on public.departments for all    to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Settings: any authenticated user reads; only admin writes
drop policy if exists "settings_read"  on public.settings;
drop policy if exists "settings_write" on public.settings;
create policy "settings_read"  on public.settings for select to authenticated using (true);
create policy "settings_write" on public.settings for all    to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- Contacts: any authenticated user reads; admin/manager writes
drop policy if exists "contacts_read"  on public.contacts;
drop policy if exists "contacts_write" on public.contacts;
create policy "contacts_read"  on public.contacts for select to authenticated using (true);
create policy "contacts_write" on public.contacts for all    to authenticated
  using (public.current_role() in ('admin','manager'))
  with check (public.current_role() in ('admin','manager'));

-- Calls: admin/manager read all; viewer reads own department only; admin/manager writes
drop policy if exists "calls_read_admin_manager" on public.calls;
drop policy if exists "calls_read_viewer"        on public.calls;
drop policy if exists "calls_write"              on public.calls;
create policy "calls_read_admin_manager" on public.calls for select to authenticated
  using (public.current_role() in ('admin','manager'));
create policy "calls_read_viewer" on public.calls for select to authenticated
  using (
    public.current_role() = 'viewer'
    and department_id is not null
    and department_id = public.current_department()
  );
create policy "calls_write" on public.calls for all to authenticated
  using (public.current_role() in ('admin','manager'))
  with check (public.current_role() in ('admin','manager'));

-- Team members: user reads own row; admin reads/writes all
drop policy if exists "team_members_read_self"  on public.team_members;
drop policy if exists "team_members_read_admin" on public.team_members;
drop policy if exists "team_members_write"      on public.team_members;
create policy "team_members_read_self"  on public.team_members for select to authenticated using (user_id = auth.uid());
create policy "team_members_read_admin" on public.team_members for select to authenticated using (public.current_role() = 'admin');
create policy "team_members_write"      on public.team_members for all    to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- =============================================================================
-- REALTIME
-- =============================================================================

do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.calls;

-- =============================================================================
-- SEED DATA (safe to re-run — uses ON CONFLICT DO NOTHING)
-- =============================================================================

create unique index if not exists departments_name_uniq on public.departments (name);

insert into public.departments (name, phone_numbers, hours_start, hours_end, languages, routing_keywords) values
  ('Sales',            array['+92-21-111-000-001'], '09:00', '18:00', array['urdu','english'], array['sales','buy','price','quote','demo']),
  ('Customer Support', array['+92-21-111-000-002'], '00:00', '23:59', array['urdu','english'], array['support','help','issue','problem','complaint']),
  ('HR',               array['+92-21-111-000-003'], '10:00', '17:00', array['urdu','english'], array['hr','job','career','hiring','interview'])
on conflict (name) do nothing;

insert into public.settings (key, value) values
  ('ivr_greeting',           '{"urdu":"السلام علیکم، براہ کرم زبان منتخب کریں","english":"Welcome, please choose a language"}'::jsonb),
  ('business_hours_default', '{"start":"09:00","end":"18:00","timezone":"Asia/Karachi"}'::jsonb),
  ('after_hours_message',    '{"urdu":"دفتر بند ہے، براہ کرم پیغام چھوڑیں","english":"We are closed, please leave a message"}'::jsonb)
on conflict (key) do nothing;

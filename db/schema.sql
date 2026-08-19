-- BookFlow schema — mirrors docs/01_db.md §2 exactly.
-- Apply with: psql "$DATABASE_URL" -f db/schema.sql

create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes integer not null,
  price integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  service_id uuid not null references services(id),
  scheduled_at timestamptz not null,
  status text not null default 'pending',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_bookings_service_scheduled
  on bookings (service_id, scheduled_at);

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id),
  type text not null,
  channel text not null,
  sent_at timestamptz default now(),
  status text default 'sent'
);

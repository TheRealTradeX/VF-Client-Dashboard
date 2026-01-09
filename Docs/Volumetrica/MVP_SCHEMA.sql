-- Volumetrica MVP schema (Milestone 2)
-- Apply in Supabase SQL editor using the service role.

create extension if not exists "pgcrypto";

create table if not exists volumetrica_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  received_at timestamptz not null default now(),
  auth_mode text not null,
  signature_valid boolean not null default false,
  category text null,
  event text null,
  account_id text null,
  user_id text null,
  payload jsonb not null,
  headers jsonb null,
  correlation_id text null,
  source_ip text null
);

create unique index if not exists volumetrica_events_event_id_idx
  on volumetrica_events (event_id);

create table if not exists volumetrica_accounts (
  account_id text primary key,
  user_id text null,
  status text null,
  trading_permission text null,
  enabled boolean null,
  reason text null,
  end_date timestamptz null,
  rule_id text null,
  rule_name text null,
  account_family_id text null,
  owner_organization_user_id text null,
  snapshot jsonb null,
  raw jsonb null,
  last_event_id text null,
  updated_at timestamptz not null default now(),
  is_hidden boolean not null default false,
  is_test boolean not null default false,
  is_deleted boolean not null default false,
  deleted_at timestamptz null
);

create index if not exists volumetrica_accounts_user_idx
  on volumetrica_accounts (user_id);

create table if not exists volumetrica_subscriptions (
  subscription_id text primary key,
  user_id text null,
  status text null,
  provider_status text null,
  activation timestamptz null,
  expiration timestamptz null,
  dx_data_products jsonb null,
  dx_agreement_signed boolean null,
  dx_agreement_link text null,
  dx_self_certification text null,
  platform text null,
  volumetrica_platform text null,
  volumetrica_license text null,
  volumetrica_download_link text null,
  raw jsonb null,
  last_event_id text null,
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  deleted_at timestamptz null
);

create index if not exists volumetrica_subscriptions_user_idx
  on volumetrica_subscriptions (user_id);

create table if not exists volumetrica_positions (
  position_key text primary key,
  account_id text null,
  position_id bigint null,
  contract_id bigint null,
  symbol_name text null,
  entry_date_utc timestamptz null,
  price numeric null,
  quantity bigint null,
  daily_pl numeric null,
  open_pl numeric null,
  raw jsonb null,
  last_event_id text null,
  updated_at timestamptz not null default now()
);

create index if not exists volumetrica_positions_account_idx
  on volumetrica_positions (account_id);

create table if not exists volumetrica_trades (
  trade_key text primary key,
  trade_id bigint null,
  account_id text null,
  contract_id bigint null,
  symbol_name text null,
  entry_date timestamptz null,
  exit_date timestamptz null,
  quantity bigint null,
  open_price numeric null,
  close_price numeric null,
  pl numeric null,
  converted_pl numeric null,
  commission_paid numeric null,
  raw jsonb null,
  last_event_id text null,
  updated_at timestamptz not null default now()
);

create index if not exists volumetrica_trades_account_idx
  on volumetrica_trades (account_id);

create table if not exists volumetrica_users (
  volumetrica_user_id text primary key,
  status text null,
  external_id text null,
  invite_url text null,
  creation_utc timestamptz null,
  update_utc timestamptz null,
  raw jsonb null,
  last_event_id text null,
  updated_at timestamptz not null default now()
);

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_user_id text null,
  actor_email text null,
  target_type text null,
  target_id text null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

alter table volumetrica_events enable row level security;
alter table volumetrica_accounts enable row level security;
alter table volumetrica_subscriptions enable row level security;
alter table volumetrica_positions enable row level security;
alter table volumetrica_trades enable row level security;
alter table volumetrica_users enable row level security;
alter table admin_audit_log enable row level security;

alter table if exists profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles can read own profile'
  ) then
    create policy "Profiles can read own profile"
      on public.profiles
      for select
      to authenticated
      using (id = auth.uid());
  end if;
end
$$;

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

create table if not exists volumetrica_rules (
  rule_id text primary key,
  reference_id text null,
  rule_name text null,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table volumetrica_rules add column if not exists reference_id text null;

create unique index if not exists volumetrica_rules_reference_idx
  on volumetrica_rules (reference_id);

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

create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  name text not null,
  subject text not null,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_templates_key_idx
  on email_templates (template_key);

create table if not exists email_outbox (
  id uuid primary key default gen_random_uuid(),
  template_id uuid null references email_templates(id) on delete set null,
  to_email text not null,
  subject text not null,
  body text not null,
  variables jsonb null,
  status text not null,
  provider text not null,
  error text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

alter table volumetrica_events enable row level security;
alter table volumetrica_accounts enable row level security;
alter table volumetrica_subscriptions enable row level security;
alter table volumetrica_positions enable row level security;
alter table volumetrica_trades enable row level security;
alter table volumetrica_users enable row level security;
alter table volumetrica_rules enable row level security;
alter table admin_audit_log enable row level security;
alter table email_templates enable row level security;
alter table email_outbox enable row level security;

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

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_users'
      and policyname = 'admin_users can read self'
  ) then
    create policy "admin_users can read self"
      on public.admin_users
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end
$$;

drop policy if exists "Admins can read all profiles" on public.profiles;

create policy "Admins can read all profiles"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_users
      where admin_users.user_id = auth.uid()
    )
  );
insert into volumetrica_rules (reference_id, rule_id, rule_name)
values
  ('VF_STARTER_EVAL_25K', '9019e393-ae5f-417e-9870-4781f87c639d', 'VF_STARTER_EVAL_25K'),
  ('VF_STARTER_EVAL_50K', '0d43fa3f-d77c-4e41-8e42-226d7c07fc57', 'VF_STARTER_EVAL_50K'),
  ('VF_STARTER_EVAL_100K', '9ab350b4-7c8e-4d84-b3f9-d06fa243b64d', 'VF_STARTER_EVAL_100K'),
  ('VF_FUNDED_FUND_25K', '9ef406c8-3266-489b-b44e-87739fa63d92', 'VF_FUNDED_FUND_25K'),
  ('VF_FUNDED_FUND_50K', '647250cb-93e1-4b24-a313-444e46846cb2', 'VF_FUNDED_FUND_50K'),
  ('VF_FUNDED_FUND_100K', 'e56a15e4-d807-4bda-90b1-a7cb91f7c3a8', 'VF_FUNDED_FUND_100K'),
  ('VF_FUNDED_25K', '09201b2b-1cec-4850-ae5f-28f635cb4dfe', 'VF_FUNDED_25K'),
  ('VF_FUNDED_50K', 'd5a54833-153a-4aac-82db-940d4ad36119', 'VF_FUNDED_50K'),
  ('VF_FUNDED_100K', '9227ad6c-a792-4f1f-9ffe-0892fbb9f826', 'VF_FUNDED_100K')
on conflict (rule_id) do update
set reference_id = excluded.reference_id,
    rule_name = excluded.rule_name,
    updated_at = now();

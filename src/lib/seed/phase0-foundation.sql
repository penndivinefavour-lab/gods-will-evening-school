-- GOD'S WILL EVENING SCHOOL MANAGEMENT SYSTEM
-- Phase 0 Foundation Schema
-- Multi-tenant SaaS with Row Level Security

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Platform configuration
create table if not exists public.platforms (
  platform_id uuid primary key default uuid_generate_v4(),
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Schools / tenants
create table if not exists public.schools (
  school_id uuid primary key default uuid_generate_v4(),
  platform_id uuid not null references public.platforms(platform_id) on delete cascade,
  name text not null,
  code text not null,
  branding jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_platform_code_unique unique (platform_id, code)
);

create index if not exists idx_schools_platform_id on public.schools(platform_id);

-- Users
create table if not exists public.users (
  user_id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(email);

-- Roles
create table if not exists public.roles (
  role_id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- Permissions
create table if not exists public.permissions (
  permission_id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  module text not null,
  action text not null,
  created_at timestamptz not null default now()
);

-- Role-permission mappings
create table if not exists public.role_permissions (
  role_permission_id uuid primary key default uuid_generate_v4(),
  role_id uuid not null references public.roles(role_id) on delete cascade,
  permission_id uuid not null references public.permissions(permission_id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint role_permissions_unique unique (role_id, permission_id)
);

-- User role assignments
create table if not exists public.user_roles (
  user_role_id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  role_id uuid not null references public.roles(role_id) on delete cascade,
  school_id uuid references public.schools(school_id) on delete cascade,
  assigned_by uuid references public.users(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_school_id on public.user_roles(school_id);

-- Academic years
create table if not exists public.academic_years (
  academic_year_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_academic_years_school_id on public.academic_years(school_id);

-- Branding configuration
create table if not exists public.branding (
  branding_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  theme jsonb not null default '{}'::jsonb,
  logo_url text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_branding_school_id on public.branding(school_id);

-- Feature flags
create table if not exists public.feature_flags (
  feature_flag_id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(school_id) on delete cascade,
  key text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint feature_flags_unique unique (school_id, key)
);

create index if not exists idx_feature_flags_school_id on public.feature_flags(school_id);

-- System settings
create table if not exists public.system_settings (
  system_setting_id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Audit logs
create table if not exists public.audit_logs (
  audit_log_id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(school_id) on delete set null,
  user_id uuid references public.users(user_id) on delete set null,
  action text not null,
  entity text not null,
  changes jsonb not null default '{}'::jsonb,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_school_id on public.audit_logs(school_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

-- Tenant-isolated helper view
create or replace view public.current_tenant_school as
select s.*
from public.schools s
where s.status = 'active';

-- RLS enable for tenant-scoped tables
alter table public.schools enable row level security;
alter table public.academic_years enable row level security;
alter table public.branding enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_logs enable row level security;

-- Platform admin can access all schools
create policy platform_admin_schools on public.schools
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

-- School admin and teachers can access only their school
create policy school_scoped_schools on public.schools
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher', 'student', 'parent')
    )
  );

create policy platform_admin_academic_years on public.academic_years
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_academic_years on public.academic_years
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher', 'student', 'parent')
    )
  );

create policy platform_admin_branding on public.branding
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_branding on public.branding
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher', 'student', 'parent')
    )
  );

create policy platform_admin_feature_flags on public.feature_flags
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_feature_flags on public.feature_flags
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher', 'student', 'parent')
    )
  );

create policy platform_admin_audit_logs on public.audit_logs
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_audit_logs on public.audit_logs
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher', 'student', 'parent')
    )
  );

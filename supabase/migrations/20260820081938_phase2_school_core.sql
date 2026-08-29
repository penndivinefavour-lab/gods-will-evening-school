-- Phase 2 School Core Schema
-- Reconciliation migration for remote history entry 20260820081938

create table if not exists public.platforms (
  platform_id uuid primary key default uuid_generate_v4(),
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.users (
  user_id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  full_name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  role_id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  permission_id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  module text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role_permission_id uuid primary key default uuid_generate_v4(),
  role_id uuid not null references public.roles(role_id) on delete cascade,
  permission_id uuid not null references public.permissions(permission_id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint role_permissions_unique unique (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_role_id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(user_id) on delete cascade,
  role_id uuid not null references public.roles(role_id) on delete cascade,
  school_id uuid references public.schools(school_id) on delete cascade,
  assigned_by uuid references public.users(user_id) on delete set null,
  created_at timestamptz not null default now()
);

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

create table if not exists public.branding (
  branding_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  theme jsonb not null default '{}'::jsonb,
  logo_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  feature_flag_id uuid primary key default uuid_generate_v4(),
  school_id uuid references public.schools(school_id) on delete cascade,
  key text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint feature_flags_unique unique (school_id, key)
);

create table if not exists public.system_settings (
  system_setting_id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

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

create table if not exists public.students (
  student_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  user_id uuid references public.users(user_id) on delete set null,
  admission_number text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  preferred_name text,
  gender text not null,
  date_of_birth date,
  place_of_birth text,
  nationality text,
  region text,
  division text,
  residential_address text,
  phone text,
  email text,
  status text not null default 'active',
  previous_school text,
  gce_level text,
  candidate_status text,
  health_notes text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_school_admission_unique unique (school_id, admission_number)
);

create table if not exists public.guardians (
  guardian_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  user_id uuid references public.users(user_id) on delete set null,
  first_name text not null,
  last_name text not null,
  relationship text,
  phone text not null,
  alternative_phone text,
  email text,
  occupation text,
  address text,
  emergency_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_guardians (
  student_guardian_id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(student_id) on delete cascade,
  guardian_id uuid not null references public.guardians(guardian_id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint student_guardians_unique unique (student_id, guardian_id)
);

create table if not exists public.teachers (
  teacher_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  user_id uuid references public.users(user_id) on delete set null,
  staff_id text not null,
  first_name text not null,
  last_name text not null,
  qualifications text,
  specialization text,
  phone text,
  email text,
  employment_status text not null default 'active',
  date_joined date,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teachers_school_staff_unique unique (school_id, staff_id)
);

create table if not exists public.subjects (
  subject_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  name text not null,
  code text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_school_code_unique unique (school_id, code)
);

create table if not exists public.classes (
  class_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  academic_year_id uuid references public.academic_years(academic_year_id) on delete set null,
  name text not null,
  stream text,
  display_name text,
  capacity integer,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_school_name_unique unique (school_id, name, academic_year_id)
);

create table if not exists public.teacher_assignments (
  teacher_assignment_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  teacher_id uuid not null references public.teachers(teacher_id) on delete cascade,
  class_id uuid not null references public.classes(class_id) on delete cascade,
  subject_id uuid not null references public.subjects(subject_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teacher_assignments_unique unique (teacher_id, class_id, subject_id)
);

create table if not exists public.enrollments (
  enrollment_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  student_id uuid not null references public.students(student_id) on delete cascade,
  class_id uuid not null references public.classes(class_id) on delete cascade,
  academic_year_id uuid references public.academic_years(academic_year_id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint enrollments_unique unique (student_id, class_id, academic_year_id)
);

create table if not exists public.fee_structures (
  fee_structure_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  academic_year_id uuid references public.academic_years(academic_year_id) on delete set null,
  class_id uuid references public.classes(class_id) on delete set null,
  name text not null,
  description text,
  amount numeric not null,
  currency text not null,
  frequency text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  invoice_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  student_id uuid not null references public.students(student_id) on delete cascade,
  fee_structure_id uuid references public.fee_structures(fee_structure_id) on delete set null,
  amount numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  payment_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  invoice_id uuid references public.invoices(invoice_id) on delete set null,
  amount numeric not null,
  method text not null,
  reference text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receipts (
  receipt_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  payment_id uuid references public.payments(payment_id) on delete set null,
  invoice_id uuid references public.invoices(invoice_id) on delete set null,
  student_id uuid references public.students(student_id) on delete set null,
  receipt_number text,
  amount numeric not null,
  method text,
  paid_by text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.schools enable row level security;
alter table public.academic_years enable row level security;
alter table public.branding enable row level security;
alter table public.feature_flags enable row level security;
alter table public.audit_logs enable row level security;
alter table public.students enable row level security;
alter table public.guardians enable row level security;
alter table public.student_guardians enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.enrollments enable row level security;

create policy platform_admin_schools on public.schools
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

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

create policy platform_admin_students on public.students
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_students on public.students
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

create policy platform_admin_guardians on public.guardians
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_guardians on public.guardians
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

create policy platform_admin_student_guardians on public.student_guardians
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_student_guardians on public.student_guardians
  for all using (
    student_id in (
      select student_id from public.students where school_id in (
        select ur.school_id
        from public.user_roles ur
        join public.roles r on r.role_id = ur.role_id
        where ur.user_id = auth.uid()
          and ur.school_id is not null
          and r.name in ('school_administrator', 'teacher', 'student', 'parent')
      )
    )
  );

create policy platform_admin_teachers on public.teachers
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_teachers on public.teachers
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

create policy platform_admin_teacher_assignments on public.teacher_assignments
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_teacher_assignments on public.teacher_assignments
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

create policy platform_admin_classes on public.classes
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_classes on public.classes
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

create policy platform_admin_subjects on public.subjects
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_subjects on public.subjects
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

create policy platform_admin_enrollments on public.enrollments
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_enrollments on public.enrollments
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

-- GOD'S WILL EVENING SCHOOL MANAGEMENT SYSTEM
-- Phase 4 Attendance Schema
-- Multi-tenant SaaS with Row Level Security

create extension if not exists pgcrypto;

-- Uploaded files metadata for attendance worksheets
create table if not exists public.files (
  file_id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  user_id uuid references public.users(user_id) on delete set null,
  entity text,
  entity_id text,
  filename text not null,
  mime_type text,
  size bigint,
  url text not null,
  path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_files_school_id on public.files(school_id);
create index if not exists idx_files_user_id on public.files(user_id);
create index if not exists idx_files_entity on public.files(entity, entity_id);

alter table public.files enable row level security;

drop policy if exists platform_admin_files on public.files;
drop policy if exists school_scoped_files on public.files;

create policy platform_admin_files on public.files
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_files on public.files
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

-- Attendance worksheets
create table if not exists public.attendance_worksheets (
  attendance_worksheet_id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  class_id uuid not null references public.classes(class_id) on delete cascade,
  teacher_id uuid references public.teachers(teacher_id) on delete set null,
  academic_year_id uuid references public.academic_years(academic_year_id) on delete set null,
  worksheet_date date not null,
  file_id uuid references public.files(file_id) on delete set null,
  extraction_status text not null default 'pending',
  extraction_result jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_worksheets_status_check check (extraction_status in ('pending','review','approved','rejected'))
);

create index if not exists idx_attendance_worksheets_school_id on public.attendance_worksheets(school_id);
create index if not exists idx_attendance_worksheets_class_id on public.attendance_worksheets(class_id);
create index if not exists idx_attendance_worksheets_teacher_id on public.attendance_worksheets(teacher_id);
create index if not exists idx_attendance_worksheets_worksheet_date on public.attendance_worksheets(worksheet_date);

alter table public.attendance_worksheets enable row level security;

drop policy if exists platform_admin_attendance_worksheets on public.attendance_worksheets;
drop policy if exists school_scoped_attendance_worksheets on public.attendance_worksheets;

create policy platform_admin_attendance_worksheets on public.attendance_worksheets
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_attendance_worksheets on public.attendance_worksheets
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher')
    )
  );

-- Attendance records
create table if not exists public.attendance_records (
  attendance_record_id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  student_id uuid not null references public.students(student_id) on delete cascade,
  class_id uuid not null references public.classes(class_id) on delete cascade,
  enrollment_id uuid references public.enrollments(enrollment_id) on delete set null,
  teacher_id uuid references public.teachers(teacher_id) on delete set null,
  academic_year_id uuid references public.academic_years(academic_year_id) on delete set null,
  attendance_worksheet_id uuid references public.attendance_worksheets(attendance_worksheet_id) on delete set null,
  attendance_date date not null,
  status text not null,
  reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_records_school_student_class_date_unique unique (school_id, student_id, class_id, attendance_date),
  constraint attendance_records_status_check check (status in ('present','absent','late','excused'))
);

create index if not exists idx_attendance_records_school_id on public.attendance_records(school_id);
create index if not exists idx_attendance_records_class_id on public.attendance_records(class_id);
create index if not exists idx_attendance_records_student_id on public.attendance_records(student_id);
create index if not exists idx_attendance_records_date on public.attendance_records(attendance_date);
create index if not exists idx_attendance_records_school_date on public.attendance_records(school_id, attendance_date);

alter table public.attendance_records enable row level security;

drop policy if exists platform_admin_attendance_records on public.attendance_records;
drop policy if exists school_scoped_attendance_records on public.attendance_records;
drop policy if exists student_attendance_records on public.attendance_records;
drop policy if exists parent_attendance_records on public.attendance_records;

create policy platform_admin_attendance_records on public.attendance_records
  for all using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and r.name = 'platform_technical_administrator'
    )
  );

create policy school_scoped_attendance_records on public.attendance_records
  for all using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name in ('school_administrator', 'teacher')
    )
  );

create policy student_attendance_records on public.attendance_records
  for select to public
  using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name = 'student'
    )
    and student_id in (
      select student_id from public.students where user_id = auth.uid()
    )
  );

create policy parent_attendance_records on public.attendance_records
  for select to public
  using (
    school_id in (
      select ur.school_id
      from public.user_roles ur
      join public.roles r on r.role_id = ur.role_id
      where ur.user_id = auth.uid()
        and ur.school_id is not null
        and r.name = 'parent'
    )
    and student_id in (
      select sg.student_id
      from public.student_guardians sg
      join public.guardians g on g.guardian_id = sg.guardian_id
      join public.users u on u.user_id = g.user_id
      where u.user_id = auth.uid()
    )
  );

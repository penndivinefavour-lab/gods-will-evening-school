-- GOD'S WILL EVENING SCHOOL MANAGEMENT SYSTEM
-- Phase 2 School Core Schema
-- Multi-tenant SaaS with Row Level Security

-- Students
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

create index if not exists idx_students_school_id on public.students(school_id);
create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_students_admission_number on public.students(school_id, admission_number);

-- Guardians
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

create index if not exists idx_guardians_school_id on public.guardians(school_id);
create index if not exists idx_guardians_user_id on public.guardians(user_id);

-- Student-guardian links
create table if not exists public.student_guardians (
  student_guardian_id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.students(student_id) on delete cascade,
  guardian_id uuid not null references public.guardians(guardian_id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint student_guardians_unique unique (student_id, guardian_id)
);

create index if not exists idx_student_guardians_student_id on public.student_guardians(student_id);
create index if not exists idx_student_guardians_guardian_id on public.student_guardians(guardian_id);

-- Teachers
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

create index if not exists idx_teachers_school_id on public.teachers(school_id);
create index if not exists idx_teachers_user_id on public.teachers(user_id);
create index if not exists idx_teachers_staff_id on public.teachers(school_id, staff_id);

-- Classes
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

create index if not exists idx_classes_school_id on public.classes(school_id);
create index if not exists idx_classes_academic_year_id on public.classes(academic_year_id);

-- Subjects
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

create index if not exists idx_subjects_school_id on public.subjects(school_id);

-- Teacher assignments
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

create index if not exists idx_teacher_assignments_school_id on public.teacher_assignments(school_id);
create index if not exists idx_teacher_assignments_teacher_id on public.teacher_assignments(teacher_id);
create index if not exists idx_teacher_assignments_class_id on public.teacher_assignments(class_id);
create index if not exists idx_teacher_assignments_subject_id on public.teacher_assignments(subject_id);

-- Enrollments
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

create index if not exists idx_enrollments_school_id on public.enrollments(school_id);
create index if not exists idx_enrollments_student_id on public.enrollments(student_id);
create index if not exists idx_enrollments_class_id on public.enrollments(class_id);

-- Enable RLS for tenant-scoped tables
alter table public.students enable row level security;
alter table public.guardians enable row level security;
alter table public.student_guardians enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.enrollments enable row level security;

-- Students policies
create policy platform_admin_students on public.students for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_students on public.students for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

-- Guardians policies
create policy platform_admin_guardians on public.guardians for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_guardians on public.guardians for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

-- Student guardians policies
create policy platform_admin_student_guardians on public.student_guardians for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_student_guardians on public.student_guardians for all using (
  student_id in (select student_id from public.students where school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent')))
);

-- Teachers policies
create policy platform_admin_teachers on public.teachers for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_teachers on public.teachers for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

-- Teacher assignments policies
create policy platform_admin_teacher_assignments on public.teacher_assignments for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_teacher_assignments on public.teacher_assignments for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

-- Classes policies
create policy platform_admin_classes on public.classes for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_classes on public.classes for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

-- Subjects policies
create policy platform_admin_subjects on public.subjects for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_subjects on public.subjects for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

-- Enrollments policies
create policy platform_admin_enrollments on public.enrollments for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_enrollments on public.enrollments for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator', 'teacher', 'student', 'parent'))
);

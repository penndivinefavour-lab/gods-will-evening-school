-- GOD'S WILL EVENING SCHOOL MANAGEMENT SYSTEM
-- Phase 4.1 Attendance Workflow Completion
-- Additive migration: expands worksheet lifecycle fields and status states

alter table public.attendance_worksheets
  add column if not exists reviewed_by uuid references public.users(user_id) on delete set null;

alter table public.attendance_worksheets
  add column if not exists rejection_reason text;

alter table public.attendance_worksheets
  add column if not exists updated_at timestamptz not null default now();

update public.attendance_worksheets
set updated_at = now()
where updated_at is null;

alter table public.attendance_worksheets
  drop constraint if exists attendance_worksheets_status_check;

alter table public.attendance_worksheets
  add constraint attendance_worksheets_status_check
    check (extraction_status in ('pending','extraction','extracted','review','approved','rejected'));

create index if not exists idx_attendance_worksheets_reviewed_by on public.attendance_worksheets(reviewed_by);

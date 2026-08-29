-- Phase 0 Foundation Seed Data
-- Default roles, permissions and mappings

-- Roles
insert into public.roles (role_id, name, description) values
('11111111-1111-1111-1111-111111111111', 'platform_technical_administrator', 'Full platform control across all schools'),
('22222222-2222-2222-2222-222222222222', 'school_administrator', 'Full access within assigned school only'),
('33333333-3333-3333-3333-333333333333', 'teacher', 'Assigned classes and subjects only'),
('44444444-4444-4444-4444-444444444444', 'student', 'Own records only'),
('55555555-5555-5555-5555-555555555555', 'parent', 'Linked students only')
on conflict (name) do nothing;

-- Permissions
insert into public.permissions (permission_id, name, description, module, action) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'view_all_schools', 'View all schools', 'platform', 'view'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manage_schools', 'Manage schools', 'platform', 'manage'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'manage_users_and_roles', 'Manage users and roles', 'platform', 'manage'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'manage_billing', 'Manage billing', 'platform', 'manage'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'configure_integrations', 'Configure integrations', 'platform', 'manage'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'manage_ai_services', 'Manage AI services', 'platform', 'manage'),
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'view_audit_logs', 'View audit logs', 'platform', 'view'),
('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manage_feature_flags', 'Manage feature flags', 'platform', 'manage'),
('33333333-cccc-cccc-cccc-cccccccccccc', 'manage_branding', 'Manage branding', 'platform', 'manage'),
('44444444-dddd-dddd-dddd-dddddddddddd', 'manage_backups', 'Manage backups', 'platform', 'manage'),
('55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'view_platform_health', 'View platform health', 'platform', 'view'),
('66666666-ffff-ffff-ffff-ffffffffffff', 'manage_students', 'Manage students', 'school', 'manage'),
('77777777-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'manage_teachers', 'Manage teachers', 'school', 'manage'),
('88888888-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'manage_classes', 'Manage classes and subjects', 'school', 'manage'),
('99999999-cccc-cccc-cccc-cccccccccccc', 'manage_fees', 'Manage fees and payments', 'school', 'manage'),
('00000000-dddd-dddd-dddd-dddddddddddd', 'manage_examinations', 'Manage examinations', 'school', 'manage'),
('12121212-eeee-eeee-eeee-eeeeeeeeeeee', 'manage_timetable', 'Manage timetable', 'school', 'manage'),
('13131313-ffff-ffff-ffff-ffffffffffff', 'manage_report_cards', 'Manage report cards', 'school', 'manage'),
('14141414-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'manage_announcements', 'Manage announcements', 'school', 'manage'),
('15151515-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mark_attendance', 'Mark attendance', 'school', 'manage'),
('16161616-cccc-cccc-cccc-cccccccccccc', 'enter_marks', 'Enter marks', 'school', 'manage'),
('17171717-dddd-dddd-dddd-dddddddddddd', 'view_own_records', 'View own records', 'school', 'view'),
('18181818-eeee-eeee-eeee-eeeeeeeeeeee', 'view_linked_child_records', 'View linked child records', 'school', 'view'),
('19191919-ffff-ffff-ffff-ffffffffffff', 'communicate_with_teachers', 'Communicate with teachers', 'school', 'manage')
on conflict (name) do nothing;

-- Role permission mappings
insert into public.role_permissions (role_id, permission_id)
select '11111111-1111-1111-1111-111111111111', permission_id from public.permissions on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select '22222222-2222-2222-2222-222222222222', permission_id
from public.permissions
where name in (
  'view_audit_logs','manage_branding','manage_students','manage_teachers',
  'manage_classes','manage_fees','manage_examinations','manage_timetable',
  'manage_report_cards','manage_announcements','mark_attendance','enter_marks','view_own_records'
) on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select '33333333-3333-3333-3333-333333333333', permission_id
from public.permissions
where name in (
  'manage_examinations','manage_timetable','manage_report_cards',
  'manage_announcements','mark_attendance','enter_marks','view_own_records'
) on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select '44444444-4444-4444-4444-444444444444', permission_id
from public.permissions
where name = 'view_own_records' on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select '55555555-5555-5555-5555-555555555555', permission_id
from public.permissions
where name in ('view_own_records','view_linked_child_records','communicate_with_teachers')
on conflict do nothing;

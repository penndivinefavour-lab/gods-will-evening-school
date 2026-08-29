-- Phase 3 Finance migration
-- Project: pmmwauhwucfdpwahzdvh

create table if not exists public.fee_structures (
  fee_structure_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  academic_year_id uuid references public.academic_years(academic_year_id) on delete set null,
  class_id uuid references public.classes(class_id) on delete set null,
  name text not null,
  description text,
  amount numeric not null default 0,
  currency text not null default 'XAF',
  frequency text not null default 'one_time',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fee_structures_school_id on public.fee_structures(school_id);
create index if not exists idx_fee_structures_academic_year_id on public.fee_structures(academic_year_id);
create index if not exists idx_fee_structures_class_id on public.fee_structures(class_id);

create table if not exists public.invoices (
  invoice_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  student_id uuid not null references public.students(student_id) on delete cascade,
  fee_structure_id uuid not null references public.fee_structures(fee_structure_id) on delete restrict,
  amount numeric not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoices_school_id on public.invoices(school_id);
create index if not exists idx_invoices_student_id on public.invoices(student_id);
create index if not exists idx_invoices_fee_structure_id on public.invoices(fee_structure_id);

create table if not exists public.payments (
  payment_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  invoice_id uuid not null references public.invoices(invoice_id) on delete restrict,
  amount numeric not null default 0,
  method text not null,
  reference text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_school_id on public.payments(school_id);
create index if not exists idx_payments_invoice_id on public.payments(invoice_id);

create table if not exists public.receipts (
  receipt_id uuid primary key default uuid_generate_v4(),
  school_id uuid not null references public.schools(school_id) on delete cascade,
  payment_id uuid not null references public.payments(payment_id) on delete restrict,
  invoice_id uuid not null references public.invoices(invoice_id) on delete restrict,
  student_id uuid not null references public.students(student_id) on delete cascade,
  receipt_number text,
  amount numeric not null default 0,
  method text,
  paid_by text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_receipts_school_id on public.receipts(school_id);
create index if not exists idx_receipts_payment_id on public.receipts(payment_id);
create index if not exists idx_receipts_invoice_id on public.receipts(invoice_id);
create index if not exists idx_receipts_student_id on public.receipts(student_id);

alter table public.fee_structures enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;

create policy platform_admin_fee_structures on public.fee_structures for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_fee_structures on public.fee_structures for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator'))
);

create policy platform_admin_invoices on public.invoices for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_invoices on public.invoices for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator'))
);

create policy platform_admin_payments on public.payments for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_payments on public.payments for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator'))
);

create policy platform_admin_receipts on public.receipts for all using (
  exists (select 1 from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and r.name = 'platform_technical_administrator')
);
create policy school_scoped_receipts on public.receipts for all using (
  school_id in (select ur.school_id from public.user_roles ur join public.roles r on r.role_id = ur.role_id where ur.user_id = auth.uid() and ur.school_id is not null and r.name in ('school_administrator'))
);

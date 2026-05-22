create extension if not exists "pgcrypto";

create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  clinic_id uuid references public.clinics (id) on delete set null,
  full_name text,
  role text not null default 'assistant' check (role in ('admin', 'hygienist', 'assistant')),
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age integer,
  email text,
  phone text,
  notes text,
  smoker boolean not null default false,
  tetracycline boolean not null default false,
  sensitivity text,
  target_shade text,
  membership text,
  hygiene_score integer,
  lifestyle jsonb not null default '{}'::jsonb,
  last_visit timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  hygienist_id uuid references public.profiles (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  pdf_path text,
  created_at timestamptz not null default now()
);

create or replace function public.is_clinic_member(target_clinic_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.clinic_id = target_clinic_id
  );
$$;

alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.clinical_cases enable row level security;

drop policy if exists "clinic members can read clinics" on public.clinics;
create policy "clinic members can read clinics"
on public.clinics
for select
using (public.is_clinic_member(id));

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
using (id = auth.uid());

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "clinic members can manage patients" on public.patients;
create policy "clinic members can manage patients"
on public.patients
for all
using (public.is_clinic_member(clinic_id))
with check (public.is_clinic_member(clinic_id));

drop policy if exists "clinic members can manage clinical cases" on public.clinical_cases;
create policy "clinic members can manage clinical cases"
on public.clinical_cases
for all
using (
  exists (
    select 1
    from public.patients p
    where p.id = patient_id
      and public.is_clinic_member(p.clinic_id)
  )
)
with check (
  exists (
    select 1
    from public.patients p
    where p.id = patient_id
      and public.is_clinic_member(p.clinic_id)
  )
);

insert into storage.buckets (id, name, public)
values
  ('patient-photos', 'patient-photos', false),
  ('generated-pdfs', 'generated-pdfs', false)
on conflict (id) do nothing;

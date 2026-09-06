create extension if not exists pgcrypto;

drop table if exists public.users cascade;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert or update on auth.users
for each row
execute function public.sync_user_profile();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'user_id'
      and data_type = 'integer'
  ) then
    alter table public.categories drop constraint if exists categories_user_id_fkey;
    alter table public.categories alter column user_id type uuid using null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'user_id'
      and data_type = 'integer'
  ) then
    alter table public.transactions drop constraint if exists transactions_user_id_fkey;
    alter table public.transactions alter column user_id type uuid using null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'budgets'
      and column_name = 'user_id'
      and data_type = 'integer'
  ) then
    alter table public.budgets drop constraint if exists budgets_user_id_fkey;
    alter table public.budgets alter column user_id type uuid using null;
  end if;
end $$;

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
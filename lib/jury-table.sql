-- Supabase SQL script to create 'jury_members' table
create table if not exists jury_members (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  name text,
  role text not null, -- shortlisting | final | admin
  assigned_category text,
  created_at timestamptz default now()
);

create index if not exists idx_jury_role on jury_members(role);

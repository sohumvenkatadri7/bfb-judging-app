-- Supabase SQL script to create 'credentials' table
create table if not exists credentials (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  email text not null,
  password text not null,
  role text not null
);
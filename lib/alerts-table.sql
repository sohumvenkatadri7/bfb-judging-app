-- Supabase SQL script to create 'alerts' table
create table if not exists alerts (
  id bigint generated always as identity primary key,
  message text not null,
  time text not null,
  type text not null
);
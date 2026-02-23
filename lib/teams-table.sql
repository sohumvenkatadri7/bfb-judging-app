-- Supabase SQL script to create 'teams' table
create extension if not exists "uuid-ossp";

create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  team_name text not null,
  leader_email text,
  role text not null,
  category text not null,
  tech_score integer default 0,
  innovation_score integer default 0,
  milestone_status integer default 0 check (milestone_status >= 0 and milestone_status <= 4)
);

-- Index for sorting by tech_score
create index if not exists idx_teams_tech_score on teams(tech_score desc);
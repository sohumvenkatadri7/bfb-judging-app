-- Backfill leader_email on teams from credentials
-- Run this in Supabase SQL editor or psql connected to the database.

-- This sets teams.leader_email to the first credential.email found for that team
UPDATE teams t
SET leader_email = c.email
FROM (
  SELECT DISTINCT ON (team_id) team_id, email
  FROM credentials
  ORDER BY team_id, id
) c
WHERE c.team_id = t.id
  AND (t.leader_email IS NULL OR t.leader_email = '');

-- Optional: verify results
SELECT id, team_name, leader_email FROM teams ORDER BY team_name;

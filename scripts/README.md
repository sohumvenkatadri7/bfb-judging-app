Backfill leader_email

This folder contains a SQL script to backfill the `leader_email` column on the `teams` table using existing rows in the `credentials` table.

How to run

1. Supabase SQL Editor (recommended):
   - Open your Supabase project, go to "SQL Editor", create a new query, paste the contents of `backfill_leader_email.sql`, and run it.

2. psql / CLI:
   - If you have direct DB credentials, run:

```bash
psql "postgres://<user>:<pass>@<host>:5432/<db>" -f scripts/backfill_leader_email.sql
```

3. Optional Node script: you can also run an ad-hoc script that uses your Supabase client, but running SQL directly in Supabase is simplest and atomic.

Safety notes
- The script only updates teams where `leader_email` is NULL or empty.
- It picks the first credential found per `team_id` (if multiple credentials exist for one team).
- Review the `SELECT` at the end to verify results before committing other changes.

If you want, I can also generate a Node script that runs the same update via your existing `lib/supabase.ts` client (you'd run it locally with your env variables).
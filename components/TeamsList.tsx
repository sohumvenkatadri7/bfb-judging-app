import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TeamsList() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('teams')
      .select('*')
      .order('tech_score', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setTeams(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading teams...</div>;

  return (
    <ul>
      {teams.map((team) => (
        <li key={team.id}>{team.team_name}</li>
      ))}
    </ul>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;
    async function fetchAndSubscribe() {
      setLoading(true);
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("tech_score", { ascending: false });
      if (!error) setTeams(data || []);
      setLoading(false);

      channel = supabase
        .channel("teams-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "teams" },
          (payload: any) => {
            setTeams((prev) => {
              if (payload.eventType === "INSERT") {
                return [payload.new, ...prev];
              }
              if (payload.eventType === "UPDATE") {
                return prev.map((t) =>
                  t.id === payload.new.id ? { ...t, ...payload.new } : t
                );
              }
              if (payload.eventType === "DELETE") {
                return prev.filter((t) => t.id !== payload.old.id);
              }
              return prev;
            });
          }
        )
        .subscribe();
    }
    fetchAndSubscribe();
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  return { teams, loading };
}

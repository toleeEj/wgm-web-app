import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error) setRole(data.role);
      }
      setLoading(false);
    };

    getRole();
  }, []);

  return { role, loading };
}

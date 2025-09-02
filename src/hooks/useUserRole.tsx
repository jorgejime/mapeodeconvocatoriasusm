import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useUserRole = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setRole("");
      setLoading(false);
      return;
    }

    // Check role based on email
    const userEmail = user.email;
    
    if (userEmail === "admin@usm.edu.co") {
      setIsAdmin(true);
      setRole("administrador");
    } else if (userEmail === "rectoria@usm.edu.co") {
      setIsAdmin(false);
      setRole("usuario");
    } else {
      setIsAdmin(false);
      setRole("usuario");
    }
    
    setLoading(false);
  }, [user]);

  return { isAdmin, role, loading };
};
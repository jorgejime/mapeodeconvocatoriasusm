import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: string;
  full_name: string | null;
}

export const useUserRole = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email]);

  const isAdmin = () => {
    return user?.email === "admin@usm.edu.co";
  };

  const isUser = () => {
    return user?.email === "rectoria@usm.edu.co";
  };

  const canManage = () => {
    return isAdmin();
  };

  const canView = () => {
    return isAdmin() || isUser();
  };

  return {
    profile,
    loading,
    isAdmin: isAdmin(),
    isUser: isUser(),
    canManage: canManage(),
    canView: canView(),
  };
};
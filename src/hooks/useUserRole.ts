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
        // Fetch profile with additional validation
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .eq("user_id", user.id) // Additional security check
          .single();

        if (error && error.code !== "PGRST116") {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error fetching profile:", error.message);
          }
        } else {
          // Validate that the profile data matches the authenticated user
          if (data && data.email === user.email && data.user_id === user.id) {
            setProfile(data);
          } else if (data) {
            // Security: Profile data doesn't match authenticated user
            console.warn("Profile data validation failed - possible security issue");
            setProfile(null);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching profile:", error.message);
        }
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

  const isInfoCenter = () => {
    return user?.email === "rectoria@usm.edu.co";
  };

  const canManage = () => {
    return isAdmin();
  };

  const canView = () => {
    return isAdmin() || isUser();
  };

  const canViewAll = () => {
    return isAdmin() || isInfoCenter();
  };

  return {
    profile,
    loading,
    isAdmin: isAdmin(),
    isUser: isUser(),
    isInfoCenter: isInfoCenter(),
    canManage: canManage(),
    canView: canView(),
    canViewAll: canViewAll(),
  };
};
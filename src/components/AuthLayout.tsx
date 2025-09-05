import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "./AuthForm";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthLayout: Setting up auth listeners");
    let hasInitialized = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthLayout: Auth state changed", { event, session });
        setSession(session);
        setUser(session?.user ?? null);
        if (!hasInitialized) {
          setLoading(false);
          hasInitialized = true;
        }
      }
    );

    // THEN check for existing session with timeout protection
    const checkSession = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        console.log("AuthLayout: Got session", { session, error });
        if (!hasInitialized) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          hasInitialized = true;
        }
      } catch (error) {
        console.error("AuthLayout: Session check failed", error);
        if (!hasInitialized) {
          setLoading(false);
          hasInitialized = true;
        }
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  console.log("AuthLayout: Rendering", { loading, user: !!user, session: !!session });

  if (loading) {
    console.log("AuthLayout: Showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log("AuthLayout: No user, showing AuthForm");
    return <AuthForm />;
  }

  console.log("AuthLayout: User authenticated, showing children");
  return <>{children}</>;
};
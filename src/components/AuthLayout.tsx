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
    let hasInitialized = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Reduced logging - only log events, not sensitive session data
        if (process.env.NODE_ENV === 'development') {
          console.log("AuthLayout: Auth event:", event);
        }
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
        
        // Reduced logging - don't log session details
        if (error && process.env.NODE_ENV === 'development') {
          console.error("AuthLayout: Session check error:", error.message);
        }
        
        if (!hasInitialized) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          hasInitialized = true;
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("AuthLayout: Session check failed:", error.message);
        }
        if (!hasInitialized) {
          setLoading(false);
          hasInitialized = true;
        }
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};
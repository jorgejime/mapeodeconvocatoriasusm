import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import CriticalAlerts from "@/components/dashboard/CriticalAlerts";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import QuickActions from "@/components/dashboard/QuickActions";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  fecha_limite_aplicacion: string | null;
  valor: number | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  cumplimos_requisitos: boolean | null;
  created_at: string;
  tipo_moneda: string | null;
  sector_tema: string | null;
}

export default function Dashboard() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { isAdmin } = useUserRole(user);

  useEffect(() => {
    // Add timeout for initial load
    const initializeWithTimeout = async () => {
      try {
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('User fetch timeout')), 8000)
        );
        
        const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
        setUser(user);
      } catch (error) {
        console.error("Error getting user:", error);
        setUser(null);
      }
    };
    
    initializeWithTimeout();
    fetchConvocatorias();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      // Add timeout protection for database queries
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 15000)
      );
      
      const queryPromise = supabase
        .from("convocatorias")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) throw error;
      setConvocatorias(data || []);
    } catch (error) {
      console.error("Error fetching convocatorias:", error);
      // Set empty array on error to prevent hanging
      setConvocatorias([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="border border-border bg-card p-8 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-light text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Vista general del sistema
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-8">
        <CriticalAlerts 
          convocatorias={convocatorias}
          onNavigateToConvocatoria={() => navigate("/convocatorias")}
        />

        <QuickActions
          convocatorias={convocatorias}
          onNavigateToConvocatorias={() => navigate("/convocatorias")}
          onNavigateToEstadisticas={() => navigate("/estadisticas")}
          onNavigateToConfiguracion={() => navigate("/configuracion")}
          isAdmin={isAdmin}
        />

        <ExecutiveSummary convocatorias={convocatorias} />

        <PerformanceMetrics convocatorias={convocatorias} />
      </div>
    </div>
  );
}
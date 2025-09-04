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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    fetchConvocatorias();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      const { data, error } = await supabase
        .from("convocatorias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConvocatorias(data || []);
    } catch (error) {
      console.error("Error fetching convocatorias:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="neomorphic-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="neomorphic-card p-4 sm:p-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-playfair">
            Dashboard Ejecutivo
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-inter">
            {isAdmin 
              ? "Vista estratégica para la gestión de convocatorias y toma de decisiones"
              : "Panel de control con información clave de convocatorias"
            }
          </p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Column 1: Critical Alerts */}
        <div className="space-y-4 sm:space-y-6">
          <div className="neomorphic-card">
            <CriticalAlerts 
              convocatorias={convocatorias}
              onNavigateToConvocatoria={() => navigate("/convocatorias")}
            />
          </div>
          
          <div className="neomorphic-card">
            <QuickActions
              convocatorias={convocatorias}
              onNavigateToConvocatorias={() => navigate("/convocatorias")}
              onNavigateToEstadisticas={() => navigate("/estadisticas")}
              onNavigateToConfiguracion={() => navigate("/configuracion")}
              isAdmin={isAdmin}
            />
          </div>
        </div>

        {/* Column 2: Executive Summary */}
        <div className="neomorphic-card">
          <ExecutiveSummary convocatorias={convocatorias} />
        </div>

        {/* Column 3: Performance Metrics */}
        <div className="neomorphic-card">
          <PerformanceMetrics convocatorias={convocatorias} />
        </div>
      </div>
    </div>
  );
}
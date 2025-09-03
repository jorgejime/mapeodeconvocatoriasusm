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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Dashboard Ejecutivo
        </h1>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Vista estratégica para la gestión de convocatorias y toma de decisiones"
            : "Panel de control con información clave de convocatorias"
          }
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Column 1: Critical Alerts */}
        <div className="space-y-6">
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
        </div>

        {/* Column 2: Executive Summary */}
        <div>
          <ExecutiveSummary convocatorias={convocatorias} />
        </div>

        {/* Column 3: Performance Metrics */}
        <div>
          <PerformanceMetrics convocatorias={convocatorias} />
        </div>
      </div>
    </div>
  );
}
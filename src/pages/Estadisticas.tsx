import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { XCircle } from "lucide-react";
import StatsCards from "@/components/stats/StatsCards";
import CurrencyStats from "@/components/stats/CurrencyStats";
import ChartsGrid from "@/components/stats/ChartsGrid";
import SummaryCards from "@/components/stats/SummaryCards";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  orden: string | null;
  tipo: string | null;
  valor: number | null;
  tipo_moneda: string | null;
  sector_tema: string | null;
  componentes_transversales: string | null;
  cumplimos_requisitos: boolean | null;
  que_nos_falta: string | null;
  fecha_limite_aplicacion: string | null;
  link_convocatoria: string | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

interface StatsData {
  totalConvocatorias: number;
  convocatoriasAbiertas: number;
  cumplimosRequisitos: number;
  proximasVencer: number;
  porEstado: Array<{ name: string; value: number; color: string }>;
  porSector: Array<{ name: string; value: number }>;
  porMes: Array<{ name: string; convocatorias: number }>;
  porEntidad: Array<{ name: string; value: number }>;
  currencyStats: Array<{ currency: string; total: number; count: number; average: number }>;
  sectoresUnicos: number;
  entidadesUnicas: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--danger))',
  '#8884d8',
  '#82ca9d'
];

export default function Estadisticas() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalConvocatorias: 0,
    convocatoriasAbiertas: 0,
    cumplimosRequisitos: 0,
    proximasVencer: 0,
    porEstado: [],
    porSector: [],
    porMes: [],
    porEntidad: [],
    currencyStats: [],
    sectoresUnicos: 0,
    entidadesUnicas: 0
  });
  const [user, setUser] = useState<any>(null);

  // Get user info and role
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { canViewAll, loading: roleLoading } = useUserRole(user);

  // Fetch stats when user has permissions
  useEffect(() => {
    if (!roleLoading && canViewAll) {
      fetchStats();
    } else if (!roleLoading) {
      setLoading(false);
    }
  }, [canViewAll, roleLoading]);

  const fetchStats = async () => {
    try {
      const { data: convocatorias, error } = await supabase
        .from("convocatorias")
        .select("*");

      if (error) throw error;

      if (convocatorias) {
        calculateStats(convocatorias);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (convocatorias: Convocatoria[]) => {
    const total = convocatorias.length;
    const abiertas = convocatorias.filter(c => c.estado_convocatoria === "Abierta").length;
    const cumplimos = convocatorias.filter(c => c.cumplimos_requisitos === true).length;

    // Por estado
    const estadoCount: Record<string, number> = {};
    convocatorias.forEach(c => {
      const estado = c.estado_convocatoria || "Sin estado";
      estadoCount[estado] = (estadoCount[estado] || 0) + 1;
    });

    const porEstado = Object.entries(estadoCount).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));

    // Por sector
    const sectorCount: Record<string, number> = {};
    convocatorias.forEach(c => {
      const sector = c.sector_tema || "Sin sector";
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });

    const porSector = Object.entries(sectorCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Por mes de creación
    const mesCount: Record<string, { convocatorias: number }> = {};
    convocatorias.forEach(c => {
      const fecha = new Date(c.created_at);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      if (!mesCount[mes]) {
        mesCount[mes] = { convocatorias: 0 };
      }
      mesCount[mes].convocatorias += 1;
    });

    const porMes = Object.entries(mesCount)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const [monthA, yearA] = a.name.split(' ');
        const [monthB, yearB] = b.name.split(' ');
        const monthNumA = getMonthNumber(monthA);
        const monthNumB = getMonthNumber(monthB);
        const yearNumA = parseInt(`20${yearA}`);
        const yearNumB = parseInt(`20${yearB}`);
        const dateA = new Date(yearNumA, monthNumA);
        const dateB = new Date(yearNumB, monthNumB);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6);

    // Por entidad
    const entidadCount: Record<string, number> = {};
    convocatorias.forEach(c => {
      entidadCount[c.entidad] = (entidadCount[c.entidad] || 0) + 1;
    });

    const porEntidad = Object.entries(entidadCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Estadísticas por moneda
    const currencyStats: Record<string, { total: number; count: number; values: number[] }> = {};
    convocatorias.forEach(c => {
      if (c.valor && c.tipo_moneda) {
        const currency = c.tipo_moneda;
        if (!currencyStats[currency]) {
          currencyStats[currency] = { total: 0, count: 0, values: [] };
        }
        currencyStats[currency].total += c.valor;
        currencyStats[currency].count += 1;
        currencyStats[currency].values.push(c.valor);
      }
    });

    const currencyStatsArray = Object.entries(currencyStats).map(([currency, data]) => ({
      currency,
      total: data.total,
      count: data.count,
      average: data.total / data.count
    })).sort((a, b) => b.count - a.count);

    // Próximas a vencer (30 días)
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);

    const proximasVencer = convocatorias.filter(c => {
      if (!c.fecha_limite_aplicacion) return false;
      const fechaLimite = new Date(c.fecha_limite_aplicacion);
      return fechaLimite >= hoy && fechaLimite <= en30Dias;
    }).length;

    setStats({
      totalConvocatorias: total,
      convocatoriasAbiertas: abiertas,
      cumplimosRequisitos: cumplimos,
      proximasVencer,
      porEstado,
      porSector,
      porMes,
      porEntidad,
      currencyStats: currencyStatsArray,
      sectoresUnicos: porSector.length,
      entidadesUnicas: porEntidad.length
    });
  };

  const getMonthNumber = (monthName: string): number => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return months.indexOf(monthName.toLowerCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canViewAll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-muted-foreground">Solo los administradores y el centro de información pueden ver las estadísticas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 animate-fade-in">
      {/* Encabezado */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Estadísticas del Sistema
        </h1>
        <p className="text-muted-foreground text-lg">
          Dashboard ejecutivo con análisis completo de convocatorias por moneda
        </p>
      </div>

      {/* Métricas principales */}
      <StatsCards 
        totalConvocatorias={stats.totalConvocatorias}
        convocatoriasAbiertas={stats.convocatoriasAbiertas}
        proximasVencer={stats.proximasVencer}
        cumplimosRequisitos={stats.cumplimosRequisitos}
      />

      {/* Estadísticas por Moneda */}
      {stats.currencyStats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Análisis por Moneda</h2>
          <CurrencyStats currencyStats={stats.currencyStats} />
        </div>
      )}

      {/* Gráficos principales */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Análisis Gráfico</h2>
        <ChartsGrid 
          data={{
            porEstado: stats.porEstado,
            porSector: stats.porSector,
            porMes: stats.porMes,
            porEntidad: stats.porEntidad
          }}
        />
      </div>

      {/* Resumen ejecutivo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Resumen Ejecutivo</h2>
        <SummaryCards 
          totalConvocatorias={stats.totalConvocatorias}
          cumplimosRequisitos={stats.cumplimosRequisitos}
          convocatoriasAbiertas={stats.convocatoriasAbiertas}
          sectoresUnicos={stats.sectoresUnicos}
          entidadesUnicas={stats.entidadesUnicas}
        />
      </div>
    </div>
  );
}
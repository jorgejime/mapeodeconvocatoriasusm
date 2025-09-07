import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Convocatoria } from "@/types/convocatoria";

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
  currencyStatsAbiertas: Array<{ currency: string; total: number; count: number; average: number }>;
  montoTotalAbierto: { cop: number; usd: number; eur: number; otros: number };
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
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
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
    currencyStatsAbiertas: [],
    montoTotalAbierto: { cop: 0, usd: 0, eur: 0, otros: 0 },
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
      const { data: convocatoriasData, error } = await supabase
        .from("convocatorias")
        .select("*");

      if (error) throw error;

      if (convocatoriasData) {
        setConvocatorias(convocatoriasData);
        calculateStats(convocatoriasData);
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

    // Estadísticas por moneda y monto total abierto
    const currencyStats: Record<string, { total: number; count: number; values: number[] }> = {};
    const currencyStatsAbiertas: Record<string, { total: number; count: number; values: number[] }> = {};
    const montoTotalAbierto = { cop: 0, usd: 0, eur: 0, otros: 0 };
    
    convocatorias.forEach(c => {
      if (c.valor && c.tipo_moneda) {
        const currency = c.tipo_moneda;
        
        // Todas las convocatorias
        if (!currencyStats[currency]) {
          currencyStats[currency] = { total: 0, count: 0, values: [] };
        }
        currencyStats[currency].total += c.valor;
        currencyStats[currency].count += 1;
        currencyStats[currency].values.push(c.valor);
        
        // Solo convocatorias abiertas
        if (c.estado_convocatoria === "Abierta") {
          if (!currencyStatsAbiertas[currency]) {
            currencyStatsAbiertas[currency] = { total: 0, count: 0, values: [] };
          }
          currencyStatsAbiertas[currency].total += c.valor;
          currencyStatsAbiertas[currency].count += 1;
          currencyStatsAbiertas[currency].values.push(c.valor);
          
          // Acumular en monto total abierto por moneda
          switch (currency.toUpperCase()) {
            case 'COP':
              montoTotalAbierto.cop += c.valor;
              break;
            case 'USD':
              montoTotalAbierto.usd += c.valor;
              break;
            case 'EUR':
              montoTotalAbierto.eur += c.valor;
              break;
            default:
              montoTotalAbierto.otros += c.valor;
              break;
          }
        }
      }
    });

    const currencyStatsArray = Object.entries(currencyStats).map(([currency, data]) => ({
      currency,
      total: data.total,
      count: data.count,
      average: data.total / data.count
    })).sort((a, b) => b.count - a.count);

    const currencyStatsAbiertasArray = Object.entries(currencyStatsAbiertas).map(([currency, data]) => ({
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
      currencyStatsAbiertas: currencyStatsAbiertasArray,
      montoTotalAbierto,
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
    <div className="min-h-screen bg-background p-8 space-y-12">
      {/* Header - Minimal */}
      <div className="space-y-4 mb-16">
        <h1 className="text-5xl font-light tracking-tight">Estadísticas</h1>
        <div className="w-16 h-0.5 bg-muted-foreground/20"></div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8 max-w-7xl">
        
        {/* Main Metrics - Large blocks */}
        <Card className="col-span-12 md:col-span-6 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total</div>
              <div className="text-6xl font-light">{stats.totalConvocatorias}</div>
              <div className="text-muted-foreground">Convocatorias registradas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Elegibles</div>
              <div className="text-6xl font-light text-primary">{stats.cumplimosRequisitos}</div>
              <div className="text-muted-foreground">
                {stats.totalConvocatorias > 0 ? Math.round((stats.cumplimosRequisitos / stats.totalConvocatorias) * 100) : 0}% del total
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution - Medium block */}
        <Card className="col-span-12 md:col-span-8 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estado</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.porEstado}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stats.porEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-sm">
                {stats.porEstado.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monto Total Disponible - Destacado */}
        <Card className="col-span-12 bg-gradient-to-r from-success/10 to-success/5 border-success/30 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="text-sm font-medium text-success uppercase tracking-wider">
                💰 Monto Total Acumulado Disponible
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.montoTotalAbierto.cop > 0 && (
                  <div className="space-y-2">
                    <div className="text-4xl font-light text-success">
                      ${(stats.montoTotalAbierto.cop / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-muted-foreground">COP</div>
                  </div>
                )}
                {stats.montoTotalAbierto.usd > 0 && (
                  <div className="space-y-2">
                    <div className="text-4xl font-light text-success">
                      ${(stats.montoTotalAbierto.usd / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-muted-foreground">USD</div>
                  </div>
                )}
                {stats.montoTotalAbierto.eur > 0 && (
                  <div className="space-y-2">
                    <div className="text-4xl font-light text-success">
                      €{(stats.montoTotalAbierto.eur / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-muted-foreground">EUR</div>
                  </div>
                )}
                {stats.montoTotalAbierto.otros > 0 && (
                  <div className="space-y-2">
                    <div className="text-4xl font-light text-success">
                      {stats.montoTotalAbierto.otros.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Otras monedas</div>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-success/20">
                <div className="text-xs text-muted-foreground">
                  ✅ Solo convocatorias con estado "Abierta" • Actualizado en tiempo real
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - Small blocks */}
        <Card className="col-span-12 md:col-span-4 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Abiertas</div>
              <div className="text-4xl font-light text-success">{stats.convocatoriasAbiertas}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Por vencer</div>
              <div className="text-4xl font-light text-warning">{stats.proximasVencer}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sectores</div>
              <div className="text-4xl font-light">{stats.sectoresUnicos}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Entidades</div>
              <div className="text-4xl font-light">{stats.entidadesUnicas}</div>
            </div>
          </CardContent>
        </Card>

        {/* Top Sectors - Wide block */}
        <Card className="col-span-12 md:col-span-8 border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Top Sectores</div>
              <div className="space-y-4">
                {stats.porSector.slice(0, 5).map((sector, index) => (
                  <div key={sector.name} className="flex items-center justify-between">
                    <span className="text-sm">{sector.name}</span>
                    <div className="flex items-center gap-3 min-w-20">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${(sector.value / Math.max(...stats.porSector.map(s => s.value))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-8 text-right">{sector.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Stats */}
        {stats.currencyStats.length > 0 && (
          <Card className="col-span-12 border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Distribución por Moneda</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {stats.currencyStats.map((currency) => (
                    <div key={currency.currency} className="space-y-4">
                      <div className="text-lg font-medium">{currency.currency}</div>
                      <div className="space-y-2">
                        <div className="text-2xl font-light">
                          {currency.currency === 'COP' 
                            ? `$${(currency.total / 1000000).toFixed(1)}M`
                            : currency.currency === 'USD'
                            ? `$${(currency.total / 1000).toFixed(0)}K`
                            : `€${(currency.total / 1000).toFixed(0)}K`
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">{currency.count} convocatorias</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Open Convocatorias Amount by Currency */}
        {stats.currencyStatsAbiertas.length > 0 && (
          <Card className="col-span-12 border-0 shadow-sm bg-success/5 border-success/20">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Montos Disponibles - Solo Convocatorias Abiertas
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {stats.currencyStatsAbiertas.map((currency) => (
                    <div key={currency.currency} className="space-y-4">
                      <div className="text-lg font-medium text-success">{currency.currency}</div>
                      <div className="space-y-3">
                        <div className="text-3xl font-light text-success">
                          {currency.currency === 'COP' 
                            ? `$${(currency.total / 1000000).toFixed(1)}M`
                            : currency.currency === 'USD'
                            ? `$${(currency.total / 1000).toFixed(0)}K`
                            : `€${(currency.total / 1000).toFixed(0)}K`
                          }
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-success/80">{currency.count} convocatorias abiertas</div>
                          <div className="text-xs text-muted-foreground">
                            Promedio: {currency.currency === 'COP' 
                              ? `$${(currency.average / 1000000).toFixed(1)}M`
                              : currency.currency === 'USD'
                              ? `$${(currency.average / 1000).toFixed(0)}K`
                              : `€${(currency.average / 1000).toFixed(0)}K`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-success/20">
                  <div className="text-xs text-muted-foreground">
                    ✓ Solo incluye convocatorias con estado "Abierta" y monto definido
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
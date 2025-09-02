import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2
} from "lucide-react";

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
  totalValor: number;
  convocatoriasAbiertas: number;
  cumplimosRequisitos: number;
  porEstado: Array<{ name: string; value: number; color: string }>;
  porSector: Array<{ name: string; value: number }>;
  porMes: Array<{ name: string; convocatorias: number; valor: number }>;
  porEntidad: Array<{ name: string; value: number }>;
  proximasVencer: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export default function Estadisticas() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    totalConvocatorias: 0,
    totalValor: 0,
    convocatoriasAbiertas: 0,
    cumplimosRequisitos: 0,
    porEstado: [],
    porSector: [],
    porMes: [],
    porEntidad: [],
    proximasVencer: 0
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar si es admin
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user?.email === "admin@usm.edu.co") {
        fetchStats();
      } else {
        setLoading(false);
      }
    });
  }, []);

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
    const totalValor = convocatorias
      .filter(c => c.valor && c.tipo_moneda === 'COP')
      .reduce((sum, c) => sum + (c.valor || 0), 0);

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
      color: COLORS[index % COLORS.length]
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
    const mesCount: Record<string, { convocatorias: number; valor: number }> = {};
    convocatorias.forEach(c => {
      const fecha = new Date(c.created_at);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      if (!mesCount[mes]) {
        mesCount[mes] = { convocatorias: 0, valor: 0 };
      }
      mesCount[mes].convocatorias += 1;
      if (c.valor && c.tipo_moneda === 'COP') {
        mesCount[mes].valor += c.valor;
      }
    });

    const porMes = Object.entries(mesCount)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
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
      totalValor,
      convocatoriasAbiertas: abiertas,
      cumplimosRequisitos: cumplimos,
      porEstado,
      porSector,
      porMes,
      porEntidad,
      proximasVencer
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.email !== "admin@usm.edu.co") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-muted-foreground">Solo los administradores pueden ver las estadísticas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Estadísticas del Sistema</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Análisis detallado y métricas de las convocatorias
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Convocatorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConvocatorias}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Registradas en el sistema
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalValor / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              COP en convocatorias
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convocatorias Abiertas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.convocatoriasAbiertas}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Disponibles para aplicar
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.proximasVencer}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              En los próximos 30 días
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.porEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.porEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Sectores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top 10 Sectores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.porSector} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tendencia por Mes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendencia Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.porMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="convocatorias" />
                <YAxis yAxisId="valor" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'valor' ? `$${(Number(value) / 1000000).toFixed(1)}M` : value,
                    name === 'convocatorias' ? 'Convocatorias' : 'Valor (COP)'
                  ]}
                />
                <Legend />
                <Bar yAxisId="convocatorias" dataKey="convocatorias" fill="hsl(var(--primary))" />
                <Line yAxisId="valor" type="monotone" dataKey="valor" stroke="hsl(var(--secondary))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Entidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top 8 Entidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.porEntidad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cumplimiento de Requisitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Cumplimos requisitos:</span>
                <Badge variant="default" className="bg-success text-success-foreground">
                  {stats.cumplimosRequisitos} ({((stats.cumplimosRequisitos / stats.totalConvocatorias) * 100).toFixed(1)}%)
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>No cumplimos requisitos:</span>
                <Badge variant="secondary">
                  {stats.totalConvocatorias - stats.cumplimosRequisitos} ({(((stats.totalConvocatorias - stats.cumplimosRequisitos) / stats.totalConvocatorias) * 100).toFixed(1)}%)
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.cumplimosRequisitos / stats.totalConvocatorias) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Convocatorias activas:</span>
                <span className="font-medium">{stats.convocatoriasAbiertas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor promedio:</span>
                <span className="font-medium">
                  ${stats.totalConvocatorias > 0 ? (stats.totalValor / stats.totalConvocatorias / 1000000).toFixed(1) : 0}M COP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sectores únicos:</span>
                <span className="font-medium">{stats.porSector.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entidades únicas:</span>
                <span className="font-medium">{stats.porEntidad.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarIcon, DollarSign, FileText, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  fecha_limite_aplicacion: string | null;
  valor: number | null;
  estado_convocatoria: string | null;
  cumplimos_requisitos: boolean | null;
  created_at: string;
}

export default function Dashboard() {
  console.log("Dashboard: Rendering dashboard");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    abiertas: 0,
    cerradas: 0,
    cumplimos: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      const { data, error } = await supabase
        .from("convocatorias")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      setConvocatorias(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching convocatorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Convocatoria[]) => {
    const total = data.length;
    const abiertas = data.filter(c => c.estado_convocatoria === "Abierta").length;
    const cerradas = data.filter(c => c.estado_convocatoria === "Cerrada").length;
    const cumplimos = data.filter(c => c.cumplimos_requisitos === true).length;
    
    setStats({ total, abiertas, cerradas, cumplimos });
  };

  const getStatusColor = (fechaLimite: string | null): "verde" | "amarillo" | "rojo" => {
    if (!fechaLimite) return "rojo";
    
    const today = new Date();
    const deadline = new Date(fechaLimite);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return "verde";
    if (diffDays > 0) return "amarillo";
    return "rojo";
  };

  const getStatusText = (fechaLimite: string | null): string => {
    if (!fechaLimite) return "Sin fecha";
    
    const today = new Date();
    const deadline = new Date(fechaLimite);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return `${diffDays} días restantes`;
    if (diffDays > 0) return `${diffDays} días restantes`;
    if (diffDays === 0) return "Vence hoy";
    return `Vencida hace ${Math.abs(diffDays)} días`;
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
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de convocatorias y estadísticas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Convocatorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.abiertas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cerradas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimos Requisitos</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.cumplimos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Convocatorias */}
      <Card>
        <CardHeader>
          <CardTitle>Convocatorias Recientes</CardTitle>
          <CardDescription>
            Las últimas convocatorias registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {convocatorias.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay convocatorias registradas</p>
              <Button onClick={() => navigate("/convocatorias")}>
                Crear Primera Convocatoria
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {convocatorias.map((convocatoria) => (
                <div
                  key={convocatoria.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold">{convocatoria.nombre_convocatoria}</h4>
                    <p className="text-sm text-muted-foreground">{convocatoria.entidad}</p>
                    <div className="flex items-center gap-2">
                      {convocatoria.estado_convocatoria && (
                        <Badge variant={convocatoria.estado_convocatoria === "Abierta" ? "default" : "secondary"}>
                          {convocatoria.estado_convocatoria}
                        </Badge>
                      )}
                      {convocatoria.cumplimos_requisitos && (
                        <Badge variant="outline" className="text-success border-success">
                          Cumplimos requisitos
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {convocatoria.valor && (
                      <p className="font-semibold">
                        ${convocatoria.valor.toLocaleString()}
                      </p>
                    )}
                    {convocatoria.fecha_limite_aplicacion && (
                      <StatusBadge status={getStatusColor(convocatoria.fecha_limite_aplicacion)}>
                        {getStatusText(convocatoria.fecha_limite_aplicacion)}
                      </StatusBadge>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Button 
                  onClick={() => navigate("/convocatorias")} 
                  className="w-full"
                  variant="outline"
                >
                  Ver Todas las Convocatorias
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
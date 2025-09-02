import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarIcon, DollarSign, FileText, TrendingUp, CheckCircle, XCircle, Info, Clock, BarChart3, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

export default function Dashboard() {
  console.log("Dashboard: Rendering dashboard");
  const [allConvocatorias, setAllConvocatorias] = useState<Convocatoria[]>([]);
  const [recentConvocatorias, setRecentConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadosConvocatoria, setEstadosConvocatoria] = useState({
    total: 0,
    abiertas: 0,
    cerradas: 0,
  });
  const [estadosUSM, setEstadosUSM] = useState({
    enRevision: 0,
    enPreparacion: 0,
    presentadas: 0,
    archivadas: 0,
  });
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    fetchConvocatorias();
  }, []);

  const isAdmin = user?.email === "admin@usm.edu.co";

  const fetchConvocatorias = async () => {
    try {
      // Fetch all convocatorias for statistics
      const { data: allData, error: allError } = await supabase
        .from("convocatorias")
        .select("*");

      if (allError) throw allError;

      // Fetch recent convocatorias for display
      const { data: recentData, error: recentError } = await supabase
        .from("convocatorias")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (recentError) throw recentError;

      setAllConvocatorias(allData || []);
      setRecentConvocatorias(recentData || []);
      calculateStats(allData || []);
    } catch (error) {
      console.error("Error fetching convocatorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Convocatoria[]) => {
    // Estados de Convocatoria
    const total = data.length;
    const abiertas = data.filter(c => c.estado_convocatoria === "Abierta").length;
    const cerradas = data.filter(c => c.estado_convocatoria === "Cerrada").length;
    
    setEstadosConvocatoria({ total, abiertas, cerradas });

    // Estados Internos USM
    const enRevision = data.filter(c => c.estado_usm === "En revisión").length;
    const enPreparacion = data.filter(c => c.estado_usm === "En preparación").length;
    const presentadas = data.filter(c => c.estado_usm === "Presentadas").length;
    const archivadas = data.filter(c => c.estado_usm === "Archivadas").length;
    
    setEstadosUSM({ enRevision, enPreparacion, presentadas, archivadas });
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
          {isAdmin 
            ? "Resumen general de convocatorias y estadísticas - Panel de Administrador"
            : "Resumen general de convocatorias - Vista de Usuario"
          }
        </p>
      </div>

      {/* Estados de Convocatoria */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Estados de Convocatoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <FileText className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estadosConvocatoria.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{estadosConvocatoria.abiertas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cerradas</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{estadosConvocatoria.cerradas}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estados Internos USM */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Estados Internos USM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En revisión</CardTitle>
                <Info className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{estadosUSM.enRevision}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En preparación</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{estadosUSM.enPreparacion}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presentadas</CardTitle>
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">{estadosUSM.presentadas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archivadas</CardTitle>
                <Archive className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-500">{estadosUSM.archivadas}</div>
              </CardContent>
            </Card>
          </div>
        </div>
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
          {recentConvocatorias.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No hay convocatorias registradas</p>
              <Button onClick={() => navigate("/convocatorias")}>
                Crear Primera Convocatoria
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Grid de tarjetas de convocatorias */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentConvocatorias.map((convocatoria) => (
                  <Card 
                    key={convocatoria.id} 
                    className="h-fit hover:shadow-md transition-all duration-200 border-border/50 hover:border-border cursor-pointer group"
                    onClick={() => navigate("/convocatorias")}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-semibold line-clamp-2 leading-5">
                          {convocatoria.nombre_convocatoria}
                        </CardTitle>
                        {convocatoria.valor && (
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium text-primary">
                              ${convocatoria.valor.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {convocatoria.entidad}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-3 pb-3">
                      {/* Estado */}
                      <div className="flex flex-wrap gap-1">
                        {convocatoria.estado_convocatoria && (
                          <Badge 
                            variant={convocatoria.estado_convocatoria === "Abierta" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {convocatoria.estado_convocatoria}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Fecha límite */}
                      {convocatoria.fecha_limite_aplicacion && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Fecha límite:</span>
                          <StatusBadge status={getStatusColor(convocatoria.fecha_limite_aplicacion)}>
                            {new Date(convocatoria.fecha_limite_aplicacion).toLocaleDateString()}
                          </StatusBadge>
                        </div>
                      )}
                      
                      {/* Cumplimos requisitos */}
                      {convocatoria.cumplimos_requisitos !== null && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Cumple requisitos:</span>
                          <Badge 
                            variant={convocatoria.cumplimos_requisitos ? "default" : "secondary"}
                            className={`text-xs ${convocatoria.cumplimos_requisitos ? "bg-success text-success-foreground" : ""}`}
                          >
                            {convocatoria.cumplimos_requisitos ? "Sí" : "No"}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Fecha de creación */}
                      <div className="text-xs text-muted-foreground">
                        Agregada: {new Date(convocatoria.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
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
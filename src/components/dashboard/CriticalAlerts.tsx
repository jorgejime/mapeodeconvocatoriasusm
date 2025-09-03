import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, TrendingUp, Target } from "lucide-react";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  fecha_limite_aplicacion: string | null;
  valor: number | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  cumplimos_requisitos: boolean | null;
}

interface CriticalAlertsProps {
  convocatorias: Convocatoria[];
  onNavigateToConvocatoria: () => void;
}

export default function CriticalAlerts({ convocatorias, onNavigateToConvocatoria }: CriticalAlertsProps) {
  const today = new Date();
  
  // Convocatorias que vencen en los próximos 7 días
  const urgentDeadlines = convocatorias.filter(c => {
    if (!c.fecha_limite_aplicacion || c.estado_convocatoria !== "Abierta") return false;
    const deadline = new Date(c.fecha_limite_aplicacion);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  // Convocatorias de alto valor (más de 100M)
  const highValueOpportunities = convocatorias.filter(c => 
    c.valor && c.valor > 100000000 && 
    c.estado_convocatoria === "Abierta" &&
    c.cumplimos_requisitos
  );

  // Convocatorias estancadas en revisión por mucho tiempo
  const stuckInReview = convocatorias.filter(c => 
    c.estado_usm === "En revisión" && 
    c.estado_convocatoria === "Abierta"
  ).length;

  // Convocatorias perdidas (vencidas que cumplíamos requisitos)
  const missedOpportunities = convocatorias.filter(c => {
    if (!c.fecha_limite_aplicacion || !c.cumplimos_requisitos) return false;
    const deadline = new Date(c.fecha_limite_aplicacion);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0 && c.estado_usm !== "Presentada";
  }).length;

  const alerts = [
    {
      type: "urgent" as const,
      count: urgentDeadlines.length,
      title: "Vencimientos Críticos",
      description: "Convocatorias que vencen en 7 días",
      icon: AlertTriangle,
      color: "danger"
    },
    {
      type: "opportunity" as const,
      count: highValueOpportunities.length,
      title: "Oportunidades Alto Valor",
      description: "Convocatorias >$100M que cumplimos requisitos", 
      icon: Target,
      color: "success"
    },
    {
      type: "stuck" as const,
      count: stuckInReview,
      title: "Estancadas en Revisión",
      description: "Convocatorias abiertas sin avanzar",
      icon: Clock,
      color: "warning"
    },
    {
      type: "missed" as const,
      count: missedOpportunities,
      title: "Oportunidades Perdidas",
      description: "Vencidas sin presentar",
      icon: TrendingUp,
      color: "danger"
    }
  ];

  const getColorClasses = (color: string, isCount = false) => {
    switch (color) {
      case "danger":
        return isCount ? "text-danger" : "text-danger-foreground bg-danger";
      case "warning":
        return isCount ? "text-warning" : "text-warning-foreground bg-warning";
      case "success":
        return isCount ? "text-success" : "text-success-foreground bg-success";
      default:
        return isCount ? "text-muted-foreground" : "text-muted-foreground bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          Alertas Críticas
        </CardTitle>
        <CardDescription>
          Situaciones que requieren atención inmediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.type} className="text-center space-y-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${getColorClasses(alert.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className={`text-2xl font-bold ${getColorClasses(alert.color, true)}`}>
                  {alert.count}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {urgentDeadlines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-danger">Vencimientos Urgentes</h4>
              <Badge variant="destructive">{urgentDeadlines.length}</Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {urgentDeadlines.slice(0, 3).map((conv) => {
                const daysLeft = Math.ceil((new Date(conv.fecha_limite_aplicacion!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={conv.id} className="flex items-center justify-between p-2 bg-danger-light rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.nombre_convocatoria}</p>
                      <p className="text-xs text-muted-foreground">{conv.entidad}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        {daysLeft === 0 ? "Hoy" : `${daysLeft}d`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button onClick={onNavigateToConvocatoria} variant="outline" className="w-full">
            Ver Todas las Convocatorias
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
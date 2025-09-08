import { AlertTriangle, Clock, TrendingUp, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  
  // Convocatorias que vencen en los próximos 30 días
  const urgentDeadlines = convocatorias.filter(c => {
    if (!c.fecha_limite_aplicacion || c.estado_convocatoria !== "Abierta") return false;
    const deadline = new Date(c.fecha_limite_aplicacion);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
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
      description: "Convocatorias que vencen en 30 días",
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

  const getIconBackground = (color: string) => {
    switch (color) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-foreground mb-2">Alertas Críticas</h2>
        <p className="text-muted-foreground">
          Situaciones que requieren atención inmediata
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <Card key={alert.type} className="relative overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{alert.title}</p>
                  <p className="text-3xl font-bold text-foreground">{alert.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${getIconBackground(alert.color)} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {urgentDeadlines.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Vencimientos Urgentes</h3>
              <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                {urgentDeadlines.length}
              </div>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {urgentDeadlines.slice(0, 5).map((conv) => {
                const daysLeft = Math.ceil((new Date(conv.fecha_limite_aplicacion!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={conv.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{conv.nombre_convocatoria}</p>
                      <p className="text-xs text-muted-foreground">{conv.entidad}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                        {daysLeft === 0 ? "Hoy" : `${daysLeft}d`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <button 
                onClick={onNavigateToConvocatoria} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Ver Todas las Convocatorias
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-light mb-2">Alertas Críticas</h3>
        <p className="text-muted-foreground">
          Situaciones que requieren atención
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.type} className="text-center space-y-3">
              <div className="text-2xl font-light text-foreground">
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
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-danger font-inter">Vencimientos Urgentes</h4>
            <div className="neomorphic-small px-2 py-1">
              <span className="text-xs font-bold text-danger">{urgentDeadlines.length}</span>
            </div>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {urgentDeadlines.slice(0, 3).map((conv) => {
              const daysLeft = Math.ceil((new Date(conv.fecha_limite_aplicacion!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={conv.id} className="neomorphic-small neomorphic-hover flex items-center justify-between p-2 sm:p-3 bg-danger-light">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate font-inter">{conv.nombre_convocatoria}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-inter">{conv.entidad}</p>
                  </div>
                  <div className="text-right">
                    <div className="neomorphic-small px-2 py-1">
                      <span className="text-xs font-bold text-danger">
                        {daysLeft === 0 ? "Hoy" : `${daysLeft}d`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-3 sm:pt-4 border-t border-border/20">
        <button 
          onClick={onNavigateToConvocatoria} 
          className="neomorphic-button w-full text-sm font-inter text-foreground"
        >
          Ver Todas las Convocatorias
        </button>
      </div>
    </div>
  );
}
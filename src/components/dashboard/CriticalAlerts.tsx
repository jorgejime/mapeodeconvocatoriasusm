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
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="neomorphic-small p-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-playfair">Alertas Críticas</h3>
        </div>
        <p className="text-sm text-muted-foreground font-inter">
          Situaciones que requieren atención inmediata
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.type} className="neomorphic-small neomorphic-hover p-3 sm:p-4 text-center space-y-2">
              <div className={`neomorphic-small inline-flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 ${getColorClasses(alert.color)}`}>
                <Icon className="h-3 w-3 sm:h-6 sm:w-6" />
              </div>
              <div className={`text-lg sm:text-2xl font-bold font-playfair ${getColorClasses(alert.color, true)}`}>
                {alert.count}
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium font-inter">{alert.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-inter">{alert.description}</p>
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
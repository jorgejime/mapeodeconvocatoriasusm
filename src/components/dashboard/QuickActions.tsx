import { Plus, FileText, BarChart3, Settings, Download } from "lucide-react";

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

interface QuickActionsProps {
  convocatorias: Convocatoria[];
  onNavigateToConvocatorias: () => void;
  onNavigateToEstadisticas: () => void;
  onNavigateToConfiguracion: () => void;
  isAdmin: boolean;
}

export default function QuickActions({ 
  convocatorias, 
  onNavigateToConvocatorias, 
  onNavigateToEstadisticas,
  onNavigateToConfiguracion,
  isAdmin 
}: QuickActionsProps) {
  const today = new Date();
  
  // Contadores para badges
  const pendingReview = convocatorias.filter(c => 
    c.estado_usm === "En revisión" && c.estado_convocatoria === "Abierta"
  ).length;

  const needsPreparation = convocatorias.filter(c => 
    c.estado_usm === "En preparación" && c.estado_convocatoria === "Abierta"
  ).length;

  const expiringSoon = convocatorias.filter(c => {
    if (!c.fecha_limite_aplicacion || c.estado_convocatoria !== "Abierta") return false;
    const deadline = new Date(c.fecha_limite_aplicacion);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 14;
  }).length;

  const actions = [
    {
      title: "Crear Convocatoria",
      description: "Agregar nueva convocatoria al sistema",
      icon: Plus,
      onClick: onNavigateToConvocatorias,
      variant: "default" as const,
      badge: null
    },
    {
      title: "Revisar Pendientes",
      description: "Convocatorias en estado de revisión",
      icon: FileText,
      onClick: onNavigateToConvocatorias,
      variant: "outline" as const,
      badge: pendingReview > 0 ? pendingReview : null,
      badgeVariant: "destructive" as const
    },
    {
      title: "Ver Estadísticas",
      description: "Análisis detallado y reportes",
      icon: BarChart3,
      onClick: onNavigateToEstadisticas,
      variant: "outline" as const,
      badge: null,
      disabled: !isAdmin
    },
    {
      title: "Configuración",
      description: "Ajustes del sistema",
      icon: Settings,
      onClick: onNavigateToConfiguracion,
      variant: "outline" as const,
      badge: null,
      disabled: !isAdmin
    }
  ];

  const priorities = [
    {
      title: "Revisión Urgente",
      count: pendingReview,
      description: "Convocatorias esperando revisión",
      action: "Revisar",
      color: "danger"
    },
    {
      title: "En Preparación",
      count: needsPreparation,
      description: "Convocatorias en desarrollo",
      action: "Continuar",
      color: "warning"
    },
    {
      title: "Vencen Pronto",
      count: expiringSoon,
      description: "Deadline en próximos 14 días",
      action: "Urgente",
      color: "danger"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "danger":
        return "bg-danger-light text-danger border-danger/20";
      case "warning":
        return "bg-warning-light text-warning border-warning/20";
      case "success":
        return "bg-success-light text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Acciones rápidas */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold font-playfair mb-2">Acciones Rápidas</h3>
          <p className="text-sm text-muted-foreground font-inter">
            Tareas principales y navegación rápida
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                disabled={action.disabled}
                className="neomorphic-button neomorphic-hover h-auto p-2 sm:p-3 flex flex-col items-center space-y-1 sm:space-y-2 relative min-h-[80px] sm:min-h-[100px] disabled:opacity-50"
              >
                {action.badge && (
                  <div className="neomorphic-small absolute -top-1 -right-1 text-xs h-5 w-5 flex items-center justify-center p-0 bg-danger text-danger-foreground">
                    {action.badge}
                  </div>
                )}
                <div className="neomorphic-small p-2 mb-1">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="text-center space-y-0.5 px-1 flex-1 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-medium leading-tight font-inter">{action.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight line-clamp-2 hidden sm:block font-inter">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prioridades */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold font-playfair mb-2">Prioridades del Día</h3>
          <p className="text-sm text-muted-foreground font-inter">
            Tareas que requieren atención prioritaria
          </p>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {priorities.map((priority) => (
            <div
              key={priority.title}
              className={`neomorphic-small neomorphic-hover p-2 sm:p-3 ${getColorClasses(priority.color)}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <h4 className="font-medium text-sm sm:text-base truncate font-inter">{priority.title}</h4>
                    <div className="neomorphic-small px-2 py-1">
                      <span className="text-xs font-bold">{priority.count}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm opacity-80 line-clamp-2 font-inter">{priority.description}</p>
                </div>
                <button
                  onClick={onNavigateToConvocatorias}
                  className="neomorphic-small neomorphic-hover shrink-0 text-xs sm:text-sm px-2 sm:px-3 py-1 font-inter"
                >
                  {priority.action}
                </button>
              </div>
            </div>
          ))}
        </div>

        {priorities.every(p => p.count === 0) && (
          <div className="neomorphic-small text-center py-4 sm:py-6 text-muted-foreground">
            <p className="text-xs sm:text-sm font-inter">¡Excelente! No hay tareas urgentes pendientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
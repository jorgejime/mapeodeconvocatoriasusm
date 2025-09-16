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
    <div className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-light mb-2">Acciones Rápidas</h3>
        <p className="text-muted-foreground">
          Tareas principales del sistema
        </p>
      </div>
        
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              disabled={action.disabled}
              className="border border-border/50 rounded-lg p-3 sm:p-4 text-center hover:bg-muted/30 transition-colors disabled:opacity-50 relative min-h-[100px] sm:min-h-[110px] flex flex-col justify-center"
            >
              {action.badge && (
                <div className="absolute -top-1 -right-1 text-xs h-5 w-5 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full font-medium">
                  {action.badge}
                </div>
              )}
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-muted-foreground flex-shrink-0" />
              <p className="text-sm sm:text-base font-medium line-clamp-2 leading-tight">{action.title}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2 leading-tight">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Tareas principales y navegación rápida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                  <Button
                  key={action.title}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="h-auto p-3 flex flex-col items-center space-y-2 relative"
                >
                  {action.badge && (
                    <Badge 
                      variant={action.badgeVariant || "default"} 
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      {action.badge}
                    </Badge>
                  )}
                  <Icon className="h-6 w-6 mb-1" />
                  <div className="text-center space-y-1 px-1">
                    <p className="text-sm font-medium leading-tight">{action.title}</p>
                    <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Prioridades */}
      <Card>
        <CardHeader>
          <CardTitle>Prioridades del Día</CardTitle>
          <CardDescription>
            Tareas que requieren atención prioritaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorities.map((priority) => (
              <div
                key={priority.title}
                className={`p-3 rounded-lg border ${getColorClasses(priority.color)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{priority.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {priority.count}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-80">{priority.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onNavigateToConvocatorias}
                    className="shrink-0"
                  >
                    {priority.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {priorities.every(p => p.count === 0) && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">¡Excelente! No hay tareas urgentes pendientes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
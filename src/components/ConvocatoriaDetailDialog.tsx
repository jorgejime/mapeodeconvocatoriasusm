import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  Building2, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  FileText, 
  Award, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Target,
  MessageSquare,
  LinkIcon,
  Layers
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

interface ConvocatoriaDetailDialogProps {
  convocatoria: Convocatoria | null;
  isOpen: boolean;
  onClose: () => void;
}

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
  
  if (diffDays > 30) return `Faltan ${diffDays} días`;
  if (diffDays > 0) return `Faltan ${diffDays} días`;
  if (diffDays === 0) return "Vence hoy";
  return `Venció hace ${Math.abs(diffDays)} días`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "No especificada";
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const DetailRow = ({ 
  icon: Icon, 
  label, 
  value, 
  className = "" 
}: { 
  icon: any; 
  label: string; 
  value: React.ReactNode; 
  className?: string;
}) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg bg-muted/30 ${className}`}>
    <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <div className="text-foreground">{value}</div>
    </div>
  </div>
);

export function ConvocatoriaDetailDialog({ 
  convocatoria, 
  isOpen, 
  onClose 
}: ConvocatoriaDetailDialogProps) {
  if (!convocatoria) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold text-foreground pr-8">
            {convocatoria.nombre_convocatoria}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Información Principal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Información Principal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow
                icon={Building2}
                label="Entidad"
                value={convocatoria.entidad}
              />
              
              <DetailRow
                icon={Layers}
                label="Tipo"
                value={convocatoria.tipo || "No especificado"}
              />
              
              <DetailRow
                icon={Award}
                label="Orden"
                value={convocatoria.orden || "No especificado"}
              />
              
              <DetailRow
                icon={Target}
                label="Sector/Tema"
                value={convocatoria.sector_tema || "No especificado"}
              />
            </div>
          </div>

          {/* Enlace de la Convocatoria - Destacado */}
          {convocatoria.link_convocatoria && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <DetailRow
                icon={LinkIcon}
                label="Enlace de la Convocatoria"
                value={
                  <Button 
                    variant="default" 
                    className="mt-2 w-full md:w-auto hover-scale"
                    onClick={() => window.open(convocatoria.link_convocatoria!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Convocatoria
                  </Button>
                }
                className="bg-background/50"
              />
            </div>
          )}

          {/* Información Económica */}
          {convocatoria.valor && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Información Económica
              </h3>
              
              <DetailRow
                icon={DollarSign}
                label="Valor"
                value={
                  <span className="text-lg font-semibold text-primary">
                    {convocatoria.tipo_moneda} ${convocatoria.valor.toLocaleString()}
                  </span>
                }
              />
            </div>
          )}

          {/* Estados y Fechas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Estados y Fechas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow
                icon={FileText}
                label="Estado Convocatoria"
                value={
                  convocatoria.estado_convocatoria ? (
                    <Badge 
                      variant={convocatoria.estado_convocatoria === "Abierta" ? "default" : "secondary"}
                      className="hover-scale"
                    >
                      {convocatoria.estado_convocatoria}
                    </Badge>
                  ) : "No especificado"
                }
              />
              
              <DetailRow
                icon={Building2}
                label="Estado USM"
                value={convocatoria.estado_usm || "No especificado"}
              />
              
              <DetailRow
                icon={Calendar}
                label="Fecha Límite"
                value={
                  <div className="space-y-2">
                    <p>{formatDate(convocatoria.fecha_limite_aplicacion)}</p>
                    {convocatoria.fecha_limite_aplicacion && (
                      <StatusBadge status={getStatusColor(convocatoria.fecha_limite_aplicacion)}>
                        {getStatusText(convocatoria.fecha_limite_aplicacion)}
                      </StatusBadge>
                    )}
                  </div>
                }
              />
            </div>
          </div>

          {/* Requisitos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Análisis de Requisitos
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <DetailRow
                icon={convocatoria.cumplimos_requisitos ? CheckCircle : XCircle}
                label="¿Cumplimos Requisitos?"
                value={
                  <Badge 
                    variant={convocatoria.cumplimos_requisitos ? "default" : "secondary"}
                    className={convocatoria.cumplimos_requisitos ? "bg-success text-success-foreground" : ""}
                  >
                    {convocatoria.cumplimos_requisitos ? "Sí, cumplimos" : "No cumplimos"}
                  </Badge>
                }
              />
              
              {convocatoria.que_nos_falta && (
                <DetailRow
                  icon={AlertCircle}
                  label="¿Qué nos falta?"
                  value={
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {convocatoria.que_nos_falta}
                    </p>
                  }
                />
              )}
            </div>
          </div>

          {/* Componentes Transversales */}
          {convocatoria.componentes_transversales && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Componentes Adicionales
              </h3>
              
              <DetailRow
                icon={Users}
                label="Componentes Transversales"
                value={
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {convocatoria.componentes_transversales}
                  </p>
                }
              />
            </div>
          )}

          {/* Observaciones */}
          {convocatoria.observaciones && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Observaciones
              </h3>
              
              <DetailRow
                icon={MessageSquare}
                label="Observaciones"
                value={
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {convocatoria.observaciones}
                  </p>
                }
              />
            </div>
          )}

          {/* Información del Sistema */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              Información del Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow
                icon={Clock}
                label="Fecha de Creación"
                value={formatDate(convocatoria.created_at)}
              />
              
              <DetailRow
                icon={Clock}
                label="Última Actualización"
                value={formatDate(convocatoria.updated_at)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
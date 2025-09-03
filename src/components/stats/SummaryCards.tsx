import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, BarChart3 } from "lucide-react";

interface SummaryCardsProps {
  totalConvocatorias: number;
  cumplimosRequisitos: number;
  convocatoriasAbiertas: number;
  sectoresUnicos: number;
  entidadesUnicas: number;
}

export default function SummaryCards({
  totalConvocatorias,
  cumplimosRequisitos,
  convocatoriasAbiertas,
  sectoresUnicos,
  entidadesUnicas
}: SummaryCardsProps) {
  const porcentajeCumplimos = totalConvocatorias > 0 
    ? (cumplimosRequisitos / totalConvocatorias) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cumplimiento de Requisitos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Cumplimiento de Requisitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cumplimos requisitos:</span>
              <Badge variant="default" className="bg-success text-success-foreground">
                {cumplimosRequisitos} ({porcentajeCumplimos.toFixed(1)}%)
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">No cumplimos requisitos:</span>
              <Badge variant="secondary">
                {totalConvocatorias - cumplimosRequisitos} ({(100 - porcentajeCumplimos).toFixed(1)}%)
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso</span>
                <span>{porcentajeCumplimos.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-success h-3 rounded-full transition-all duration-700 flex items-center justify-end pr-1"
                  style={{ width: `${porcentajeCumplimos}%` }}
                >
                  {porcentajeCumplimos > 15 && (
                    <CheckCircle className="h-2 w-2 text-success-foreground" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{convocatoriasAbiertas}</div>
                <div className="text-xs text-muted-foreground">Activas</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{totalConvocatorias}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sectores únicos:</span>
                <Badge variant="outline">{sectoresUnicos}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entidades únicas:</span>
                <Badge variant="outline">{entidadesUnicas}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasa de éxito:</span>
                <Badge 
                  variant={porcentajeCumplimos >= 50 ? "default" : "secondary"}
                  className={porcentajeCumplimos >= 50 ? "bg-success text-success-foreground" : ""}
                >
                  {porcentajeCumplimos.toFixed(0)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
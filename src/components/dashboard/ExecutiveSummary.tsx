import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; 
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Calendar, Target, Award } from "lucide-react";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  fecha_limite_aplicacion: string | null;
  valor: number | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  cumplimos_requisitos: boolean | null;
  sector_tema: string | null;
  created_at: string;
}

interface ExecutiveSummaryProps {
  convocatorias: Convocatoria[];
}

export default function ExecutiveSummary({ convocatorias }: ExecutiveSummaryProps) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Métricas ejecutivas clave
  const totalConvocatorias = convocatorias.length;
  const activeConvocatorias = convocatorias.filter(c => c.estado_convocatoria === "Abierta").length;
  const eligibleConvocatorias = convocatorias.filter(c => c.cumplimos_requisitos).length;
  const submittedConvocatorias = convocatorias.filter(c => c.estado_usm === "Presentada").length;
  
  // Nuevas este mes
  const recentConvocatorias = convocatorias.filter(c => 
    new Date(c.created_at) >= thirtyDaysAgo
  ).length;

  // Valor total elegible
  const totalEligibleValue = convocatorias
    .filter(c => c.valor && c.cumplimos_requisitos)
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  // Convocatorias que vencen pronto
  const expiringSoon = convocatorias.filter(c => {
    if (!c.fecha_limite_aplicacion || c.estado_convocatoria !== "Abierta") return false;
    const deadline = new Date(c.fecha_limite_aplicacion);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  // Top sectores
  const sectorCounts = convocatorias
    .filter(c => c.sector_tema && c.cumplimos_requisitos)
    .reduce((acc, c) => {
      const sector = c.sector_tema || "Sin clasificar";
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Tasas clave
  const eligibilityRate = totalConvocatorias > 0 ? (eligibleConvocatorias / totalConvocatorias) * 100 : 0;
  const submissionRate = eligibleConvocatorias > 0 ? (submittedConvocatorias / eligibleConvocatorias) * 100 : 0;
  const activeRate = totalConvocatorias > 0 ? (activeConvocatorias / totalConvocatorias) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getTrendIcon = (rate: number) => {
    if (rate >= 70) return <TrendingUp className="h-4 w-4 text-success" />;
    if (rate >= 40) return <Minus className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-danger" />;
  };

  const getRateColor = (rate: number) => {
    if (rate >= 70) return "text-success";
    if (rate >= 40) return "text-warning";
    return "text-danger";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Resumen Ejecutivo
        </CardTitle>
        <CardDescription>
          Vista estratégica del portafolio de convocatorias
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">{totalConvocatorias}</div>
            <div className="text-xs text-muted-foreground">Total Convocatorias</div>
            {recentConvocatorias > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{recentConvocatorias} este mes
              </Badge>
            )}
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-success">{eligibleConvocatorias}</div>
            <div className="text-xs text-muted-foreground">Cumplimos Requisitos</div>
            <div className={`text-xs font-medium ${getRateColor(eligibilityRate)}`}>
              {eligibilityRate.toFixed(0)}% elegibles
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-warning">{activeConvocatorias}</div>
            <div className="text-xs text-muted-foreground">Activas</div>
            <div className={`text-xs font-medium ${getRateColor(activeRate)}`}>
              {activeRate.toFixed(0)}% del total
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">{submittedConvocatorias}</div>
            <div className="text-xs text-muted-foreground">Presentadas</div>
            <div className={`text-xs font-medium ${getRateColor(submissionRate)}`}>
              {submissionRate.toFixed(0)}% conversión
            </div>
          </div>
        </div>

        {/* Valor elegible y vencimientos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Valor Elegible Total</span>
              <Target className="h-4 w-4 text-success" />
            </div>
            <div className="text-xl font-bold text-success">
              {formatCurrency(totalEligibleValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              En {eligibleConvocatorias} convocatorias que cumplimos requisitos
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vencimientos Próximos</span>
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <div className="text-xl font-bold text-warning">
              {expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground">
              Convocatorias que vencen en próximos 30 días
            </p>
          </div>
        </div>

        {/* Indicadores de rendimiento */}
        <div className="space-y-4">
          <h4 className="font-medium">Indicadores de Rendimiento</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Tasa de Elegibilidad</span>
                {getTrendIcon(eligibilityRate)}
              </div>
              <span className={`text-sm font-medium ${getRateColor(eligibilityRate)}`}>
                {eligibilityRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={eligibilityRate} className="h-2" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Tasa de Presentación</span>
                {getTrendIcon(submissionRate)}
              </div>
              <span className={`text-sm font-medium ${getRateColor(submissionRate)}`}>
                {submissionRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={submissionRate} className="h-2" />
          </div>
        </div>

        {/* Top sectores */}
        {topSectors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Sectores Principales (Elegibles)</h4>
            <div className="space-y-2">
              {topSectors.map(([sector, count]) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{sector}</span>
                  <Badge variant="outline" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-primary">Recomendaciones Estratégicas</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            {eligibilityRate < 50 && (
              <p>• Revisar criterios de preselección para mejorar tasa de elegibilidad</p>
            )}
            {submissionRate < 60 && eligibleConvocatorias > 0 && (
              <p>• Optimizar proceso de preparación y presentación</p>
            )}
            {expiringSoon > 5 && (
              <p>• Priorizar revisión de {expiringSoon} convocatorias con vencimiento próximo</p>
            )}
            {activeConvocatorias > 0 && submissionRate > 80 && (
              <p>• Excelente tasa de conversión - considerar expandir búsqueda</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
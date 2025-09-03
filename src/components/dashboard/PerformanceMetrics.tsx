import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, TrendingUp, Award } from "lucide-react";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  fecha_limite_aplicacion: string | null;
  valor: number | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  cumplimos_requisitos: boolean | null;
  tipo_moneda: string | null;
}

interface PerformanceMetricsProps {
  convocatorias: Convocatoria[];
}

export default function PerformanceMetrics({ convocatorias }: PerformanceMetricsProps) {
  // Calcular métricas de rendimiento
  const totalValue = convocatorias
    .filter(c => c.valor && c.tipo_moneda === "COP")
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const eligibleValue = convocatorias
    .filter(c => c.valor && c.cumplimos_requisitos && c.tipo_moneda === "COP")
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const activeValue = convocatorias
    .filter(c => c.valor && c.estado_convocatoria === "Abierta" && c.tipo_moneda === "COP")
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const submittedValue = convocatorias
    .filter(c => c.valor && c.estado_usm === "Presentada" && c.tipo_moneda === "COP")
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  // Tasas de conversión
  const totalConvocatorias = convocatorias.length;
  const eligibleCount = convocatorias.filter(c => c.cumplimos_requisitos).length;
  const submittedCount = convocatorias.filter(c => c.estado_usm === "Presentada").length;
  const activeCount = convocatorias.filter(c => c.estado_convocatoria === "Abierta").length;

  const eligibilityRate = totalConvocatorias > 0 ? (eligibleCount / totalConvocatorias) * 100 : 0;
  const submissionRate = eligibleCount > 0 ? (submittedCount / eligibleCount) * 100 : 0;
  const conversionRate = activeCount > 0 ? (submittedCount / activeCount) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const metrics = [
    {
      title: "Valor Total Disponible",
      value: formatCurrency(totalValue),
      subtitle: `${totalConvocatorias} convocatorias`,
      icon: DollarSign,
      color: "primary"
    },
    {
      title: "Valor Elegible",
      value: formatCurrency(eligibleValue),
      subtitle: `${eligibleCount} convocatorias`,
      icon: Target,
      color: "success"
    },
    {
      title: "Valor Activo",
      value: formatCurrency(activeValue),
      subtitle: `${activeCount} abiertas`,
      icon: TrendingUp,
      color: "warning"
    },
    {
      title: "Valor Presentado",
      value: formatCurrency(submittedValue),
      subtitle: `${submittedCount} presentadas`,
      icon: Award,
      color: "success"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "success":
        return "text-success bg-success-light";
      case "warning":
        return "text-warning bg-warning-light";
      case "primary":
        return "text-primary bg-primary/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{metric.title}</p>
                    <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tasas de conversión */}
      <Card>
        <CardHeader>
          <CardTitle>Tasas de Conversión</CardTitle>
          <CardDescription>
            Métricas clave de eficiencia en el proceso de gestión
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasa de Elegibilidad</span>
                <Badge variant="outline">{eligibilityRate.toFixed(1)}%</Badge>
              </div>
              <Progress value={eligibilityRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {eligibleCount} de {totalConvocatorias} convocatorias cumplen requisitos
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasa de Presentación</span>
                <Badge variant="outline">{submissionRate.toFixed(1)}%</Badge>
              </div>
              <Progress value={submissionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {submittedCount} de {eligibleCount} elegibles fueron presentadas
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Conversión de Activas</span>
                <Badge variant="outline">{conversionRate.toFixed(1)}%</Badge>
              </div>
              <Progress value={conversionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {submittedCount} de {activeCount} activas fueron presentadas
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="pt-4 border-t space-y-2">
            <h4 className="font-medium">Insights</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              {eligibilityRate < 50 && (
                <p>• Baja tasa de elegibilidad - revisar criterios de selección</p>
              )}
              {submissionRate < 70 && eligibleCount > 0 && (
                <p>• Oportunidad de mejora en tasa de presentación</p>
              )}
              {totalValue > 0 && (
                <p>• ROI potencial: {((eligibleValue / totalValue) * 100).toFixed(1)}% del valor total es elegible</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
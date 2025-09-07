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
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-muted p-2 rounded">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-playfair">Métricas de Rendimiento</h3>
        </div>
        <p className="text-sm text-muted-foreground font-inter">
          Análisis financiero y tasas de conversión
        </p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className="border border-border hover:bg-accent p-3 sm:p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded ${getColorClasses(metric.color)}`}>
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-lg font-bold font-playfair">{metric.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate font-inter">{metric.title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-inter">{metric.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tasas de conversión */}
        <div className="border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-lg">
          <div className="mb-4">
            <h4 className="font-bold font-playfair text-base sm:text-lg mb-2">Tasas de Conversión</h4>
            <p className="text-sm text-muted-foreground font-inter">
              Métricas clave de eficiencia en el proceso de gestión
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-inter">Tasa de Elegibilidad</span>
                <div className="bg-muted px-2 py-1 rounded">
                  <span className="text-xs font-bold">{eligibilityRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="bg-muted h-2 rounded-full overflow-hidden border-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                  style={{ width: `${eligibilityRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground font-inter">
                {eligibleCount} de {totalConvocatorias} convocatorias cumplen requisitos
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-inter">Tasa de Presentación</span>
                <div className="bg-muted px-2 py-1 rounded">
                  <span className="text-xs font-bold">{submissionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="bg-muted h-2 rounded-full overflow-hidden border-inner">
                <div 
                  className="h-full bg-gradient-to-r from-success to-success/80 transition-all duration-300"
                  style={{ width: `${submissionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground font-inter">
                {submittedCount} de {eligibleCount} elegibles fueron presentadas
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium font-inter">Conversión de Activas</span>
                <div className="bg-muted px-2 py-1 rounded">
                  <span className="text-xs font-bold">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="bg-muted h-2 rounded-full overflow-hidden border-inner">
                <div 
                  className="h-full bg-gradient-to-r from-warning to-warning/80 transition-all duration-300"
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground font-inter">
                {submittedCount} de {activeCount} activas fueron presentadas
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="pt-4 border-t border-border/20 space-y-2">
            <h4 className="font-medium font-playfair">Insights</h4>
            <div className="space-y-1 text-sm text-muted-foreground font-inter">
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
        </div>
      </div>
    </div>
  );
}
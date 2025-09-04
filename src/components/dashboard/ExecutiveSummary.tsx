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
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="neomorphic-small p-2">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-playfair">Resumen Ejecutivo</h3>
        </div>
        <p className="text-sm text-muted-foreground font-inter">
          Vista estratégica del portafolio de convocatorias
        </p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* KPIs principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="neomorphic-small neomorphic-hover p-3 sm:p-4 text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold text-primary font-playfair">{totalConvocatorias}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-inter">Total Convocatorias</div>
            {recentConvocatorias > 0 && (
              <div className="neomorphic-small px-2 py-1 mt-1">
                <span className="text-[10px] sm:text-xs font-medium">+{recentConvocatorias} este mes</span>
              </div>
            )}
          </div>
          
          <div className="neomorphic-small neomorphic-hover p-3 sm:p-4 text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold text-success font-playfair">{eligibleConvocatorias}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-inter">Cumplimos Requisitos</div>
            <div className={`text-[10px] sm:text-xs font-medium font-inter ${getRateColor(eligibilityRate)}`}>
              {eligibilityRate.toFixed(0)}% elegibles
            </div>
          </div>
          
          <div className="neomorphic-small neomorphic-hover p-3 sm:p-4 text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold text-warning font-playfair">{activeConvocatorias}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-inter">Activas</div>
            <div className={`text-[10px] sm:text-xs font-medium font-inter ${getRateColor(activeRate)}`}>
              {activeRate.toFixed(0)}% del total
            </div>
          </div>
          
          <div className="neomorphic-small neomorphic-hover p-3 sm:p-4 text-center space-y-1">
            <div className="text-lg sm:text-2xl font-bold text-primary font-playfair">{submittedConvocatorias}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground font-inter">Presentadas</div>
            <div className={`text-[10px] sm:text-xs font-medium font-inter ${getRateColor(submissionRate)}`}>
              {submissionRate.toFixed(0)}% conversión
            </div>
          </div>
        </div>

        {/* Valor elegible y vencimientos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="neomorphic-small neomorphic-hover p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium font-inter">Valor Elegible Total</span>
              <Target className="h-4 w-4 text-success" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-success font-playfair">
              {formatCurrency(totalEligibleValue)}
            </div>
            <p className="text-xs text-muted-foreground font-inter">
              En {eligibleConvocatorias} convocatorias que cumplimos requisitos
            </p>
          </div>

          <div className="neomorphic-small neomorphic-hover p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium font-inter">Vencimientos Próximos</span>
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-warning font-playfair">
              {expiringSoon}
            </div>
            <p className="text-xs text-muted-foreground font-inter">
              Convocatorias que vencen en próximos 30 días
            </p>
          </div>
        </div>

        {/* Indicadores de rendimiento */}
        <div className="neomorphic-small p-4 space-y-4">
          <h4 className="font-medium font-playfair">Indicadores de Rendimiento</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-inter">Tasa de Elegibilidad</span>
                {getTrendIcon(eligibilityRate)}
              </div>
              <span className={`text-sm font-medium font-inter ${getRateColor(eligibilityRate)}`}>
                {eligibilityRate.toFixed(1)}%
              </span>
            </div>
            <div className="neomorphic-inset h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                style={{ width: `${eligibilityRate}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-inter">Tasa de Presentación</span>
                {getTrendIcon(submissionRate)}
              </div>
              <span className={`text-sm font-medium font-inter ${getRateColor(submissionRate)}`}>
                {submissionRate.toFixed(1)}%
              </span>
            </div>
            <div className="neomorphic-inset h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-success/80 transition-all duration-300"
                style={{ width: `${submissionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Top sectores */}
        {topSectors.length > 0 && (
          <div className="neomorphic-small p-4 space-y-3">
            <h4 className="font-medium font-playfair">Sectores Principales (Elegibles)</h4>
            <div className="space-y-2">
              {topSectors.map(([sector, count]) => (
                <div key={sector} className="neomorphic-small neomorphic-hover p-2 flex items-center justify-between">
                  <span className="text-sm truncate flex-1 font-inter">{sector}</span>
                  <div className="neomorphic-small px-2 py-1">
                    <span className="text-xs font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        <div className="neomorphic-small p-4 space-y-2 border-t-2 border-primary/20">
          <h4 className="font-medium text-primary font-playfair">Recomendaciones Estratégicas</h4>
          <div className="space-y-1 text-sm text-muted-foreground font-inter">
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
      </div>
    </div>
  );
}
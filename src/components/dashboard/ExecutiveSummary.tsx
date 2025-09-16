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
      <div className="mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-light mb-2">Resumen Ejecutivo</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Métricas clave del sistema
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-light text-foreground mb-1">{totalConvocatorias}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
          {recentConvocatorias > 0 && (
            <div className="text-xs text-muted-foreground mt-1">+{recentConvocatorias} este mes</div>
          )}
        </div>
        
        <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/20 flex items-center justify-center">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-light text-foreground mb-1">{eligibleConvocatorias}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Elegibles</div>
          <div className="text-xs text-muted-foreground mt-1">
            {eligibilityRate.toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-light text-foreground mb-1">{activeConvocatorias}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Activas</div>
          <div className="text-xs text-muted-foreground mt-1">
            {activeRate.toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {getTrendIcon(submissionRate)}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-light text-foreground mb-1">{submittedConvocatorias}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Presentadas</div>
          <div className={`text-xs mt-1 ${getRateColor(submissionRate)}`}>
            {submissionRate.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success/20 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Valor Elegible</div>
              <div className="text-lg sm:text-xl font-light">{formatCurrency(totalEligibleValue)}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            En {eligibleConvocatorias} convocatorias elegibles
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-danger/20 flex items-center justify-center mr-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Próximos Vencimientos</div>
              <div className="text-lg sm:text-xl font-light">{expiringSoon}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            En los próximos 30 días
          </div>
        </div>
      </div>
    </div>
  );
}
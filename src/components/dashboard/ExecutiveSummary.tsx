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
    <div className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-light mb-2">Resumen Ejecutivo</h3>
        <p className="text-muted-foreground">
          Métricas clave del sistema
        </p>
      </div>
      
      <div className="grid grid-cols-4 gap-8 mb-8">
        <div className="text-center">
          <div className="text-2xl font-light text-foreground mb-1">{totalConvocatorias}</div>
          <div className="text-sm text-muted-foreground">Total</div>
          {recentConvocatorias > 0 && (
            <div className="text-xs text-muted-foreground mt-1">+{recentConvocatorias} este mes</div>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-light text-foreground mb-1">{eligibleConvocatorias}</div>
          <div className="text-sm text-muted-foreground">Elegibles</div>
          <div className="text-xs text-muted-foreground mt-1">
            {eligibilityRate.toFixed(0)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-light text-foreground mb-1">{activeConvocatorias}</div>
          <div className="text-sm text-muted-foreground">Activas</div>
          <div className="text-xs text-muted-foreground mt-1">
            {activeRate.toFixed(0)}%
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-light text-foreground mb-1">{submittedConvocatorias}</div>
          <div className="text-sm text-muted-foreground">Presentadas</div>
          <div className="text-xs text-muted-foreground mt-1">
            {submissionRate.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Valor Elegible</div>
          <div className="text-xl font-light">{formatCurrency(totalEligibleValue)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            En {eligibleConvocatorias} convocatorias elegibles
          </div>
        </div>

        <div className="border border-border/50 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Próximos Vencimientos</div>
          <div className="text-xl font-light">{expiringSoon}</div>
          <div className="text-xs text-muted-foreground mt-1">
            En los próximos 30 días
          </div>
        </div>
      </div>
    </div>
  );
}
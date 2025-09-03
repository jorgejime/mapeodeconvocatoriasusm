import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  Legend
} from "recharts";
import { 
  Building2,
  TrendingUp,
  PieChart as PieChartIcon
} from "lucide-react";

interface ChartData {
  porEstado: Array<{ name: string; value: number; color: string }>;
  porSector: Array<{ name: string; value: number }>;
  porMes: Array<{ name: string; convocatorias: number }>;
  porEntidad: Array<{ name: string; value: number }>;
}

interface ChartsGridProps {
  data: ChartData;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--danger))',
  '#8884d8',
  '#82ca9d'
];

export default function ChartsGrid({ data }: ChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribución por Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.porEstado}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {data.porEstado.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'calc(var(--radius) - 2px)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Sectores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Top 10 Sectores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.porSector.map((sector, index) => (
              <div key={sector.name} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-foreground truncate pr-2">
                      {sector.name}
                    </p>
                    <span className="text-sm font-bold text-primary flex-shrink-0">
                      {sector.value}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((sector.value / Math.max(...data.porSector.map(s => s.value))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {data.porSector.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de sectores disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tendencia por Mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Convocatorias por Mes (Últimos 6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.porMes.map((mes, index) => (
              <div key={mes.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-medium text-foreground capitalize">
                      {mes.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {mes.convocatorias}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      convocatorias
                    </span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${Math.min((mes.convocatorias / Math.max(...data.porMes.map(m => m.convocatorias))) * 100, 100)}%` 
                    }}
                  >
                    {mes.convocatorias > 0 && (
                      <span className="text-xs font-bold text-primary-foreground">
                        {mes.convocatorias}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {data.porMes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de tendencias disponibles</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Total últimos 6 meses:</span>
                <span className="font-semibold text-foreground">
                  {data.porMes.reduce((sum, mes) => sum + mes.convocatorias, 0)} convocatorias
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Promedio mensual:</span>
                <span className="font-semibold text-foreground">
                  {data.porMes.length > 0 ? Math.round(data.porMes.reduce((sum, mes) => sum + mes.convocatorias, 0) / data.porMes.length) : 0} convocatorias
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Entidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Top 8 Entidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.porEntidad}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'calc(var(--radius) - 2px)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";

interface CurrencyData {
  currency: string;
  total: number;
  count: number;
  average: number;
}

interface CurrencyStatsProps {
  currencyStats: CurrencyData[];
}

const formatCurrency = (value: number, currency: string) => {
  if (currency === 'COP') {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  
  if (currency === 'USD' || currency === 'EUR') {
    if (value >= 1000000) return `${value / 1000000}M`;
    if (value >= 1000) return `${value / 1000}K`;
    return value.toString();
  }
  
  return value.toString();
};

export default function CurrencyStats({ currencyStats }: CurrencyStatsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resumen por Moneda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Valor por Moneda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currencyStats.map((stat) => (
              <div key={stat.currency} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {stat.currency}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {stat.count} convocatorias
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(stat.total, stat.currency)} {stat.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Promedio: {formatCurrency(stat.average, stat.currency)}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((stat.count / Math.max(...currencyStats.map(s => s.count))) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Distribución */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribución por Moneda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currencyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="currency" 
                tick={{ fontSize: 12 }}
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
                formatter={(value, name) => [
                  name === 'count' ? `${value} convocatorias` : `${value} ${name}`,
                  name === 'count' ? 'Cantidad' : 'Total'
                ]}
              />
              <Bar 
                dataKey="count" 
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
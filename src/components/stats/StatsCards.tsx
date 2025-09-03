import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface StatsCardsProps {
  totalConvocatorias: number;
  convocatoriasAbiertas: number;
  proximasVencer: number;
  cumplimosRequisitos: number;
}

export default function StatsCards({ 
  totalConvocatorias, 
  convocatoriasAbiertas, 
  proximasVencer,
  cumplimosRequisitos 
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Convocatorias</CardTitle>
          <FileText className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{totalConvocatorias}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            Registradas en el sistema
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-success">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Convocatorias Abiertas</CardTitle>
          <CheckCircle className="h-5 w-5 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">{convocatoriasAbiertas}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 mr-1" />
            Disponibles para aplicar
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-warning">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Próximas a Vencer</CardTitle>
          <AlertCircle className="h-5 w-5 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-warning">{proximasVencer}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3 mr-1" />
            En los próximos 30 días
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Cumplimos Requisitos</CardTitle>
          <CheckCircle className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{cumplimosRequisitos}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            {totalConvocatorias > 0 ? Math.round((cumplimosRequisitos / totalConvocatorias) * 100) : 0}% del total
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
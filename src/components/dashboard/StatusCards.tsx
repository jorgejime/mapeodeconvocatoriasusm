import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Info, Clock, BarChart3, Archive } from "lucide-react";

interface Convocatoria {
  id: number;
  estado_convocatoria: string | null;
  estado_usm: string | null;
}

interface StatusCardsProps {
  convocatorias: Convocatoria[];
}

export default function StatusCards({ convocatorias }: StatusCardsProps) {
  // Calcular estadísticas de convocatorias
  const total = convocatorias.length;
  const abiertas = convocatorias.filter(c => c.estado_convocatoria?.toLowerCase() === 'abierta').length;
  const cerradas = convocatorias.filter(c => c.estado_convocatoria?.toLowerCase() === 'cerrada').length;

  // Calcular estados internos USM
  const enRevision = convocatorias.filter(c => c.estado_usm?.toLowerCase() === 'en revisión' || c.estado_usm?.toLowerCase() === 'en revision').length;
  const enPreparacion = convocatorias.filter(c => c.estado_usm?.toLowerCase() === 'en preparación' || c.estado_usm?.toLowerCase() === 'en preparacion').length;
  const presentadas = convocatorias.filter(c => c.estado_usm?.toLowerCase() === 'presentada' || c.estado_usm?.toLowerCase() === 'presentadas').length;
  const archivadas = convocatorias.filter(c => c.estado_usm?.toLowerCase() === 'archivada' || c.estado_usm?.toLowerCase() === 'archivadas').length;

  return (
    <div className="space-y-8">
      {/* Estados de Convocatoria */}
      <div>
        <h2 className="text-xl font-medium text-foreground mb-4">Estados de Convocatoria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-3xl font-bold text-foreground">{total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Abiertas</p>
                <p className="text-3xl font-bold text-foreground">{abiertas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cerradas</p>
                <p className="text-3xl font-bold text-foreground">{cerradas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estados Internos USM */}
      <div>
        <h2 className="text-xl font-medium text-foreground mb-4">Estados Internos USM</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">En Revisión</p>
                <p className="text-3xl font-bold text-foreground">{enRevision}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">En Preparación</p>
                <p className="text-3xl font-bold text-foreground">{enPreparacion}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Presentadas</p>
                <p className="text-3xl font-bold text-foreground">{presentadas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Archivadas</p>
                <p className="text-3xl font-bold text-foreground">{archivadas}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center">
                <Archive className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
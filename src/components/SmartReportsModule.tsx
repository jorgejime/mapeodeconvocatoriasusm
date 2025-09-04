import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Brain, Download, FileText, TrendingUp, Clock, Target, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  orden: "Nacional" | "Internacional";
  tipo: string;
  sector_tema: string;
  cumplimos_requisitos: boolean;
  que_nos_falta: string;
  fecha_limite_aplicacion: string;
  estado_convocatoria: "Abierta" | "Cerrada";
  estado_usm: string;
  valor: number;
  tipo_moneda: string;
}

interface SmartReportsModuleProps {
  convocatorias: Convocatoria[];
}

interface AnalisisResultado {
  tasaElegibilidadGeneral: number;
  ventajaComparativa: {
    mejor: string;
    diferencia: number;
    descripcion: string;
  };
  sectorMasExitoso: {
    nombre: string;
    tasa: number;
  };
  convocatoriasVencidas: number[];
  oportunidadesUrgentes: Array<{
    id: number;
    nombre: string;
    monto: string;
    dias: number;
  }>;
  problemasTemporales: {
    titulo: string;
    descripcion: string;
  };
}

const SmartReportsModule: React.FC<SmartReportsModuleProps> = ({ convocatorias }) => {
  const [loading, setLoading] = useState(false);
  const [informe, setInforme] = useState<string>('');
  const [analisis, setAnalisis] = useState<AnalisisResultado | null>(null);
  const [metadatos, setMetadatos] = useState<any>(null);
  const { toast } = useToast();

  const generarInforme = async () => {
    if (!convocatorias || convocatorias.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay convocatorias disponibles para analizar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando solicitud para generar informe inteligente...');
      
      const { data, error } = await supabase.functions.invoke('generate-smart-report', {
        body: { convocatorias }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setInforme(data.informe);
        setAnalisis(data.analisis);
        setMetadatos(data.metadatos);
        
        toast({
          title: "Informe generado",
          description: `Análisis completado para ${data.metadatos.totalConvocatorias} convocatorias`,
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error generando informe:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el informe inteligente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    if (!informe) return;

    // Crear una ventana temporal para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "No se pudo abrir la ventana de impresión. Verifique el bloqueador de ventanas emergentes.",
        variant: "destructive"
      });
      return;
    }

    // Escribir el contenido HTML en la nueva ventana
    printWindow.document.write(informe);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      printWindow.print();
      
      // Cerrar la ventana después de la impresión
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };

    toast({
      title: "Generando PDF",
      description: "Se abrirá el diálogo de impresión para guardar como PDF",
    });
  };

  const renderResumenEjecutivo = () => {
    if (!analisis) return null;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Elegibilidad General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {analisis.tasaElegibilidadGeneral}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Convocatorias viables
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Ventaja Competitiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {analisis.ventajaComparativa.mejor}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +{analisis.ventajaComparativa.diferencia}% diferencia
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Sector Prometedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-purple-700 truncate">
              {analisis.sectorMasExitoso.nombre || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analisis.sectorMasExitoso.tasa}% éxito
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Oportunidades Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {analisis.oportunidadesUrgentes.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAlertas = () => {
    if (!analisis) return null;

    const alertas = [];
    
    if (analisis.convocatoriasVencidas.length > 0) {
      alertas.push({
        tipo: 'critica',
        titulo: 'Convocatorias Vencidas Detectadas',
        descripcion: `${analisis.convocatoriasVencidas.length} convocatorias marcadas como abiertas están vencidas`,
        icono: AlertCircle,
        color: 'red'
      });
    }

    if (analisis.oportunidadesUrgentes.length > 0) {
      alertas.push({
        tipo: 'urgente',
        titulo: 'Oportunidades de Alta Prioridad',
        descripcion: `${analisis.oportunidadesUrgentes.length} convocatorias elegibles vencen pronto`,
        icono: Clock,
        color: 'orange'
      });
    }

    if (analisis.ventajaComparativa.diferencia > 30) {
      alertas.push({
        tipo: 'oportunidad',
        titulo: 'Ventaja Competitiva Significativa',
        descripcion: `${analisis.ventajaComparativa.diferencia}% mayor éxito en convocatorias ${analisis.ventajaComparativa.mejor.toLowerCase()}es`,
        icono: TrendingUp,
        color: 'green'
      });
    }

    if (alertas.length === 0) return null;

    return (
      <div className="space-y-3">
        {alertas.map((alerta, index) => {
          const Icon = alerta.icono;
          return (
            <Card key={index} className={`border-${alerta.color}-200 bg-${alerta.color}-50/50`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 text-${alerta.color}-600 mt-0.5`} />
                  <div className="flex-1">
                    <h4 className={`font-medium text-${alerta.color}-900`}>
                      {alerta.titulo}
                    </h4>
                    <p className={`text-sm text-${alerta.color}-700 mt-1`}>
                      {alerta.descripcion}
                    </p>
                  </div>
                  <Badge variant={alerta.tipo === 'critica' ? 'destructive' : 'secondary'}>
                    {alerta.tipo.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderOportunidadesUrgentes = () => {
    if (!analisis || analisis.oportunidadesUrgentes.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay oportunidades urgentes en este momento</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {analisis.oportunidadesUrgentes.map((opp, index) => (
          <Card key={opp.id} className="border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">
                    {opp.nombre}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>ID: {opp.id}</span>
                    <span>{opp.monto}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={opp.dias <= 7 ? 'destructive' : 'secondary'}>
                    {opp.dias} días
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Informes Estadísticos Inteligentes
            </CardTitle>
            <CardDescription>
              Análisis automático de patrones, correlaciones y oportunidades ocultas
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generarInforme} 
              disabled={loading || !convocatorias.length}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Informe
                </>
              )}
            </Button>
            {informe && (
              <Button variant="outline" onClick={descargarPDF}>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!informe ? (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Generador de Informes Inteligentes
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Utiliza algoritmos avanzados e IA para identificar patrones ocultos, 
              correlaciones críticas y generar recomendaciones estratégicas automáticas.
            </p>
            <Button 
              onClick={generarInforme} 
              disabled={loading || !convocatorias.length}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Procesando {convocatorias.length} convocatorias...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Generar Análisis Inteligente
                </>
              )}
            </Button>
            {!convocatorias.length && (
              <p className="text-xs text-muted-foreground mt-2">
                No hay datos disponibles para analizar
              </p>
            )}
          </div>
        ) : (
          <Tabs defaultValue="resumen" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="alertas">Alertas</TabsTrigger>
              <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
              <TabsTrigger value="informe">Informe Completo</TabsTrigger>
            </TabsList>

            <TabsContent value="resumen" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Resumen Ejecutivo</h3>
                {renderResumenEjecutivo()}
              </div>
              {metadatos && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📊 {metadatos.totalConvocatorias} convocatorias analizadas</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>📅 {metadatos.fechaGeneracion}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>🔧 Versión {metadatos.version}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alertas" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Alertas y Notificaciones</h3>
                {renderAlertas()}
              </div>
            </TabsContent>

            <TabsContent value="oportunidades" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Oportunidades Urgentes</h3>
                {renderOportunidadesUrgentes()}
              </div>
            </TabsContent>

            <TabsContent value="informe" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Informe Completo</h3>
                  <Button variant="outline" size="sm" onClick={descargarPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: informe }}
                  />
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartReportsModule;
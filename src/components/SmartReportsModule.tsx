import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Brain, Download, FileText, TrendingUp, Clock, Target, BarChart3, ExternalLink } from "lucide-react";
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
  const [formato, setFormato] = useState<'html' | 'texto'>('html');
  const [analisis, setAnalisis] = useState<AnalisisResultado | null>(null);
  const [metadatos, setMetadatos] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('resumen');
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
        body: { convocatorias, formato }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setInforme(data.informe);
        setAnalisis(data.analisis);
        setMetadatos(data.metadatos);
        
        toast({
          title: "🎉 Informe generado",
          description: `Análisis completado para ${data.metadatos.totalConvocatorias} convocatorias en formato ${formato.toUpperCase()}`,
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

  const descargarInforme = () => {
    if (!informe) return;

    if (formato === 'html') {
      const blob = new Blob([informe], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-estadistico-usm-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Informe descargado",
        description: "El informe HTML ha sido descargado exitosamente",
      });
    } else {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "No se pudo abrir la ventana de impresión",
          variant: "destructive"
        });
        return;
      }

      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe Estadístico USM</title>
    <style>
        body { font-family: 'Courier New', monospace; padding: 20px; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body><pre>${informe}</pre></body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const verInformeCompleto = () => {
    if (!informe) return;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      if (formato === 'html') {
        newWindow.document.write(informe);
      } else {
        newWindow.document.write(`
          <html>
            <head>
              <title>Informe Completo - USM</title>
              <style>
                body { font-family: 'Courier New', monospace; padding: 20px; background: #f5f5f5; }
                pre { background: white; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
              </style>
            </head>
            <body><pre>${informe}</pre></body>
          </html>
        `);
      }
      newWindow.document.close();
    }
  };

  const renderResumenEjecutivo = () => {
    if (!analisis) return null;

    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-blue-800">Elegibilidad General</h4>
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {analisis.tasaElegibilidadGeneral}%
            </div>
            <p className="text-sm text-blue-600">Convocatorias viables</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-800">Ventaja Competitiva</h4>
            </div>
            <div className="text-xl font-bold text-green-900 mb-1">
              {analisis.ventajaComparativa.mejor}
            </div>
            <p className="text-sm text-green-600">+{analisis.ventajaComparativa.diferencia}% diferencia</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-purple-800">Sector Prometedor</h4>
            </div>
            <div className="text-sm font-bold text-purple-900 mb-1 truncate">
              {analisis.sectorMasExitoso.nombre || 'N/A'}
            </div>
            <p className="text-sm text-purple-600">{analisis.sectorMasExitoso.tasa}% éxito</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-200 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <h4 className="font-semibold text-orange-800">Urgentes</h4>
            </div>
            <div className="text-2xl font-bold text-orange-900 mb-1">
              {analisis.oportunidadesUrgentes.length}
            </div>
            <p className="text-sm text-orange-600">Requieren atención</p>
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
        titulo: '🚨 Convocatorias Vencidas',
        descripcion: `${analisis.convocatoriasVencidas.length} convocatorias marcadas como abiertas están vencidas`,
        color: 'red'
      });
    }

    if (analisis.oportunidadesUrgentes.length > 0) {
      alertas.push({
        tipo: 'urgente',
        titulo: '⚡ Oportunidades Urgentes',
        descripcion: `${analisis.oportunidadesUrgentes.length} convocatorias elegibles vencen pronto`,
        color: 'orange'
      });
    }

    if (analisis.ventajaComparativa.diferencia > 30) {
      alertas.push({
        tipo: 'oportunidad',
        titulo: '🎯 Ventaja Competitiva',
        descripcion: `${analisis.ventajaComparativa.diferencia}% mayor éxito en ${analisis.ventajaComparativa.mejor.toLowerCase()}`,
        color: 'green'
      });
    }

    if (alertas.length === 0) return null;

    return (
      <div className="space-y-3 mb-6">
        {alertas.map((alerta, index) => (
          <Card key={index} className={`border-l-4 ${
            alerta.color === 'red' ? 'border-l-red-500 bg-red-50' :
            alerta.color === 'orange' ? 'border-l-orange-500 bg-orange-50' :
            'border-l-green-500 bg-green-50'
          } shadow-md hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{alerta.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alerta.descripcion}</p>
                </div>
                <Badge variant="outline" className="text-xs font-medium">
                  {alerta.tipo.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderOportunidadesUrgentes = () => {
    if (!analisis || analisis.oportunidadesUrgentes.length === 0) {
      return (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay oportunidades urgentes en este momento</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {analisis.oportunidadesUrgentes.map((opp) => (
          <Card key={opp.id} className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1 line-clamp-1">
                    {opp.nombre}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>ID: {opp.id}</span>
                    <span>{opp.monto}</span>
                  </div>
                </div>
                <Badge variant={opp.dias <= 7 ? "destructive" : "default"} className="ml-2">
                  {opp.dias} días
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Brain className="h-6 w-6" />
            Informes Inteligentes con IA
          </CardTitle>
          <CardDescription className="text-blue-100">
            Análisis estadístico avanzado y recomendaciones estratégicas automatizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-blue-100">Formato:</label>
              <select 
                value={formato}
                onChange={(e) => setFormato(e.target.value as 'html' | 'texto')}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm backdrop-blur-sm"
              >
                <option value="html" className="text-gray-800">📊 HTML Interactivo</option>
                <option value="texto" className="text-gray-800">📄 Texto Tradicional</option>
              </select>
            </div>
            
            <Button
              onClick={generarInforme}
              disabled={loading || !convocatorias?.length}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              size="sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generar Informe IA
                </>
              )}
            </Button>
            
            {informe && (
              <div className="flex gap-2">
                <Button
                  onClick={descargarInforme}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {formato === 'html' ? 'Descargar HTML' : 'Descargar PDF'}
                </Button>
                <Button
                  onClick={verInformeCompleto}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Completo
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {informe && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {renderAlertas()}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="resumen" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="oportunidades" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Urgentes
                </TabsTrigger>
                <TabsTrigger value="informe" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Métricas Clave</h3>
                    {renderResumenEjecutivo()}
                  </div>
                  
                  {analisis && analisis.problemasTemporales && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          {analisis.problemasTemporales.titulo}
                        </h4>
                        <p className="text-sm text-blue-600">
                          {analisis.problemasTemporales.descripcion}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="oportunidades" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">⚡ Oportunidades que Requieren Atención</h3>
                  {renderOportunidadesUrgentes()}
                </div>
              </TabsContent>

              <TabsContent value="informe" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">📋 Informe Completo</h3>
                    <Badge variant="outline" className="text-xs">
                      Formato: {formato.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {formato === 'html' ? (
                    <Card className="p-0 overflow-hidden shadow-inner">
                      <div 
                        dangerouslySetInnerHTML={{ __html: informe }}
                        className="w-full min-h-[400px]"
                        style={{ background: '#fafafa' }}
                      />
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="p-0">
                        <ScrollArea className="h-96 w-full p-4">
                          <pre className="text-xs leading-relaxed whitespace-pre-wrap text-gray-700 font-mono">
                            {informe}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!informe && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Genera tu Informe Inteligente
            </h3>
            <p className="text-gray-500 mb-4">
              Selecciona el formato y haz clic en "Generar Informe IA" para obtener análisis detallados
            </p>
            <div className="text-sm text-gray-400">
              📊 {convocatorias?.length || 0} convocatorias disponibles para análisis
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartReportsModule;
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

    // Crear una ventana temporal para generar el PDF desde texto
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "No se pudo abrir la ventana de impresión. Verifique el bloqueador de ventanas emergentes.",
        variant: "destructive"
      });
      return;
    }

    // Generar HTML formateado para impresión desde el texto plano
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe Estadístico Institucional - USM</title>
    <style>
        @page {
            margin: 2cm;
            size: A4;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 0;
        }
        
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            padding: 0;
            font-family: inherit;
            font-size: inherit;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <pre>${informe}</pre>
</body>
</html>`;

    // Escribir el contenido en la nueva ventana
    printWindow.document.write(htmlContent);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="neumorphic-card group hover:neumorphic-card-hover transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="neumorphic-icon">
                <Target className="h-4 w-4 text-slate-600" />
              </div>
              <h4 className="executive-subtitle text-sm font-medium text-slate-700">Elegibilidad General</h4>
            </div>
            <div className="metric-value text-3xl text-slate-800 mb-1">
              {analisis.tasaElegibilidadGeneral}%
            </div>
            <p className="executive-body text-xs text-slate-500">
              Convocatorias viables
            </p>
          </div>
        </div>

        <div className="neumorphic-card group hover:neumorphic-card-hover transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="neumorphic-icon">
                <TrendingUp className="h-4 w-4 text-slate-600" />
              </div>
              <h4 className="executive-subtitle text-sm font-medium text-slate-700">Ventaja Competitiva</h4>
            </div>
            <div className="metric-value text-2xl text-slate-800 mb-1">
              {analisis.ventajaComparativa.mejor}
            </div>
            <p className="executive-body text-xs text-slate-500">
              +{analisis.ventajaComparativa.diferencia}% diferencia
            </p>
          </div>
        </div>

        <div className="neumorphic-card group hover:neumorphic-card-hover transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="neumorphic-icon">
                <BarChart3 className="h-4 w-4 text-slate-600" />
              </div>
              <h4 className="executive-subtitle text-sm font-medium text-slate-700">Sector Prometedor</h4>
            </div>
            <div className="metric-value text-sm text-slate-800 mb-1 truncate">
              {analisis.sectorMasExitoso.nombre || 'N/A'}
            </div>
            <p className="executive-body text-xs text-slate-500">
              {analisis.sectorMasExitoso.tasa}% éxito
            </p>
          </div>
        </div>

        <div className="neumorphic-card group hover:neumorphic-card-hover transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="neumorphic-icon">
                <Clock className="h-4 w-4 text-slate-600" />
              </div>
              <h4 className="executive-subtitle text-sm font-medium text-slate-700">Oportunidades Urgentes</h4>
            </div>
            <div className="metric-value text-3xl text-slate-800 mb-1">
              {analisis.oportunidadesUrgentes.length}
            </div>
            <p className="executive-body text-xs text-slate-500">
              Requieren atención inmediata
            </p>
          </div>
        </div>
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
            <div key={index} className="neumorphic-card hover:neumorphic-card-hover transition-all duration-300">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="neumorphic-icon-alert">
                    <Icon className="h-5 w-5 text-slate-600 mt-0.5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="executive-subtitle font-medium text-slate-800">
                      {alerta.titulo}
                    </h4>
                    <p className="executive-body text-sm text-slate-600 mt-1">
                      {alerta.descripcion}
                    </p>
                  </div>
                  <div className="neumorphic-badge">
                    <span className="text-xs font-medium text-slate-700">
                      {alerta.tipo.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderOportunidadesUrgentes = () => {
    if (!analisis || analisis.oportunidadesUrgentes.length === 0) {
      return (
        <div className="neumorphic-card">
          <div className="p-6 text-center text-slate-500">
            <div className="neumorphic-icon-large mx-auto mb-4">
              <Clock className="h-12 w-12 text-slate-400" />
            </div>
            <p className="executive-body text-slate-500">No hay oportunidades urgentes en este momento</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {analisis.oportunidadesUrgentes.map((opp, index) => (
          <div key={opp.id} className="neumorphic-card hover:neumorphic-card-hover transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="executive-subtitle font-medium text-sm mb-1 line-clamp-1 text-slate-800">
                    {opp.nombre}
                  </h4>
                  <div className="executive-body flex items-center gap-4 text-xs text-slate-500">
                    <span>ID: {opp.id}</span>
                    <span>{opp.monto}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`neumorphic-badge ${opp.dias <= 7 ? 'urgent' : ''}`}>
                    <span className="text-xs font-medium text-slate-700">
                      {opp.dias} días
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .neumorphic-card {
          background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
          border-radius: 16px;
          box-shadow: 
            8px 8px 16px #cbd5e1,
            -8px -8px 16px #ffffff;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        
        .neumorphic-card-hover:hover {
          box-shadow: 
            4px 4px 8px #cbd5e1,
            -4px -4px 8px #ffffff;
          transform: translateY(-2px);
        }
        
        .neumorphic-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #e2e8f0, #f1f5f9);
          box-shadow: 
            3px 3px 6px #cbd5e1,
            -3px -3px 6px #ffffff;
        }
        
        .neumorphic-icon-alert {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #e2e8f0, #f1f5f9);
          box-shadow: 
            4px 4px 8px #cbd5e1,
            -4px -4px 8px #ffffff;
        }
        
        .neumorphic-icon-large {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #e2e8f0, #f1f5f9);
          box-shadow: 
            6px 6px 12px #cbd5e1,
            -6px -6px 12px #ffffff;
        }
        
        .neumorphic-badge {
          padding: 6px 12px;
          border-radius: 8px;
          background: linear-gradient(145deg, #f8fafc, #e2e8f0);
          box-shadow: 
            2px 2px 4px #cbd5e1,
            -2px -2px 4px #ffffff;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
        }
        
        .neumorphic-badge.urgent {
          background: linear-gradient(145deg, #fed7d7, #fbb6b6);
          box-shadow: 
            2px 2px 4px #f87171,
            -2px -2px 4px #ffffff;
        }
        
        .neumorphic-main-card {
          background: linear-gradient(145deg, #f8fafc, #e2e8f0);
          border-radius: 20px;
          box-shadow: 
            12px 12px 24px #cbd5e1,
            -12px -12px 24px #ffffff;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        
        .neumorphic-button {
          background: linear-gradient(145deg, #e2e8f0, #f1f5f9);
          border: none;
          border-radius: 12px;
          box-shadow: 
            6px 6px 12px #cbd5e1,
            -6px -6px 12px #ffffff;
          transition: all 0.2s ease;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
        }
        
        .neumorphic-button:hover {
          box-shadow: 
            3px 3px 6px #cbd5e1,
            -3px -3px 6px #ffffff;
          transform: translateY(-1px);
        }
        
        .neumorphic-button:active {
          box-shadow: 
            inset 3px 3px 6px #cbd5e1,
            inset -3px -3px 6px #ffffff;
          transform: translateY(0);
        }
        
        .neumorphic-button.active {
          box-shadow: 
            inset 4px 4px 8px #cbd5e1,
            inset -4px -4px 8px #ffffff;
          background: linear-gradient(145deg, #d1d5db, #e5e7eb);
        }
        
        .executive-title {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }
        
        .executive-subtitle {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          letter-spacing: -0.01em;
        }
        
        .executive-body {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          line-height: 1.6;
        }
        
        .executive-code {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 400;
          line-height: 1.5;
          letter-spacing: 0;
        }
        
        .metric-value {
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          font-feature-settings: 'tnum', 'ss01';
        }
      `}} />
      
      <div className="neumorphic-main-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="neumorphic-icon">
                  <Brain className="h-5 w-5 text-slate-600" />
                </div>
                <h2 className="executive-title text-xl text-slate-800">
                  Informes Estadísticos Inteligentes
                </h2>
              </div>
              <p className="executive-subtitle text-slate-600">
                Análisis automático de patrones, correlaciones y oportunidades ocultas
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generarInforme} 
                disabled={loading || !convocatorias.length}
                className="neumorphic-button px-4 py-2 text-slate-700 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generar Informe
                  </>
                )}
              </button>
              {informe && (
                <button
                  onClick={descargarPDF}
                  className="neumorphic-button px-4 py-2 text-slate-700 font-medium flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {!informe ? (
            <div className="text-center py-12">
              <div className="neumorphic-icon-large mx-auto mb-4">
                <Brain className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="executive-title text-lg text-slate-800">
                Generador de Informes Inteligentes
              </h3>
              <p className="executive-body text-slate-600 mb-6 max-w-md mx-auto">
                Utiliza algoritmos avanzados e IA para identificar patrones ocultos, 
                correlaciones críticas y generar recomendaciones estratégicas automáticas.
              </p>
              <button 
                onClick={generarInforme} 
                disabled={loading || !convocatorias.length}
                className="neumorphic-button px-6 py-3 text-slate-700 font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600" />
                    Procesando {convocatorias.length} convocatorias...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Generar Análisis Inteligente
                  </>
                )}
              </button>
              {!convocatorias.length && (
                <p className="executive-body text-xs text-slate-500 mt-2">
                  No hay datos disponibles para analizar
                </p>
              )}
            </div>
          ) : (
            <div className="w-full">
              <div className="flex w-full mb-6">
                <button 
                  className={`neumorphic-button px-4 py-2 text-sm font-medium flex-1 mr-1 ${activeTab === 'resumen' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resumen')}
                >
                  Resumen
                </button>
                <button 
                  className={`neumorphic-button px-4 py-2 text-sm font-medium flex-1 mx-1 ${activeTab === 'alertas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('alertas')}
                >
                  Alertas
                </button>
                <button 
                  className={`neumorphic-button px-4 py-2 text-sm font-medium flex-1 mx-1 ${activeTab === 'oportunidades' ? 'active' : ''}`}
                  onClick={() => setActiveTab('oportunidades')}
                >
                  Oportunidades
                </button>
                <button 
                  className={`neumorphic-button px-4 py-2 text-sm font-medium flex-1 ml-1 ${activeTab === 'informe' ? 'active' : ''}`}
                  onClick={() => setActiveTab('informe')}
                >
                  Informe Completo
                </button>
              </div>

              <div className="w-full">
                {activeTab === 'resumen' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="executive-title text-lg text-slate-800">Resumen Ejecutivo</h3>
                      {renderResumenEjecutivo()}
                    </div>
                    {metadatos && (
                      <div className="pt-4 border-t border-slate-300">
                      <div className="executive-body flex items-center gap-4 text-sm text-slate-600">
                        <span>📊 {metadatos.totalConvocatorias} convocatorias analizadas</span>
                        <span>•</span>
                        <span>📅 {metadatos.fechaGeneracion}</span>
                        <span>•</span>
                        <span>🔧 Versión {metadatos.version}</span>
                      </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'alertas' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="executive-title text-lg text-slate-800">Alertas y Notificaciones</h3>
                      {renderAlertas()}
                    </div>
                  </div>
                )}

                {activeTab === 'oportunidades' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="executive-title text-lg text-slate-800">Oportunidades Urgentes</h3>
                      {renderOportunidadesUrgentes()}
                    </div>
                  </div>
                )}

                {activeTab === 'informe' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="executive-title text-lg text-slate-800">Informe Completo</h3>
                        <button
                          onClick={descargarPDF}
                          className="neumorphic-button px-4 py-2 text-slate-700 font-medium flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Descargar PDF
                        </button>
                      </div>
                      <div className="neumorphic-card p-6">
                        <div className="h-[600px] overflow-auto">
                          <div className="executive-body text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-inter">
                            {informe}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartReportsModule;
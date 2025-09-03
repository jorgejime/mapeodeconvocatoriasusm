import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BookOpen, 
  Users, 
  Shield, 
  BarChart3, 
  FileText, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Target,
  TrendingUp
} from "lucide-react";

export default function Manual() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Manual de Usuario
        </h1>
        <p className="text-muted-foreground">
          Guía completa para el uso del Sistema de Gestión de Convocatorias USM
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="rectoria">Para Rectoría</TabsTrigger>
          <TabsTrigger value="admin">Para Administradores</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Introducción al Sistema</CardTitle>
              <CardDescription>
                Comprenda el propósito y beneficios del sistema de gestión de convocatorias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">¿Qué es el Sistema?</h3>
                  <p className="text-muted-foreground">
                    El Sistema de Gestión de Convocatorias USM es una plataforma integral diseñada para 
                    centralizar, gestionar y analizar todas las oportunidades de financiamiento y 
                    convocatorias disponibles para la universidad.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Beneficios Clave</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Centralización de información</li>
                    <li>• Seguimiento automatizado de deadlines</li>
                    <li>• Análisis de oportunidades</li>
                    <li>• Reportes ejecutivos detallados</li>
                    <li>• Gestión eficiente de recursos</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Tipos de Usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-success/20 bg-success-light">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-success" />
                        <h4 className="font-medium">Rectoría</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acceso completo para visualización, análisis estratégico y toma de decisiones ejecutivas.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">Administrador</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Acceso total al sistema incluyendo gestión, configuración y administración completa.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Navegación Principal</CardTitle>
              <CardDescription>
                Familiarícese con las secciones principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="font-medium">Dashboard</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Panel ejecutivo con métricas clave, alertas críticas y resumen estratégico.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">Convocatorias</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gestión completa del portafolio de convocatorias con filtros avanzados.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">Estadísticas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Análisis detallado con gráficos y métricas de rendimiento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual para Rectoría */}
        <TabsContent value="rectoria" className="space-y-6">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              Esta sección está diseñada específicamente para usuarios de Rectoría con acceso de visualización y análisis.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Ejecutivo - Vista Rectoría</CardTitle>
              <CardDescription>
                Su centro de comando para monitoreo estratégico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-danger" />
                    Alertas Críticas
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Monitoree situaciones que requieren atención inmediata:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>• Convocatorias que vencen en 7 días</div>
                    <div>• Oportunidades de alto valor (&gt;$100M)</div>
                    <div>• Procesos estancados en revisión</div>
                    <div>• Oportunidades perdidas</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-success" />
                    Resumen Ejecutivo
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    KPIs estratégicos para toma de decisiones:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>• Total de convocatorias gestionadas</div>
                    <div>• Tasa de elegibilidad institucional</div>
                    <div>• Valor total de oportunidades</div>
                    <div>• Tasa de conversión a presentaciones</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Métricas de Rendimiento
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Análisis financiero y de eficiencia:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>• Valor total disponible vs. elegible</div>
                    <div>• ROI potencial de oportunidades</div>
                    <div>• Distribución por monedas</div>
                    <div>• Insights automáticos de mejora</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Convocatorias</CardTitle>
              <CardDescription>
                Cómo interpretar y utilizar la información del portafolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Filtros y Búsqueda Avanzada</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Pasos para análisis efectivo:</strong></p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Use filtros por estado para priorizar acciones</li>
                      <li>Filtre por sector para análisis estratégico</li>
                      <li>Use rangos de valor para oportunidades relevantes</li>
                      <li>Filtre por fechas límite para gestión temporal</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Interpretación de Estados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Badge variant="default">Estados de Convocatoria</Badge>
                      <div className="text-sm space-y-1">
                        <div>• <strong>Abierta:</strong> Disponible para aplicar</div>
                        <div>• <strong>Cerrada:</strong> Ya venció el plazo</div>
                        <div>• <strong>Próxima:</strong> Aún no abre</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">Estados Internos USM</Badge>
                      <div className="text-sm space-y-1">
                        <div>• <strong>En revisión:</strong> Evaluando factibilidad</div>
                        <div>• <strong>En preparación:</strong> Desarrollando propuesta</div>
                        <div>• <strong>Presentada:</strong> Enviada al convocante</div>
                        <div>• <strong>Archivada:</strong> Descartada o finalizada</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas y Reportes</CardTitle>
              <CardDescription>
                Acceso a análisis profundo y generación de reportes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  La sección de Estadísticas está disponible para usuarios de Rectoría con análisis detallados y visualizaciones.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Visualizaciones Disponibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>• Distribución por sectores</div>
                    <div>• Tendencias mensuales</div>
                    <div>• Top entidades convocantes</div>
                    <div>• Análisis por monedas</div>
                    <div>• Métricas de cumplimiento</div>
                    <div>• Tasas de conversión</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Exportación de Datos</h4>
                  <div className="bg-primary/5 p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Formatos disponibles:</strong></p>
                    <div className="space-y-1">
                      <div>• <strong>PDF:</strong> Reportes ejecutivos con gráficos</div>
                      <div>• <strong>Excel:</strong> Datos detallados para análisis adicional</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual para Administradores */}
        <TabsContent value="admin" className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Esta sección cubre todas las funcionalidades administrativas del sistema.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Convocatorias</CardTitle>
              <CardDescription>
                Administración completa del ciclo de vida de convocatorias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-success" />
                    Crear Nueva Convocatoria
                  </h4>
                  <div className="bg-success-light p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Proceso paso a paso:</strong></p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Haga clic en "Nueva Convocatoria" en la página principal</li>
                      <li>Complete los campos obligatorios (nombre, entidad, fecha límite)</li>
                      <li>Seleccione sector, tipo y orden según corresponda</li>
                      <li>Ingrese el valor y moneda</li>
                      <li>Defina si cumplimos requisitos</li>
                      <li>Agregue observaciones y enlaces relevantes</li>
                      <li>Guarde y el sistema asignará estados automáticamente</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" />
                    Editar Convocatorias Existentes
                  </h4>
                  <div className="bg-primary/5 p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Campos editables:</strong></p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>• Información básica</div>
                      <div>• Estados (convocatoria e interno)</div>
                      <div>• Fechas y valores</div>
                      <div>• Observaciones y enlaces</div>
                      <div>• Requisitos y evaluaciones</div>
                      <div>• Categorización temática</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4 text-warning" />
                    Carga Masiva de Datos
                  </h4>
                  <div className="bg-warning-light p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Funcionalidad disponible:</strong></p>
                    <div>• Importación masiva desde archivos Excel</div>
                    <div>• Validación automática de datos</div>
                    <div>• Reporte de errores y conflictos</div>
                    <div>• Proceso de revisión antes de confirmación</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funciones Administrativas Avanzadas</CardTitle>
              <CardDescription>
                Herramientas especializadas para administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Configuración del Sistema
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>Acceso a configuraciones avanzadas del sistema:</p>
                    <div>• Gestión de usuarios y permisos</div>
                    <div>• Configuración de alertas automáticas</div>
                    <div>• Parámetros de exportación</div>
                    <div>• Backup y restauración de datos</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-success" />
                    Análisis Administrativo
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>Herramientas exclusivas para administradores:</p>
                    <div>• Métricas de uso del sistema</div>
                    <div>• Auditoría de cambios</div>
                    <div>• Reportes de rendimiento</div>
                    <div>• Análisis de tendencias históricas</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-danger" />
                    Gestión de Emergencias
                  </h4>
                  <div className="bg-danger-light p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Funciones críticas:</strong></p>
                    <div>• Reset completo de base de datos</div>
                    <div>• Restauración desde backup</div>
                    <div>• Resolución de conflictos de datos</div>
                    <div>• Soporte técnico avanzado</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flujos de Trabajo Recomendados</CardTitle>
              <CardDescription>
                Mejores prácticas para administración eficiente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Workflow Diario</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Revisar alertas críticas en el Dashboard</li>
                      <li>Actualizar estados de convocatorias en proceso</li>
                      <li>Verificar nuevas oportunidades en fuentes externas</li>
                      <li>Responder a solicitudes de información de Rectoría</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Workflow Semanal</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Generar reportes de progreso semanal</li>
                      <li>Revisar convocatorias próximas a vencer</li>
                      <li>Actualizar análisis de sectores estratégicos</li>
                      <li>Backup de seguridad de datos</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Workflow Mensual</h4>
                  <div className="bg-muted/30 p-3 rounded-lg text-sm">
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>Análisis completo de métricas de rendimiento</li>
                      <li>Revisión de estrategias de búsqueda</li>
                      <li>Limpieza y archivo de convocatorias vencidas</li>
                      <li>Presentación de resultados a Rectoría</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funcionalidades */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades del Sistema</CardTitle>
              <CardDescription>
                Descripción detallada de todas las características disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Búsqueda y Filtrado
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>• Búsqueda por texto en nombres y entidades</div>
                    <div>• Filtros por estado de convocatoria</div>
                    <div>• Filtros por estado interno USM</div>
                    <div>• Filtros por sector y tipo</div>
                    <div>• Filtros por rango de valores</div>
                    <div>• Filtros por cumplimiento de requisitos</div>
                    <div>• Filtros por fechas límite</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-success" />
                    Gestión Temporal
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>• Alertas automáticas por vencimiento</div>
                    <div>• Código de colores por urgencia</div>
                    <div>• Cálculo automático de días restantes</div>
                    <div>• Notificaciones de deadlines críticos</div>
                    <div>• Histórico de fechas importantes</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-warning" />
                    Análisis y Reportes
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>• Dashboard ejecutivo interactivo</div>
                    <div>• Gráficos de distribución por sectores</div>
                    <div>• Análisis de tendencias temporales</div>
                    <div>• Métricas de conversión</div>
                    <div>• Análisis financiero por monedas</div>
                    <div>• KPIs automáticos</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Exportación de Datos
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>• Exportación a PDF con diseño profesional</div>
                    <div>• Exportación a Excel con múltiples hojas</div>
                    <div>• Reportes personalizados</div>
                    <div>• Formato automático de monedas</div>
                    <div>• Inclusión de gráficos y estadísticas</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Indicadores de Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-success/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-success text-sm">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        Verde - Más de 30 días
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-warning/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-warning text-sm">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        Amarillo - 1-30 días
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-danger/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 text-danger text-sm">
                        <div className="w-3 h-3 bg-danger rounded-full"></div>
                        Rojo - Vencida o crítica
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Soporte y Contacto</CardTitle>
              <CardDescription>
                Información de contacto para soporte técnico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-center space-y-2">
                  <p className="font-medium">Desarrollado por</p>
                  <p className="text-lg font-bold text-primary">JORGE JIMÉNEZ CALVANO</p>
                  <p className="text-sm text-muted-foreground">Líder de Inteligencia Artificial - USM</p>
                  <p className="text-sm text-primary">jorge@centroeidea.com</p>
                </div>
                <Separator className="my-4" />
                <div className="text-sm text-muted-foreground text-center">
                  <p>Para soporte técnico, reportes de errores o solicitudes de mejoras,</p>
                  <p>contacte al equipo de desarrollo a través de los canales oficiales de la universidad.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
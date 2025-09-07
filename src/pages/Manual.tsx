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
  TrendingUp,
  Brain,
  Zap,
  PieChart,
  LineChart,
  Activity
} from "lucide-react";

export default function Manual() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-light text-foreground mb-2 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          Manual de Usuario
        </h1>
        <p className="text-muted-foreground mb-6">
          Guía del Sistema de Convocatorias USM
        </p>
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Versión:</strong> 3.0 | <strong>Diseño:</strong> Minimalista | <strong>Funciones:</strong> Filtros avanzados y estadísticas
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="rectoria">Rectoría</TabsTrigger>
          <TabsTrigger value="admin">Administración</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="overview" className="space-y-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light mb-4">Sistema de Convocatorias</h2>
              <p className="text-muted-foreground leading-relaxed">
                Plataforma minimalista para gestionar oportunidades de financiamiento universitario. 
                Diseño centrado en la información esencial con filtros avanzados y estadísticas visuales.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Roles de Usuario</h3>
              <div className="grid gap-6">
                <div className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Rectoría</h4>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Dashboard completo</div>
                    <div>Visualización de convocatorias</div>
                    <div>Estadísticas con gráficos</div>
                    <div>Exportación de datos</div>
                  </div>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Administrador</h4>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Gestión completa de convocatorias</div>
                    <div>Carga masiva desde Excel</div>
                    <div>Configuración del sistema</div>
                    <div>Administración de usuarios</div>
                  </div>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Usuario Estándar</h4>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Solo lectura de convocatorias</div>
                    <div>Acceso limitado al dashboard</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Secciones Principales</h3>
            <div className="grid gap-4">
              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Dashboard</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Panel de control con alertas críticas y métricas esenciales.
                </p>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Convocatorias</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gestión de convocatorias con filtros avanzados y vista en tarjetas.
                </p>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Estadísticas</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Análisis visual con layout tipo Bento. Métricas por moneda y estado.
                </p>
              </div>
            </div>

            <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Diseño Minimalista</h4>
              <p className="text-sm text-muted-foreground">
                Interfaz limpia con espacios amplios, enfoque en información esencial y elementos visuales reducidos.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Manual para Rectoría */}
        <TabsContent value="rectoria" className="space-y-8">
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Guía para usuarios con acceso de visualización y análisis de datos.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-light">Dashboard</h2>
            <div className="space-y-4">
              <div className="border border-border/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  Alertas Críticas
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Convocatorias próximas a vencer (30 días)</div>
                  <div>Oportunidades de alto valor disponibles</div>
                  <div>Estados críticos que requieren atención</div>
                  <div>Alertas de cumplimiento de requisitos</div>
                </div>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Resumen Ejecutivo
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Total de convocatorias registradas</div>
                  <div>Convocatorias elegibles (cumplimos requisitos)</div>
                  <div>Porcentaje de elegibilidad general</div>
                  <div>Estado de aplicaciones USM</div>
                </div>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Métricas de Rendimiento
                </h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Convocatorias abiertas disponibles</div>
                  <div>Convocatorias próximas a vencer</div>
                  <div>Sectores únicos identificados</div>
                  <div>Entidades convocantes registradas</div>
                </div>
              </div>
            </div>
          </div>

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
                  <h4 className="font-medium mb-2">Visualizaciones Disponibles (Layout Bento)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>• Total de convocatorias</div>
                    <div>• Convocatorias elegibles</div>
                    <div>• Estado de convocatorias (gráfico de torta)</div>
                    <div>• Top sectores (barras horizontales)</div>
                    <div>• Distribución por moneda</div>
                    <div>• Monto total disponible por moneda (solo abiertas)</div>
                    <div>• Convocatorias abiertas</div>
                    <div>• Próximas a vencer</div>
                    <div>• Sectores únicos</div>
                    <div>• Entidades únicas</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Herramientas Adicionales</h4>
                  <div className="bg-primary/5 p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Funciones disponibles:</strong></p>
                    <div className="space-y-1">
                      <div>• <strong>Visualización Bento:</strong> Layout moderno con métricas organizadas en bloques</div>
                      <div>• <strong>Visualización Bento:</strong> Layout moderno con métricas organizadas en bloques</div>
                      <div>• <strong>Datos en tiempo real:</strong> Actualización automática de todas las métricas</div>
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
                    Sistema de Carga Masiva desde Excel
                  </h4>
                  <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
                    <p className="mb-3 font-medium text-orange-900">Importación masiva de convocatorias:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-800">
                      <div>• <strong>Botón "Carga Masiva":</strong> En la página de convocatorias</div>
                      <div>• <strong>Formato Excel:</strong> Importación de archivos .xlsx</div>
                      <div>• <strong>Validación automática:</strong> El sistema verifica el formato</div>
                      <div>• <strong>Mapeo de columnas:</strong> Coincidencia con campos de BD</div>
                      <div>• <strong>Carga inmediata:</strong> Inserción directa en la base de datos</div>
                      <div>• <strong>Feedback visual:</strong> Confirmación de registros cargados</div>
                    </div>
                    <div className="mt-3 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                      <p className="text-sm text-orange-700">
                        <strong>📝 Proceso:</strong> Clic en "Carga Masiva" → Seleccionar archivo Excel → Confirmar carga → Verificar convocatorias nuevas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sección de Configuración</CardTitle>
              <CardDescription>
                Panel completo de administración disponible en el menú "Configuración"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Configuraciones Generales
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>Panel de configuración del sistema:</p>
                    <div>• Nombre del Sistema y descripción</div>
                    <div>• Tamaño máximo de archivos</div>
                    <div>• Permitir/prohibir registro de usuarios</div>
                    <div>• Modo mantenimiento</div>
                    <div>• Notificaciones del sistema por email</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-success" />
                    Gestión de Usuarios
                  </h4>
                  <div className="text-sm space-y-2">
                    <p>Administración completa de usuarios:</p>
                    <div>• Tabla con todos los usuarios registrados</div>
                    <div>• Editar perfiles de usuario</div>
                    <div>• Eliminar usuarios (excepto admin)</div>
                    <div>• Gestión de roles y permisos</div>
                    <div>• Crear nuevos usuarios (funcionalidad en desarrollo)</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-warning" />
                    Backup y Mantenimiento
                  </h4>
                  <div className="bg-warning/10 p-3 rounded-lg text-sm">
                    <p className="mb-2"><strong>Herramientas de base de datos:</strong></p>
                    <div>• Exportar Backup completo (formato JSON)</div>
                    <div>• Estadísticas de BD (total convocatorias)</div>
                    <div>• Reset completo de base de datos</div>
                    <div>• Fecha del último backup realizado</div>
                    <div>• Importar datos (funcionalidad futura)</div>
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
                    Sistema Avanzado de Filtrado Inteligente
                  </h3>
                  <div className="border border-border bg-card p-4 space-y-3 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-2 text-blue-800">Filtros Básicos:</h5>
                        <div className="space-y-1 text-slate-600">
                          <div>• <strong>Búsqueda global:</strong> Nombres, entidades, sectores</div>
                          <div>• <strong>Estados:</strong> Convocatoria e interno USM</div>
                          <div>• <strong>Requisitos:</strong> Cumplimos/No/Pendiente</div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-green-800">Filtros Avanzados:</h5>
                        <div className="space-y-1 text-slate-600">
                          <div>• <strong>Rango valores:</strong> Mínimo y máximo</div>
                          <div>• <strong>Fechas límite:</strong> Desde/hasta con calendario</div>
                          <div>• <strong>Entidades:</strong> Multi-selección de organizaciones</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-sm text-purple-800">
                        <strong>🚀 Función Urgencia:</strong> Filtra automáticamente convocatorias que vencen en los próximos 30 días para gestión prioritaria.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-success" />
                    Sistema de Visualización Inteligente
                  </h3>
                  <div className="border border-border bg-card p-4 space-y-3 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-green-800">Vista de Tarjetas (Principal):</h5>
                        <div className="space-y-1 text-sm text-slate-600">
                          <div>• <strong>Diseño responsive:</strong> 1-3 columnas según pantalla</div>
                          <div>• <strong>Información destacada:</strong> Valor, estado, fecha límite</div>
                          <div>• <strong>Badges inteligentes:</strong> Estados visuales dinámicos</div>
                          <div>• <strong>Click para detalle:</strong> Vista completa emergente</div>
                        </div>
                      </div>
                       <div>
                         <h5 className="font-medium mb-2 text-orange-800">Sistema de Alertas:</h5>
                         <div className="space-y-1 text-sm text-slate-600">
                           <div>• <strong>🔴 Crítico:</strong> Vence en ≤ 7 días</div>
                           <div>• <strong>🟡 Urgente:</strong> Vence en ≤ 30 días</div>
                           <div>• <strong>🟢 Normal:</strong> Vence en &gt; 30 días</div>
                           <div>• <strong>⚫ Vencida:</strong> Fecha superada</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h3 className="font-semibold text-lg flex items-center gap-2">
                     <DollarSign className="h-5 w-5 text-warning" />
                     Gestión Temporal Inteligente
                   </h3>
                   <div className="space-y-2 text-sm">
                     <div>• Cálculo automático de días restantes</div>
                     <div>• Notificaciones de deadlines críticos</div>
                     <div>• Histórico de fechas importantes</div>
                     <div>• Alertas automáticas por vencimiento</div>
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
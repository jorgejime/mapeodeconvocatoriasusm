import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ConvocatoriaForm } from "@/components/ConvocatoriaForm";
import { ConvocatoriaAdvancedFilters, FilterState } from "@/components/ConvocatoriaAdvancedFilters";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Download, Copy, EyeOff, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { ConvocatoriaDetailDialog } from "@/components/ConvocatoriaDetailDialog";

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  orden: string | null;
  tipo: string | null;
  valor: number | null;
  tipo_moneda: string | null;
  sector_tema: string | null;
  componentes_transversales: string | null;
  cumplimos_requisitos: boolean | null;
  que_nos_falta: string | null;
  fecha_limite_aplicacion: string | null;
  link_convocatoria: string | null;
  estado_convocatoria: string | null;
  estado_usm: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}


export default function Convocatorias() {
  console.log("Convocatorias: Rendering convocatorias page");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    busqueda: "",
    estadoConvocatoria: [],
    estadoUSM: [],
    cumpleRequisitos: "todos",
    valorMinimo: "",
    valorMaximo: "",
    entidades: [],
    fechaLimiteDesde: null,
    fechaLimiteHasta: null,
    urgencia: "",
  });
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailConvocatoria, setDetailConvocatoria] = useState<Convocatoria | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "clone">("create");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Get user info and role
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { canManage } = useUserRole(user);

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  useEffect(() => {
    applyAdvancedFilters();
  }, [convocatorias, advancedFilters]);

  const fetchConvocatorias = async () => {
    try {
      const { data, error } = await supabase
        .from("convocatorias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConvocatorias(data || []);
    } catch (error) {
      console.error("Error fetching convocatorias:", error);
      toast({
        title: "Error",
        description: "Error al cargar las convocatorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyAdvancedFilters = () => {
    let filtered = convocatorias;

    // Filtro por búsqueda de texto
    if (advancedFilters.busqueda) {
      const searchLower = advancedFilters.busqueda.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nombre_convocatoria.toLowerCase().includes(searchLower) ||
          c.entidad.toLowerCase().includes(searchLower) ||
          (c.sector_tema && c.sector_tema.toLowerCase().includes(searchLower)) ||
          (c.componentes_transversales && c.componentes_transversales.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por estado de convocatoria
    if (advancedFilters.estadoConvocatoria.length > 0) {
      filtered = filtered.filter((c) => 
        advancedFilters.estadoConvocatoria.includes(c.estado_convocatoria || "")
      );
    }

    // Filtro por estado USM
    if (advancedFilters.estadoUSM.length > 0) {
      filtered = filtered.filter((c) => 
        advancedFilters.estadoUSM.includes(c.estado_usm || "")
      );
    }

    // Filtro por cumplimiento de requisitos
    if (advancedFilters.cumpleRequisitos && advancedFilters.cumpleRequisitos !== "todos") {
      if (advancedFilters.cumpleRequisitos === "si") {
        filtered = filtered.filter((c) => c.cumplimos_requisitos === true);
      } else if (advancedFilters.cumpleRequisitos === "no") {
        filtered = filtered.filter((c) => c.cumplimos_requisitos === false);
      } else if (advancedFilters.cumpleRequisitos === "pendiente") {
        filtered = filtered.filter((c) => c.cumplimos_requisitos === null);
      }
    }

    // Filtro por rango de valor
    if (advancedFilters.valorMinimo || advancedFilters.valorMaximo) {
      const minValue = advancedFilters.valorMinimo ? parseFloat(advancedFilters.valorMinimo) : 0;
      const maxValue = advancedFilters.valorMaximo ? parseFloat(advancedFilters.valorMaximo) : Infinity;
      
      filtered = filtered.filter((c) => {
        if (c.valor === null) return false;
        return c.valor >= minValue && c.valor <= maxValue;
      });
    }

    // Filtro por entidades
    if (advancedFilters.entidades.length > 0) {
      filtered = filtered.filter((c) => 
        advancedFilters.entidades.includes(c.entidad)
      );
    }

    // Filtro por fechas límite
    if (advancedFilters.fechaLimiteDesde || advancedFilters.fechaLimiteHasta) {
      filtered = filtered.filter((c) => {
        if (!c.fecha_limite_aplicacion) return false;
        const date = new Date(c.fecha_limite_aplicacion);
        
        if (advancedFilters.fechaLimiteDesde && date < advancedFilters.fechaLimiteDesde) return false;
        if (advancedFilters.fechaLimiteHasta && date > advancedFilters.fechaLimiteHasta) return false;
        
        return true;
      });
    }

    // Filtro por urgencia
    if (advancedFilters.urgencia === "urgentes") {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter((c) => {
        if (!c.fecha_limite_aplicacion) return false;
        const deadline = new Date(c.fecha_limite_aplicacion);
        return deadline >= today && deadline <= thirtyDaysFromNow;
      });
    }

    setFilteredConvocatorias(filtered);
  };

  // Obtener entidades únicas disponibles
  const getAvailableEntidades = (): string[] => {
    const entidades = Array.from(new Set(convocatorias.map(c => c.entidad)))
      .filter(entidad => entidad && entidad.trim() !== "")
      .sort();
    return entidades;
  };

  // Contar filtros activos
  const getActiveFiltersCount = (): number => {
    let count = 0;
    
    if (advancedFilters.busqueda) count++;
    if (advancedFilters.estadoConvocatoria.length > 0) count++;
    if (advancedFilters.estadoUSM.length > 0) count++;
    if (advancedFilters.cumpleRequisitos && advancedFilters.cumpleRequisitos !== "todos") count++;
    if (advancedFilters.valorMinimo) count++;
    if (advancedFilters.valorMaximo) count++;
    if (advancedFilters.entidades.length > 0) count++;
    if (advancedFilters.fechaLimiteDesde) count++;
    if (advancedFilters.fechaLimiteHasta) count++;
    if (advancedFilters.urgencia) count++;
    
    return count;
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setAdvancedFilters({
      busqueda: "",
      estadoConvocatoria: [],
      estadoUSM: [],
      cumpleRequisitos: "todos",
      valorMinimo: "",
      valorMaximo: "",
      entidades: [],
      fechaLimiteDesde: null,
      fechaLimiteHasta: null,
      urgencia: "",
    });
  };

  const handleCreate = () => {
    setSelectedConvocatoria(null);
    setFormMode("create");
    setShowForm(true);
  };

  const handleEdit = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleClone = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria({ ...convocatoria, id: 0 });
    setFormMode("clone");
    setShowForm(true);
  };

  const handleViewDetail = (convocatoria: Convocatoria) => {
    setDetailConvocatoria(convocatoria);
    setShowDetailDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta convocatoria?")) return;

    try {
      const { error } = await supabase
        .from("convocatorias")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Convocatoria eliminada correctamente",
      });
      fetchConvocatorias();
    } catch (error) {
      console.error("Error deleting convocatoria:", error);
      toast({
        title: "Error",
        description: "Error al eliminar la convocatoria",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const csvData = filteredConvocatorias.map((c) => ({
      ID: c.id,
      Nombre: c.nombre_convocatoria,
      Entidad: c.entidad,
      Orden: c.orden || "",
      Tipo: c.tipo || "",
      Valor: c.valor || "",
      Moneda: c.tipo_moneda || "",
      Sector: c.sector_tema || "",
      Componentes: c.componentes_transversales || "",
      "Cumplimos Requisitos": c.cumplimos_requisitos ? "Sí" : "No",
      "Qué nos falta": c.que_nos_falta || "",
      "Fecha Límite": c.fecha_limite_aplicacion || "",
      "Estado Convocatoria": c.estado_convocatoria || "",
      "Estado USM": c.estado_usm || "",
      Observaciones: c.observaciones || "",
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `convocatorias-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (fechaLimite: string | null): "verde" | "amarillo" | "rojo" => {
    if (!fechaLimite) return "rojo";
    
    const today = new Date();
    const deadline = new Date(fechaLimite);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return "verde";
    if (diffDays > 0) return "amarillo";
    return "rojo";
  };

  const getStatusText = (fechaLimite: string | null): string => {
    if (!fechaLimite) return "Sin fecha";
    
    const today = new Date();
    const deadline = new Date(fechaLimite);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return `${diffDays}d`;
    if (diffDays > 0) return `${diffDays}d`;
    if (diffDays === 0) return "Hoy";
    return `${Math.abs(diffDays)}d atr.`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header Section - Improved responsive design */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Convocatorias</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
            {canManage ? "Gestiona todas las convocatorias del sistema" : "Consulta y filtra las convocatorias disponibles"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto hover-scale">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
          {canManage && (
            <>
              <Button onClick={() => setShowBulkUpload(true)} variant="outline" className="w-full sm:w-auto hover-scale">
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Carga Masiva</span>
                <span className="sm:hidden">Carga</span>
              </Button>
              <Button onClick={handleCreate} className="w-full sm:w-auto hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Convocatoria</span>
                <span className="sm:hidden">Nueva</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sistema de filtros avanzado */}
      <Card className="shadow-sm border-border/50 animate-scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Sistema de Filtrado Avanzado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConvocatoriaAdvancedFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            availableEntidades={getAvailableEntidades()}
            onClearFilters={clearAllFilters}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </CardContent>
      </Card>

      {/* Results - Enhanced responsive table */}
      <Card className="shadow-sm border-border/50 animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {filteredConvocatorias.length}
            </span>
            Resultados
          </CardTitle>
          {filteredConvocatorias.length > 0 && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {filteredConvocatorias.length} de {convocatorias.length}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4">
          {/* Grid Card View - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredConvocatorias.map((convocatoria) => (
              <Card 
                key={convocatoria.id} 
                className="h-fit hover:shadow-md transition-all duration-200 border-border/50 hover:border-border cursor-pointer group"
                onClick={() => handleViewDetail(convocatoria)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm font-semibold line-clamp-2 leading-5">
                      {convocatoria.nombre_convocatoria}
                    </CardTitle>
                    {convocatoria.valor && (
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-primary">
                          {convocatoria.tipo_moneda} ${convocatoria.valor.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {convocatoria.entidad}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-3 pb-3">
                  {/* Estado y Tipo */}
                  <div className="flex flex-wrap gap-1">
                    {convocatoria.estado_convocatoria && (
                      <Badge 
                        variant={convocatoria.estado_convocatoria === "Abierta" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {convocatoria.estado_convocatoria}
                      </Badge>
                    )}
                    {convocatoria.tipo && (
                      <Badge variant="outline" className="text-xs">
                        {convocatoria.tipo}
                      </Badge>
                    )}
                    {convocatoria.orden && (
                      <Badge variant="secondary" className="text-xs">
                        {convocatoria.orden}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Fecha límite */}
                  {convocatoria.fecha_limite_aplicacion && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Fecha límite:</span>
                      <StatusBadge status={getStatusColor(convocatoria.fecha_limite_aplicacion)}>
                        {new Date(convocatoria.fecha_limite_aplicacion).toLocaleDateString()}
                      </StatusBadge>
                    </div>
                  )}
                  
                  {/* Sector/Tema */}
                  {convocatoria.sector_tema && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Sector: </span>
                      <span className="text-foreground">{convocatoria.sector_tema}</span>
                    </div>
                  )}
                  
                  {/* Componentes transversales */}
                  {convocatoria.componentes_transversales && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Componentes: </span>
                      <span className="text-foreground line-clamp-2">{convocatoria.componentes_transversales}</span>
                    </div>
                  )}
                  
                  {/* Cumplimos requisitos */}
                  {convocatoria.cumplimos_requisitos !== null && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Cumple requisitos:</span>
                      <Badge 
                        variant={convocatoria.cumplimos_requisitos ? "default" : "secondary"}
                        className={`text-xs ${convocatoria.cumplimos_requisitos ? "bg-success text-success-foreground" : ""}`}
                      >
                        {convocatoria.cumplimos_requisitos ? "Sí" : "No"}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Estado USM */}
                  {convocatoria.estado_usm && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Estado USM: </span>
                      <span className="text-foreground">{convocatoria.estado_usm}</span>
                    </div>
                  )}
                  
                  {/* Qué nos falta */}
                  {convocatoria.que_nos_falta && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Qué nos falta: </span>
                      <span className="text-foreground line-clamp-2">{convocatoria.que_nos_falta}</span>
                    </div>
                  )}
                  
                  {/* Link de convocatoria */}
                  {convocatoria.link_convocatoria && (
                    <div className="text-xs">
                      <a 
                        href={convocatoria.link_convocatoria}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <span>Ver convocatoria</span>
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                        </svg>
                      </a>
                    </div>
                  )}
                </CardContent>
                
                {/* Botones de acción */}
                {canManage && (
                  <div className="flex gap-1 p-3 pt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(convocatoria);
                      }} 
                      className="flex-1 h-8 hover-scale"
                      title="Editar"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClone(convocatoria);
                      }} 
                      className="flex-1 h-8 hover-scale"
                      title="Clonar"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(convocatoria.id);
                      }} 
                      className="flex-1 h-8 hover-scale text-destructive hover:text-destructive"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredConvocatorias.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron convocatorias</h3>
              <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog - Available for all users */}
      <ConvocatoriaDetailDialog
        convocatoria={detailConvocatoria}
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
      />

      {/* Bulk Upload Dialog */}
      {canManage && (
        <BulkUploadDialog 
          open={showBulkUpload} 
          onOpenChange={setShowBulkUpload}
          onSuccess={() => {
            setShowBulkUpload(false);
            fetchConvocatorias();
          }}
        />
      )}

      {/* Form Dialog - Only show for admins */}
      {canManage && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {formMode === "create" && "Nueva Convocatoria"}
                {formMode === "edit" && "Editar Convocatoria"}
                {formMode === "clone" && "Clonar Convocatoria"}
              </DialogTitle>
              <DialogDescription>
                {formMode === "create" && "Completa el formulario para crear una nueva convocatoria"}
                {formMode === "edit" && "Modifica los datos de la convocatoria"}
                {formMode === "clone" && "Crea una nueva convocatoria basada en esta plantilla"}
              </DialogDescription>
            </DialogHeader>
            
            <ConvocatoriaForm
              convocatoria={selectedConvocatoria}
              mode={formMode}
              onSuccess={() => {
                setShowForm(false);
                fetchConvocatorias();
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
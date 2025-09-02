import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ConvocatoriaForm } from "@/components/ConvocatoriaForm";
import { ConvocatoriaFilters } from "@/components/ConvocatoriaFilters";
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

interface Filters {
  estado: string;
  sector: string;
  orden: string;
  dateFrom: string;
  dateTo: string;
}

export default function Convocatorias() {
  console.log("Convocatorias: Rendering convocatorias page");
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    estado: "all",
    sector: "all",
    orden: "all",
    dateFrom: "",
    dateTo: "",
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

  const isAdmin = user?.email === "admin@usm.edu.co";
  const canManage = isAdmin;

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [convocatorias, searchTerm, filters]);

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

  const applyFilters = () => {
    let filtered = convocatorias;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.nombre_convocatoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.entidad.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Estado filter
    if (filters.estado && filters.estado !== "all") {
      filtered = filtered.filter((c) => c.estado_convocatoria === filters.estado);
    }

    // Sector filter
    if (filters.sector && filters.sector !== "all") {
      filtered = filtered.filter((c) => c.sector_tema === filters.sector);
    }

    // Orden filter
    if (filters.orden && filters.orden !== "all") {
      filtered = filtered.filter((c) => c.orden === filters.orden);
    }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((c) => {
        if (!c.fecha_limite_aplicacion) return false;
        const date = new Date(c.fecha_limite_aplicacion);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && date < fromDate) return false;
        if (toDate && date > toDate) return false;
        return true;
      });
    }

    setFilteredConvocatorias(filtered);
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

      {/* Filters and Search - Enhanced responsive design */}
      <Card className="shadow-sm border-border/50 animate-scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o entidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="outline" size="icon" className="hover-scale self-end sm:self-auto">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <ConvocatoriaFilters filters={filters} onFiltersChange={setFilters} />
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
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {filteredConvocatorias.map((convocatoria) => (
              <div 
                key={convocatoria.id} 
                className="border-b border-border/50 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => handleViewDetail(convocatoria)}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{convocatoria.nombre_convocatoria}</h3>
                      <p className="text-sm text-muted-foreground">{convocatoria.entidad}</p>
                      {convocatoria.tipo && (
                        <Badge variant="outline" className="mt-1 text-xs">{convocatoria.tipo}</Badge>
                      )}
                    </div>
                    {convocatoria.valor && (
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium">
                          {convocatoria.tipo_moneda} ${convocatoria.valor.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {convocatoria.estado_convocatoria && (
                      <Badge variant={convocatoria.estado_convocatoria === "Abierta" ? "default" : "secondary"}>
                        {convocatoria.estado_convocatoria}
                      </Badge>
                    )}
                    {convocatoria.fecha_limite_aplicacion && (
                      <StatusBadge status={getStatusColor(convocatoria.fecha_limite_aplicacion)}>
                        {getStatusText(convocatoria.fecha_limite_aplicacion)}
                      </StatusBadge>
                    )}
                    {convocatoria.cumplimos_requisitos !== null && (
                      <Badge 
                        variant={convocatoria.cumplimos_requisitos ? "default" : "secondary"}
                        className={convocatoria.cumplimos_requisitos ? "bg-success text-success-foreground" : ""}
                      >
                        {convocatoria.cumplimos_requisitos ? "Cumple" : "No cumple"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    {canManage ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(convocatoria);
                          }} 
                          className="hover-scale"
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
                          className="hover-scale"
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
                          className="hover-scale"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Clic para ver detalles</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Entidad</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Fecha Límite</TableHead>
                  <TableHead className="font-semibold">Cumple Req.</TableHead>
                  <TableHead className="font-semibold text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConvocatorias.map((convocatoria, index) => (
                  <TableRow 
                    key={convocatoria.id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    style={{animationDelay: `${index * 50}ms`}}
                    onClick={() => handleViewDetail(convocatoria)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{convocatoria.nombre_convocatoria}</p>
                        {convocatoria.tipo && (
                          <Badge variant="outline" className="text-xs">{convocatoria.tipo}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{convocatoria.entidad}</TableCell>
                    <TableCell>
                      {convocatoria.valor && (
                        <span className="font-medium">
                          {convocatoria.tipo_moneda} ${convocatoria.valor.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {convocatoria.estado_convocatoria && (
                        <Badge 
                          variant={convocatoria.estado_convocatoria === "Abierta" ? "default" : "secondary"}
                          className="hover-scale"
                        >
                          {convocatoria.estado_convocatoria}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {convocatoria.fecha_limite_aplicacion && (
                        <StatusBadge status={getStatusColor(convocatoria.fecha_limite_aplicacion)} className="hover-scale">
                          {getStatusText(convocatoria.fecha_limite_aplicacion)}
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {convocatoria.cumplimos_requisitos !== null && (
                        <Badge 
                          variant={convocatoria.cumplimos_requisitos ? "default" : "secondary"}
                          className={`hover-scale ${convocatoria.cumplimos_requisitos ? "bg-success text-success-foreground" : ""}`}
                        >
                          {convocatoria.cumplimos_requisitos ? "Sí" : "No"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        {canManage ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(convocatoria);
                              }} 
                              className="hover-scale"
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
                              className="hover-scale"
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
                              className="hover-scale"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Clic para detalles</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
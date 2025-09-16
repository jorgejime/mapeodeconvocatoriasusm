import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, CalendarIcon, DollarSign, Filter, Search, X, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface FilterState {
  busqueda: string;
  estadoConvocatoria: string[];
  estadoUSM: string[];
  cumpleRequisitos: string;
  valorMinimo: string;
  valorMaximo: string;
  entidades: string[];
  fechaLimiteDesde: Date | null;
  fechaLimiteHasta: Date | null;
  urgencia: string;
}

interface ConvocatoriaAdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableEntidades: string[];
  convocatorias: Array<{
    estado_usm: string | null;
    estado_convocatoria: string | null;
  }>;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const ESTADOS_CONVOCATORIA = [
  { value: "Abierta", label: "Abierta", color: "bg-green-100 text-green-800" },
  { value: "Cerrada", label: "Cerrada", color: "bg-red-100 text-red-800" },
  { value: "Próxima", label: "Próxima", color: "bg-blue-100 text-blue-800" },
];

const ESTADOS_USM = [
  { value: "En revisión", label: "En revisión", color: "bg-blue-100 text-blue-800" },
  { value: "En preparación", label: "En preparación", color: "bg-yellow-100 text-yellow-800" },
  { value: "Presentadas", label: "Presentadas", color: "bg-purple-100 text-purple-800" },
  { value: "Archivadas", label: "Archivadas", color: "bg-gray-100 text-gray-800" },
];

const FILTROS_RAPIDOS = [
  {
    id: "urgentes",
    label: "🔥 Urgentes (vencen en 30 días)",
    icon: AlertTriangle,
    description: "Convocatorias que vencen en los próximos 30 días",
    filters: { urgencia: "urgentes" }
  },
  {
    id: "cumplimos",
    label: "✅ Cumplimos requisitos",
    icon: CheckCircle,
    description: "Solo convocatorias donde cumplimos todos los requisitos",
    filters: { cumpleRequisitos: "si" }
  },
  {
    id: "abiertas-preparacion",
    label: "🚧 En preparación",
    icon: Clock,
    description: "Abiertas y en preparación interna",
    filters: { estadoConvocatoria: ["Abierta"], estadoUSM: ["En preparación"] }
  },
];

export function ConvocatoriaAdvancedFilters({
  filters,
  onFiltersChange,
  availableEntidades,
  convocatorias,
  onClearFilters,
  activeFiltersCount,
}: ConvocatoriaAdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Obtener estados USM dinámicamente de las convocatorias
  const getAvailableEstadosUSM = () => {
    const estadosUnicos = Array.from(new Set(
      convocatorias
        .map(c => c.estado_usm)
        .filter(estado => estado && estado.trim() !== "")
    )).sort();
    
    return estadosUnicos.map(estado => ({
      value: estado!,
      label: estado!,
      color: getEstadoUSMColor(estado!)
    }));
  };

  const getEstadoUSMColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "en revisión":
        return "bg-blue-100 text-blue-800";
      case "en preparación":
        return "bg-yellow-100 text-yellow-800";
      case "presentadas":
        return "bg-purple-100 text-purple-800";
      case "archivadas":
        return "bg-gray-100 text-gray-800";
      case "aprobadas":
        return "bg-green-100 text-green-800";
      case "rechazadas":
        return "bg-red-100 text-red-800";
      case "en evaluación":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const applyQuickFilter = (quickFilter: typeof FILTROS_RAPIDOS[0]) => {
    const newFilters = { ...filters };
    Object.entries(quickFilter.filters).forEach(([key, value]) => {
      if (key === 'estadoConvocatoria' || key === 'estadoUSM') {
        (newFilters as any)[key] = value;
      } else {
        (newFilters as any)[key] = value;
      }
    });
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: keyof FilterState, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      toggleArrayFilter(key, value);
    } else {
      if (key === 'cumpleRequisitos') {
        updateFilter(key, 'todos');
      } else {
        updateFilter(key, key === 'fechaLimiteDesde' || key === 'fechaLimiteHasta' ? null : 
                      Array.isArray(filters[key]) ? [] : '');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar convocatorias por nombre, entidad o palabra clave..."
          value={filters.busqueda}
          onChange={(e) => updateFilter('busqueda', e.target.value)}
          className="pl-10 pr-4 h-12 text-base"
        />
      </div>

      {/* Filtros rápidos */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Filtros rápidos</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FILTROS_RAPIDOS.map((quickFilter) => (
            <Button
              key={quickFilter.id}
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter(quickFilter)}
              className="justify-start h-auto p-3 text-left min-h-[60px] hover:bg-muted transition-colors"
            >
              <quickFilter.icon className="h-4 w-4 mr-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs truncate">{quickFilter.label}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{quickFilter.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Botón para expandir filtros avanzados */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros avanzados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar todo
          </Button>
        )}
      </div>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filtros aplicados</Label>
          <div className="flex flex-wrap gap-2 max-w-full">
            {filters.busqueda && (
              <Badge variant="secondary" className="gap-1 max-w-[200px]">
                <span className="truncate">Búsqueda: "{filters.busqueda}"</span>
                <X 
                  className="h-3 w-3 cursor-pointer flex-shrink-0" 
                  onClick={() => removeFilter('busqueda')}
                />
              </Badge>
            )}
            
            {filters.estadoConvocatoria.map(estado => (
              <Badge key={estado} variant="secondary" className="gap-1">
                <span className="truncate">Estado: {estado}</span>
                <X 
                  className="h-3 w-3 cursor-pointer flex-shrink-0"
                  onClick={() => removeFilter('estadoConvocatoria', estado)}
                />
              </Badge>
            ))}
            
            {filters.estadoUSM.map(estado => (
              <Badge key={estado} variant="secondary" className="gap-1">
                <span className="truncate">USM: {estado}</span>
                <X 
                  className="h-3 w-3 cursor-pointer flex-shrink-0"
                  onClick={() => removeFilter('estadoUSM', estado)} 
                />
              </Badge>
            ))}
            
            {filters.cumpleRequisitos && filters.cumpleRequisitos !== "todos" && (
              <Badge variant="secondary" className="gap-1">
                <span className="truncate">
                  Requisitos: {filters.cumpleRequisitos === 'si' ? 'Cumple' : filters.cumpleRequisitos === 'no' ? 'No cumple' : 'Pendiente'}
                </span>
                <X 
                  className="h-3 w-3 cursor-pointer flex-shrink-0"
                  onClick={() => removeFilter('cumpleRequisitos')}
                />
              </Badge>
            )}
            
            {filters.valorMinimo && (
              <Badge variant="secondary" className="gap-1">
                <span className="truncate">Valor mín: ${parseInt(filters.valorMinimo).toLocaleString()}</span>
                <X 
                  className="h-3 w-3 cursor-pointer flex-shrink-0"
                  onClick={() => removeFilter('valorMinimo')}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filtros avanzados expandibles */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros avanzados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Estado de convocatoria</Label>
                <div className="space-y-2">
                  {ESTADOS_CONVOCATORIA.map(estado => (
                    <label key={estado.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.estadoConvocatoria.includes(estado.value)}
                        onChange={() => toggleArrayFilter('estadoConvocatoria', estado.value)}
                        className="rounded border-gray-300"
                      />
                      <span className={`px-2 py-1 rounded-md text-xs ${estado.color}`}>
                        {estado.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Estado interno USM</Label>
                <div className="space-y-2">
                  {getAvailableEstadosUSM().map(estado => (
                    <label key={estado.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.estadoUSM.includes(estado.value)}
                        onChange={() => toggleArrayFilter('estadoUSM', estado.value)}
                        className="rounded border-gray-300"
                      />
                      <span className={`px-2 py-1 rounded-md text-xs ${estado.color}`}>
                        {estado.label}
                      </span>
                    </label>
                  ))}
                  {getAvailableEstadosUSM().length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay estados USM disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Cumplimiento de requisitos</Label>
              <Select value={filters.cumpleRequisitos} onValueChange={(value) => updateFilter('cumpleRequisitos', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border z-50">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="si">✅ Cumplimos requisitos</SelectItem>
                  <SelectItem value="no">❌ No cumplimos requisitos</SelectItem>
                  <SelectItem value="pendiente">⏳ Pendiente de evaluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Rango de valor */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Rango de valor (COP)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Valor mínimo</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.valorMinimo}
                    onChange={(e) => updateFilter('valorMinimo', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Valor máximo</Label>
                  <Input
                    type="number"
                    placeholder="Sin límite"
                    value={filters.valorMaximo}
                    onChange={(e) => updateFilter('valorMaximo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Entidades */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Entidades</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2 bg-background">
                {availableEntidades.map(entidad => (
                  <label key={entidad} className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.entidades.includes(entidad)}
                      onChange={() => toggleArrayFilter('entidades', entidad)}
                      className="rounded border-gray-300 flex-shrink-0"
                    />
                    <span className="text-sm truncate flex-1">{entidad}</span>
                  </label>
                ))}
                {availableEntidades.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay entidades disponibles
                  </p>
                )}
              </div>
              {filters.entidades.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filters.entidades.map(entidad => (
                    <Badge key={entidad} variant="outline" className="gap-1 max-w-[200px]">
                      <span className="truncate">{entidad}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer flex-shrink-0"
                        onClick={() => removeFilter('entidades', entidad)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Rango de fechas límite */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Fecha límite de aplicación</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.fechaLimiteDesde && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.fechaLimiteDesde ? (
                          format(filters.fechaLimiteDesde, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.fechaLimiteDesde}
                        onSelect={(date) => updateFilter('fechaLimiteDesde', date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.fechaLimiteHasta && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.fechaLimiteHasta ? (
                          format(filters.fechaLimiteHasta, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.fechaLimiteHasta}
                        onSelect={(date) => updateFilter('fechaLimiteHasta', date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
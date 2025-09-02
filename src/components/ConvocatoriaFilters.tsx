import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Filters {
  estado: string;
  sector: string;
  orden: string;
  dateFrom: string;
  dateTo: string;
}

interface ConvocatoriaFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const ConvocatoriaFilters = ({ filters, onFiltersChange }: ConvocatoriaFiltersProps) => {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      estado: "all",
      sector: "all",
      orden: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 p-1">
      <div className="space-y-2">
        <Label className="text-sm font-medium truncate">Estado</Label>
        <Select value={filters.estado} onValueChange={(value) => updateFilter("estado", value)}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent className="bg-popover border z-50">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Abierta">Abierta</SelectItem>
            <SelectItem value="Cerrada">Cerrada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium truncate">Sector/Tema</Label>
        <Select value={filters.sector} onValueChange={(value) => updateFilter("sector", value)}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent className="bg-popover border z-50">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Educación">Educación</SelectItem>
            <SelectItem value="Inclusión Social">Inclusión Social</SelectItem>
            <SelectItem value="Cultura">Cultura</SelectItem>
            <SelectItem value="TIC">TIC</SelectItem>
            <SelectItem value="CT&I+D">CT&I+D</SelectItem>
            <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium truncate">Orden</Label>
        <Select value={filters.orden} onValueChange={(value) => updateFilter("orden", value)}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent className="bg-popover border z-50">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
            <SelectItem value="Nacional">Nacional</SelectItem>
            <SelectItem value="Internacional">Internacional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium truncate">Desde</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter("dateFrom", e.target.value)}
          className="w-full h-10"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium truncate">Hasta</Label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter("dateTo", e.target.value)}
          className="w-full h-10"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium truncate opacity-0">Acciones</Label>
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="w-full h-10 hover:bg-muted text-sm font-medium transition-colors"
          size="sm"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
};
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Estado</Label>
        <Select value={filters.estado} onValueChange={(value) => updateFilter("estado", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Abierta">Abierta</SelectItem>
            <SelectItem value="Cerrada">Cerrada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Sector/Tema</Label>
        <Select value={filters.sector} onValueChange={(value) => updateFilter("sector", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
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
        <Label className="text-sm font-medium">Orden</Label>
        <Select value={filters.orden} onValueChange={(value) => updateFilter("orden", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
            <SelectItem value="Nacional">Nacional</SelectItem>
            <SelectItem value="Internacional">Internacional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Fecha Desde</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => updateFilter("dateFrom", e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label className="text-sm font-medium">Fecha Hasta</Label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => updateFilter("dateTo", e.target.value)}
          className="w-full mb-2"
        />
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="mt-auto hover-scale text-sm"
          size="sm"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
};
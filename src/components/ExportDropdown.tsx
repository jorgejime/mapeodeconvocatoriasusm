import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { exportToPDF, exportToExcel, type ExportData } from "@/lib/exportUtils";
import { toast } from "@/hooks/use-toast";

interface ExportDropdownProps {
  data: ExportData[];
  filename?: string;
  disabled?: boolean;
}

export function ExportDropdown({ data, filename = "convocatorias", disabled = false }: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (data.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      exportToPDF(data, "Convocatorias - Reporte Completo");
      toast({
        title: "Exportación exitosa",
        description: `Archivo PDF generado con ${data.length} registros`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error de exportación",
        description: "No se pudo generar el archivo PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (data.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      exportToExcel(data, "Convocatorias - Base de Datos Completa");
      toast({
        title: "Exportación exitosa",
        description: `Archivo Excel generado con ${data.length} registros`,
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: "Error de exportación",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto hover-scale"
          disabled={disabled || isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {isExporting ? "Exportando..." : "Exportar"}
          </span>
          <span className="sm:hidden">
            {isExporting ? "..." : "Exportar"}
          </span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          <div className="flex flex-col">
            <span className="font-medium">Exportar PDF</span>
            <span className="text-xs text-muted-foreground">
              Reporte profesional
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          <div className="flex flex-col">
            <span className="font-medium">Exportar Excel</span>
            <span className="text-xs text-muted-foreground">
              Datos completos + resumen
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {data.length} registro{data.length !== 1 ? 's' : ''} disponible{data.length !== 1 ? 's' : ''}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
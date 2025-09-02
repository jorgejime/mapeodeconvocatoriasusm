import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UploadResult {
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: any }>;
}

export const BulkUploadDialog = ({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const headers = [
      "nombre_convocatoria",
      "entidad", 
      "orden",
      "tipo",
      "valor",
      "tipo_moneda",
      "sector_tema",
      "componentes_transversales",
      "cumplimos_requisitos",
      "que_nos_falta",
      "fecha_limite_aplicacion",
      "link_convocatoria",
      "estado_convocatoria",
      "estado_usm",
      "observaciones"
    ];

    const exampleRow = [
      "Convocatoria Ejemplo",
      "Entidad Ejemplo",
      "Nacional",
      "Investigación", 
      "1000000",
      "COP",
      "Educación",
      "Infraestructura, Investigación",
      "true",
      "Documentos adicionales",
      "2024-12-31",
      "https://ejemplo.com",
      "Abierta",
      "En revisión",
      "Observaciones ejemplo"
    ];

    const csvContent = [
      headers.join(","),
      exampleRow.join(",")
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_convocatorias.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Plantilla descargada",
      description: "Se ha descargado la plantilla CSV con el formato correcto",
    });
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = { _rowNumber: index + 2 }; // +2 because we skip header and 0-index
      
      headers.forEach((header, i) => {
        let value = values[i] || '';
        
        // Process specific fields
        if (header === 'valor' && value) {
          row[header] = parseFloat(value) || null;
        } else if (header === 'cumplimos_requisitos') {
          row[header] = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'sí';
        } else if (header === 'fecha_limite_aplicacion' && value) {
          // Validate date format
          const date = new Date(value);
          row[header] = !isNaN(date.getTime()) ? value : null;
        } else {
          row[header] = value;
        }
      });
      
      return row;
    });
  };

  const validateRow = (row: any): string[] => {
    const errors: string[] = [];
    
    // Required fields
    if (!row.nombre_convocatoria?.trim()) {
      errors.push("Nombre de convocatoria es requerido");
    }
    if (!row.entidad?.trim()) {
      errors.push("Entidad es requerida");
    }
    
    // Validate catalog values
    const validOrden = ["Local", "Nacional", "Internacional"];
    if (row.orden && !validOrden.includes(row.orden)) {
      errors.push(`Orden debe ser uno de: ${validOrden.join(", ")}`);
    }
    
    const validTipo = ["Investigación", "Fortalecimiento institucional", "Formación", "Movilidad", "Otro", "Varios"];
    if (row.tipo && !validTipo.includes(row.tipo)) {
      errors.push(`Tipo debe ser uno de: ${validTipo.join(", ")}`);
    }
    
    const validMoneda = ["COP", "USD", "EUR", "GBP", "JPY", "CNY", "BRL", "UYU"];
    if (row.tipo_moneda && !validMoneda.includes(row.tipo_moneda)) {
      errors.push(`Moneda debe ser una de: ${validMoneda.join(", ")}`);
    }
    
    const validSector = ["Educación", "Inclusión Social", "Cultura", "TIC", "CT&I+D", "Medio Ambiente", "Otro"];
    if (row.sector_tema && !validSector.includes(row.sector_tema)) {
      errors.push(`Sector debe ser uno de: ${validSector.join(", ")}`);
    }
    
    const validEstadoConv = ["Abierta", "Cerrada"];
    if (row.estado_convocatoria && !validEstadoConv.includes(row.estado_convocatoria)) {
      errors.push(`Estado convocatoria debe ser: ${validEstadoConv.join(" o ")}`);
    }
    
    const validEstadoUSM = ["En revisión", "En preparación", "Presentada", "En subsanación", "Archivada", "Adjudicada", "Rechazada"];
    if (row.estado_usm && !validEstadoUSM.includes(row.estado_usm)) {
      errors.push(`Estado USM debe ser uno de: ${validEstadoUSM.join(", ")}`);
    }
    
    return errors;
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const csvText = await selectedFile.text();
      const data = parseCSV(csvText);
      
      const uploadResult: UploadResult = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = row._rowNumber;
        delete row._rowNumber;
        
        setProgress(((i + 1) / data.length) * 100);
        
        // Validate row
        const validationErrors = validateRow(row);
        if (validationErrors.length > 0) {
          uploadResult.failed++;
          uploadResult.errors.push({
            row: rowNumber,
            error: validationErrors.join("; "),
            data: row
          });
          continue;
        }
        
        // Clean up empty values
        Object.keys(row).forEach(key => {
          if (row[key] === '' || row[key] === null || row[key] === undefined) {
            delete row[key];
          }
        });
        
        try {
          const { error } = await supabase
            .from("convocatorias")
            .insert([row]);
            
          if (error) throw error;
          uploadResult.successful++;
        } catch (error: any) {
          uploadResult.failed++;
          uploadResult.errors.push({
            row: rowNumber,
            error: error.message || "Error desconocido",
            data: row
          });
        }
      }

      setResult(uploadResult);
      
      if (uploadResult.successful > 0) {
        toast({
          title: "Carga completada",
          description: `${uploadResult.successful} registros cargados exitosamente`,
        });
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Error al procesar el archivo: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Formato incorrecto",
          description: "Por favor selecciona un archivo CSV",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
    setUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carga Masiva de Convocatorias
          </DialogTitle>
          <DialogDescription>
            Sube múltiples convocatorias usando un archivo CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Paso 1: Descargar Plantilla
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga la plantilla CSV con el formato correcto para cargar las convocatorias.
              </p>
              <Button onClick={downloadTemplate} variant="outline" className="hover-scale">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla CSV
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Paso 2: Subir Archivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Archivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Procesando...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                  className="hover-scale"
                >
                  {uploading ? "Procesando..." : "Cargar Convocatorias"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {result.failed === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  Resultados de la Carga
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        Exitosos: {result.successful}
                      </span>
                    </div>
                  </div>
                  
                  {result.failed > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-700 dark:text-red-400">
                          Fallidos: {result.failed}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Errores encontrados:</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {result.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <strong>Fila {error.row}:</strong> {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
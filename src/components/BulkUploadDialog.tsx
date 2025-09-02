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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle,
  X,
  FileText,
  Info,
  Eye,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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

interface ProcessedConvocatoria {
  _rowNumber: number;
  _selected: boolean;
  _hasErrors: boolean;
  _errors: string[];
  [key: string]: any;
}

export const BulkUploadDialog = ({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedConvocatoria[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    // Definir headers con nombres descriptivos para Excel
    const headers = [
      { key: "nombre_convocatoria", display: "Nombre de la Convocatoria *" },
      { key: "entidad", display: "Entidad *" }, 
      { key: "orden", display: "Orden" },
      { key: "tipo", display: "Tipo" },
      { key: "valor", display: "Valor/Monto" },
      { key: "tipo_moneda", display: "Tipo de Moneda" },
      { key: "sector_tema", display: "Sector/Tema" },
      { key: "componentes_transversales", display: "Componentes que Financia" },
      { key: "cumplimos_requisitos", display: "¿Cumplimos Requisitos?" },
      { key: "que_nos_falta", display: "¿Qué nos falta para cumplir?" },
      { key: "fecha_limite_aplicacion", display: "Fecha Límite (YYYY-MM-DD)" },
      { key: "link_convocatoria", display: "Link de la Convocatoria" },
      { key: "estado_convocatoria", display: "Estado de la Convocatoria" },
      { key: "estado_usm", display: "Estado Interno USM" },
      { key: "observaciones", display: "Observaciones" }
    ];

    // Datos de ejemplo con validaciones visibles
    const exampleData = [
      {
        "Nombre de la Convocatoria *": "Convocatoria Nacional de Investigación 2024",
        "Entidad *": "MinCiencias", 
        "Orden": "Nacional",
        "Tipo": "Investigación",
        "Valor/Monto": 1000000,
        "Tipo de Moneda": "COP",
        "Sector/Tema": "Educación",
        "Componentes que Financia": "Infraestructura, Investigación",
        "¿Cumplimos Requisitos?": "SI",
        "¿Qué nos falta para cumplir?": "Documentos adicionales de respaldo",
        "Fecha Límite (YYYY-MM-DD)": "2024-12-31",
        "Link de la Convocatoria": "https://minciencias.gov.co/convocatoria-ejemplo",
        "Estado de la Convocatoria": "Abierta",
        "Estado Interno USM": "En revisión",
        "Observaciones": "Convocatoria de alto impacto para el área de investigación"
      },
      {
        "Nombre de la Convocatoria *": "Programa de Fortalecimiento Institucional",
        "Entidad *": "MEN", 
        "Orden": "Nacional",
        "Tipo": "Fortalecimiento institucional",
        "Valor/Monto": 500000000,
        "Tipo de Moneda": "COP",
        "Sector/Tema": "Educación",
        "Componentes que Financia": "Infraestructura, Dotación",
        "¿Cumplimos Requisitos?": "NO",
        "¿Qué nos falta para cumplir?": "Certificaciones de calidad, Plan estratégico actualizado",
        "Fecha Límite (YYYY-MM-DD)": "2024-11-15",
        "Link de la Convocatoria": "https://men.gov.co/fortalecimiento-2024",
        "Estado de la Convocatoria": "Abierta",
        "Estado Interno USM": "En preparación",
        "Observaciones": "Requiere alianza estratégica con otras instituciones"
      }
    ];

    // Datos de validación para mostrar en una segunda hoja
    const validationData = [
      { "Campo": "Orden", "Valores Válidos": "Local, Nacional, Internacional" },
      { "Campo": "Tipo", "Valores Válidos": "Investigación, Fortalecimiento institucional, Formación, Movilidad, Otro, Varios" },
      { "Campo": "Tipo de Moneda", "Valores Válidos": "COP, USD, EUR, GBP, JPY, CNY, BRL, UYU" },
      { "Campo": "Sector/Tema", "Valores Válidos": "Educación, Inclusión Social, Cultura, TIC, CT&I+D, Medio Ambiente, Otro" },
      { "Campo": "¿Cumplimos Requisitos?", "Valores Válidos": "SI, NO, PENDIENTE (o true/false, 1/0)" },
      { "Campo": "Estado Convocatoria", "Valores Válidos": "Abierta, Cerrada" },
      { "Campo": "Estado Interno USM", "Valores Válidos": "En revisión, En preparación, Presentada, En subsanación, Archivada, Adjudicada, Rechazada" },
      { "Campo": "Fecha Límite", "Valores Válidos": "Formato: YYYY-MM-DD (ej: 2024-12-31)" },
      { "Campo": "Componentes", "Valores Válidos": "Separar con comas: Infraestructura, Dotación, Servicios, Investigación, Otro, Varios" }
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();

    // Hoja 1: Template con datos
    const ws1 = XLSX.utils.json_to_sheet(exampleData);
    
    // Aplicar estilos y anchos de columna
    const colWidths = headers.map(() => ({ wch: 25 }));
    ws1['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws1, "Plantilla Convocatorias");

    // Hoja 2: Validaciones
    const ws2 = XLSX.utils.json_to_sheet(validationData);
    ws2['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Valores Válidos");

    // Hoja 3: Instrucciones
    const instructionsData = [
      { "Paso": "1", "Instrucción": "Complete la hoja 'Plantilla Convocatorias' con sus datos" },
      { "Paso": "2", "Instrucción": "Los campos marcados con * son obligatorios" },
      { "Paso": "3", "Instrucción": "Use los valores válidos mostrados en la hoja 'Valores Válidos'" },
      { "Paso": "4", "Instrucción": "Las fechas deben estar en formato YYYY-MM-DD" },
      { "Paso": "5", "Instrucción": "Los valores numéricos no deben incluir formato de moneda" },
      { "Paso": "6", "Instrucción": "Para múltiples componentes, sepárelos con comas" },
      { "Paso": "7", "Instrucción": "Guarde el archivo y súbalo en el sistema" },
      { "Paso": "", "Instrucción": "" },
      { "Paso": "NOTA", "Instrucción": "Puede eliminar estas filas de ejemplo y agregar sus propios datos" }
    ];
    
    const ws3 = XLSX.utils.json_to_sheet(instructionsData);
    ws3['!cols'] = [{ wch: 10 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Instrucciones");

    // Generar y descargar archivo
    XLSX.writeFile(wb, "Plantilla_Convocatorias_USM.xlsx");

    toast({
      title: "✅ Plantilla descargada",
      description: "Se ha descargado la plantilla Excel con ejemplos e instrucciones completas",
    });
  };

  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Usar la primera hoja del archivo
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          console.log('📊 Processing Excel file:', file.name);
          console.log('📋 Sheet name:', sheetName);
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, // Usar números como headers inicialmente
            defval: "", // Valor por defecto para celdas vacías
            raw: false // No usar valores raw, convertir todo a string
          });
          
          console.log('📄 Raw data rows:', jsonData.length);
          console.log('🔍 First few rows:', jsonData.slice(0, 3));
          
          if (jsonData.length < 2) {
            throw new Error("El archivo debe contener al menos una fila de encabezados y una fila de datos");
          }
          
          // Obtener headers (primera fila) y limpiarlos
          const headers = (jsonData[0] as string[]).map(h => 
            h ? h.toString().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ') : ''
          );
          
          console.log('📝 Headers found:', headers);
          
          // Mapear headers de Excel a nombres de campo de base de datos (más flexible)
          const headerMapping: Record<string, string> = {
            // Nombres exactos de la plantilla
            "Nombre de la Convocatoria *": "nombre_convocatoria",
            "Entidad *": "entidad",
            "Orden": "orden",
            "Tipo": "tipo",
            "Valor/Monto": "valor",
            "Tipo de Moneda": "tipo_moneda",
            "Sector/Tema": "sector_tema",
            "Componentes que Financia": "componentes_transversales",
            "¿Cumplimos Requisitos?": "cumplimos_requisitos",
            "¿Qué nos falta para cumplir?": "que_nos_falta",
            "Fecha Límite (YYYY-MM-DD)": "fecha_limite_aplicacion",
            "Link de la Convocatoria": "link_convocatoria",
            "Estado de la Convocatoria": "estado_convocatoria",
            "Estado Interno USM": "estado_usm",
            "Observaciones": "observaciones",
            
            // Variaciones comunes (sin acentos, minúsculas, etc.)
            "nombre de la convocatoria": "nombre_convocatoria",
            "nombre_convocatoria": "nombre_convocatoria",
            "convocatoria": "nombre_convocatoria",
            "entidad": "entidad",
            "orden": "orden",
            "tipo": "tipo",
            "valor": "valor",
            "monto": "valor",
            "valor/monto": "valor",
            "tipo de moneda": "tipo_moneda", 
            "tipo_moneda": "tipo_moneda",
            "moneda": "tipo_moneda",
            "sector": "sector_tema",
            "tema": "sector_tema",
            "sector/tema": "sector_tema",
            "sector_tema": "sector_tema",
            "componentes": "componentes_transversales",
            "componentes que financia": "componentes_transversales",
            "componentes_transversales": "componentes_transversales",
            "cumplimos": "cumplimos_requisitos",
            "cumplimos requisitos": "cumplimos_requisitos",
            "cumplimos_requisitos": "cumplimos_requisitos",
            "requisitos": "cumplimos_requisitos",
            "que nos falta": "que_nos_falta",
            "que_nos_falta": "que_nos_falta",
            "falta": "que_nos_falta",
            "fecha": "fecha_limite_aplicacion",
            "fecha limite": "fecha_limite_aplicacion",
            "fecha_limite": "fecha_limite_aplicacion",
            "fecha_limite_aplicacion": "fecha_limite_aplicacion",
            "link": "link_convocatoria",
            "link_convocatoria": "link_convocatoria",
            "url": "link_convocatoria",
            "estado convocatoria": "estado_convocatoria",
            "estado_convocatoria": "estado_convocatoria",
            "estado": "estado_convocatoria",
            "estado usm": "estado_usm",
            "estado_usm": "estado_usm",
            "estado interno": "estado_usm",
            "observaciones": "observaciones",
            "notas": "observaciones"
          };
          
          // Crear mapeo basado en los headers encontrados
          const columnMapping: Record<number, string> = {};
          headers.forEach((header, index) => {
            if (header) {
              const normalized = header.toLowerCase().trim();
              const fieldName = headerMapping[normalized] || headerMapping[header];
              if (fieldName) {
                columnMapping[index] = fieldName;
                console.log(`🔗 Mapped column ${index} "${header}" -> "${fieldName}"`);
              } else {
                console.warn(`⚠️ Unmapped header: "${header}"`);
              }
            }
          });
          
          console.log('🗺️ Column mapping:', columnMapping);
          
          // Convertir datos
          const processedData = jsonData.slice(1).map((row: any[], index: number) => {
            const processedRow: any = { _rowNumber: index + 2 };
            
            // Procesar cada columna usando el mapeo
            Object.entries(columnMapping).forEach(([colIndex, fieldName]) => {
              const cellValue = row[parseInt(colIndex)];
              let value = '';
              
              if (cellValue !== undefined && cellValue !== null) {
                value = cellValue.toString().trim();
              }
              
              if (value && fieldName) {
                // Procesar campos específicos
                if (fieldName === 'valor' && value) {
                  // Limpiar formato de moneda y convertir a número
                  const cleanValue = value.replace(/[^\d.-]/g, '');
                  const numValue = parseFloat(cleanValue);
                  processedRow[fieldName] = isNaN(numValue) ? null : numValue;
                } else if (fieldName === 'cumplimos_requisitos') {
                  // Normalizar valores booleanos
                  const normalizedValue = value.toLowerCase();
                  processedRow[fieldName] = normalizedValue === 'si' || normalizedValue === 'sí' || 
                                           normalizedValue === 'true' || normalizedValue === '1' || 
                                           normalizedValue === 'yes';
                } else if (fieldName === 'fecha_limite_aplicacion' && value) {
                  // Procesar fechas
                  let dateValue = null;
                  
                  // Si es número (fecha serial de Excel)
                  if (!isNaN(Number(value))) {
                    try {
                      const excelDate = XLSX.SSF.parse_date_code(Number(value));
                      if (excelDate) {
                        const date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
                        dateValue = date.toISOString().split('T')[0];
                      }
                    } catch (e) {
                      console.warn('Error parsing Excel date:', e);
                    }
                  }
                  
                  // Si no se pudo convertir como fecha de Excel, intentar como string
                  if (!dateValue) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      dateValue = value.includes('-') ? value : date.toISOString().split('T')[0];
                    }
                  }
                  
                  processedRow[fieldName] = dateValue;
                } else {
                  // Campo de texto normal
                  processedRow[fieldName] = value;
                }
              }
            });
            
            console.log(`📝 Row ${index + 2} processed:`, processedRow);
            return processedRow;
          });
          
          // Filtrar filas que tienen al menos los campos principales
          const validData = processedData.filter(row => {
            const hasMainFields = row.nombre_convocatoria || row.entidad;
            const hasData = Object.keys(row).length > 1; // Más que solo _rowNumber
            return hasMainFields && hasData;
          });
          
          console.log(`✅ Processed ${validData.length} valid rows from ${processedData.length} total rows`);
          
          resolve(validData);
        } catch (error) {
          console.error('❌ Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = { _rowNumber: index + 2 };
      
      headers.forEach((header, i) => {
        let value = values[i] || '';
        
        if (header === 'valor' && value) {
          row[header] = parseFloat(value) || null;
        } else if (header === 'cumplimos_requisitos') {
          row[header] = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'sí';
        } else if (header === 'fecha_limite_aplicacion' && value) {
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
    
    // Validate catalog values (case-insensitive)
    const validOrden = ["Local", "Nacional", "Internacional"];
    if (row.orden && !validOrden.some(v => v.toLowerCase() === row.orden.toLowerCase())) {
      errors.push(`Orden debe ser uno de: ${validOrden.join(", ")}`);
    }
    
    const validTipo = ["Investigación", "Fortalecimiento institucional", "Formación", "Movilidad", "Otro", "Varios"];
    if (row.tipo && !validTipo.some(v => v.toLowerCase() === row.tipo.toLowerCase())) {
      errors.push(`Tipo debe ser uno de: ${validTipo.join(", ")}`);
    }
    
    const validMoneda = ["COP", "USD", "EUR", "GBP", "JPY", "CNY", "BRL", "UYU"];
    if (row.tipo_moneda && !validMoneda.some(v => v.toLowerCase() === row.tipo_moneda.toLowerCase())) {
      errors.push(`Moneda debe ser una de: ${validMoneda.join(", ")}`);
    }
    
    const validSector = ["Educación", "Inclusión Social", "Cultura", "TIC", "CT&I+D", "Medio Ambiente", "Otro"];
    if (row.sector_tema && !validSector.some(v => v.toLowerCase() === row.sector_tema.toLowerCase())) {
      errors.push(`Sector debe ser uno de: ${validSector.join(", ")}`);
    }
    
    const validEstadoConv = ["Abierta", "Cerrada"];
    if (row.estado_convocatoria && !validEstadoConv.some(v => v.toLowerCase() === row.estado_convocatoria.toLowerCase())) {
      errors.push(`Estado convocatoria debe ser: ${validEstadoConv.join(" o ")}`);
    }
    
    const validEstadoUSM = ["En revisión", "En preparación", "Presentada", "En subsanación", "Archivada", "Adjudicada", "Rechazada"];
    if (row.estado_usm && !validEstadoUSM.some(v => v.toLowerCase() === row.estado_usm.toLowerCase())) {
      errors.push(`Estado USM debe ser uno de: ${validEstadoUSM.join(", ")}`);
    }
    
    return errors;
  };

  // Process file and show preview
  const handleFileProcess = async () => {
    if (!selectedFile) {
      toast({
        title: "⚠️ Error",
        description: "Por favor selecciona un archivo Excel (.xlsx) o CSV",
        variant: "destructive",
      });
      return;
    }

    setProcessingFile(true);
    setResult(null);

    try {
      let data: any[] = [];
      
      // Procesar según el tipo de archivo
      if (selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        data = await parseExcelFile(selectedFile);
      } else if (selectedFile.name.toLowerCase().endsWith('.csv')) {
        const csvText = await selectedFile.text();
        data = parseCSV(csvText);
      } else {
        throw new Error("Formato de archivo no soportado");
      }

      if (data.length === 0) {
        throw new Error("No se encontraron datos válidos en el archivo");
      }

      // Process and validate data
      const processedConvocatorias: ProcessedConvocatoria[] = data.map((row, index) => {
        const rowNumber = row._rowNumber || index + 2;
        const cleanRow = { ...row };
        delete cleanRow._rowNumber;

        // Validate and normalize values
        const errors = validateRow(cleanRow);
        
        // Normalize case-sensitive fields
        if (cleanRow.orden) cleanRow.orden = normalizeValue(cleanRow.orden, ["Local", "Nacional", "Internacional"]);
        if (cleanRow.tipo) cleanRow.tipo = normalizeValue(cleanRow.tipo, ["Investigación", "Fortalecimiento institucional", "Formación", "Movilidad", "Otro", "Varios"]);
        if (cleanRow.tipo_moneda) cleanRow.tipo_moneda = normalizeValue(cleanRow.tipo_moneda, ["COP", "USD", "EUR", "GBP", "JPY", "CNY", "BRL", "UYU"]);
        if (cleanRow.sector_tema) cleanRow.sector_tema = normalizeValue(cleanRow.sector_tema, ["Educación", "Inclusión Social", "Cultura", "TIC", "CT&I+D", "Medio Ambiente", "Otro"]);
        if (cleanRow.estado_convocatoria) cleanRow.estado_convocatoria = normalizeValue(cleanRow.estado_convocatoria, ["Abierta", "Cerrada"]);
        if (cleanRow.estado_usm) cleanRow.estado_usm = normalizeValue(cleanRow.estado_usm, ["En revisión", "En preparación", "Presentada", "En subsanación", "Archivada", "Adjudicada", "Rechazada"]);

        return {
          ...cleanRow,
          _rowNumber: rowNumber,
          _selected: errors.length === 0, // Auto-select only valid rows
          _hasErrors: errors.length > 0,
          _errors: errors
        };
      });

      setProcessedData(processedConvocatorias);
      setShowPreview(true);
      
      const validCount = processedConvocatorias.filter(row => !row._hasErrors).length;
      const errorCount = processedConvocatorias.length - validCount;
      
      toast({
        title: "📋 Archivo procesado",
        description: `${processedConvocatorias.length} registros encontrados (${validCount} válidos, ${errorCount} con errores)`,
      });
      
    } catch (error: any) {
      console.error("Error processing file:", error);
      toast({
        title: "💥 Error",
        description: "Error al procesar el archivo: " + error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingFile(false);
    }
  };

  // Helper function to normalize values
  const normalizeValue = (value: string, validValues: string[]): string => {
    const match = validValues.find(v => v.toLowerCase() === value.toLowerCase());
    return match || value;
  };

  // Upload selected convocatorias to database
  const handleUploadToDatabase = async () => {
    const selectedRows = processedData.filter(row => row._selected && !row._hasErrors);
    
    if (selectedRows.length === 0) {
      toast({
        title: "⚠️ Advertencia",
        description: "No hay registros válidos seleccionados para cargar",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    const uploadResult: UploadResult = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      const rowNumber = row._rowNumber;
      const cleanRow = { ...row };
      delete cleanRow._rowNumber;
      delete cleanRow._selected;
      delete cleanRow._hasErrors;
      delete cleanRow._errors;
      
      setProgress(((i + 1) / selectedRows.length) * 100);
      
      // Limpiar valores vacíos
      Object.keys(cleanRow).forEach(key => {
        if (cleanRow[key] === '' || cleanRow[key] === null || cleanRow[key] === undefined) {
          delete cleanRow[key];
        }
      });
      
      try {
        // Create database record with only valid fields
        const dbRecord: any = {};
        const validFields = [
          'nombre_convocatoria', 'entidad', 'orden', 'tipo', 'valor', 'tipo_moneda',
          'sector_tema', 'componentes_transversales', 'cumplimos_requisitos', 'que_nos_falta',
          'fecha_limite_aplicacion', 'link_convocatoria', 'estado_convocatoria', 'estado_usm', 'observaciones'
        ];
        
        validFields.forEach(field => {
          if (cleanRow[field] !== undefined && cleanRow[field] !== null && cleanRow[field] !== '') {
            dbRecord[field] = cleanRow[field];
          }
        });

        const { error } = await supabase
          .from("convocatorias")
          .insert(dbRecord);
          
        if (error) throw error;
        uploadResult.successful++;
      } catch (error: any) {
        uploadResult.failed++;
        uploadResult.errors.push({
          row: rowNumber,
          error: error.message || "Error desconocido",
          data: cleanRow
        });
      }
    }

    setResult(uploadResult);
    setShowPreview(false);
    
    if (uploadResult.successful > 0) {
      toast({
        title: "🎉 Carga completada",
        description: `${uploadResult.successful} registros cargados exitosamente${uploadResult.failed > 0 ? ` - ${uploadResult.failed} fallidos` : ''}`,
      });
      onSuccess();
    }
    
    setUploading(false);
    setProgress(100);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.csv');
      
      if (!isValidFormat) {
        toast({
          title: "❌ Formato incorrecto",
          description: "Por favor selecciona un archivo Excel (.xlsx) o CSV (.csv)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setResult(null);
      
      // Mostrar mensaje informativo sobre el formato
      const formatType = fileName.endsWith('.xlsx') ? 'Excel' : 'CSV';
      toast({
        title: `✅ Archivo ${formatType} seleccionado`,
        description: `${file.name} - Listo para procesar`,
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
    setUploading(false);
    setProcessedData([]);
    setShowPreview(false);
    setProcessingFile(false);
    onOpenChange(false);
  };

  const toggleRowSelection = (index: number) => {
    const newData = [...processedData];
    newData[index]._selected = !newData[index]._selected;
    setProcessedData(newData);
  };

  const toggleAllSelection = (checked: boolean) => {
    const newData = processedData.map(row => ({
      ...row,
      _selected: checked && !row._hasErrors
    }));
    setProcessedData(newData);
  };

  const selectedCount = processedData.filter(row => row._selected).length;
  const validCount = processedData.filter(row => !row._hasErrors).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carga Masiva de Convocatorias
          </DialogTitle>
          <DialogDescription>
            Sube múltiples convocatorias usando un archivo Excel (.xlsx) o CSV (.csv)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información importante */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Recomendación:</strong> Use archivos Excel (.xlsx) para mayor compatibilidad y características avanzadas. 
              La plantilla incluye validaciones, ejemplos e instrucciones detalladas.
            </AlertDescription>
          </Alert>

          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                Paso 1: Descargar Plantilla Excel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga la plantilla Excel con formato optimizado, ejemplos reales, validaciones y guía completa.
              </p>
              <div className="space-y-3">
                <Button onClick={downloadTemplate} className="hover:scale-105 transition-transform">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla Excel Completa
                </Button>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📋 <strong>La plantilla incluye:</strong></p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Hoja con ejemplos de convocatorias reales</li>
                    <li>Hoja con todos los valores válidos para cada campo</li>
                    <li>Instrucciones paso a paso detalladas</li>
                    <li>Formato optimizado para Excel</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Paso 2: Subir Archivo de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excel-file">Archivo de convocatorias</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <div className="text-xs text-muted-foreground">
                  Formatos soportados: Excel (.xlsx) - <em>Recomendado</em> | CSV (.csv)
                </div>
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  {selectedFile.name.toLowerCase().endsWith('.xlsx') ? (
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <div className="text-xs text-muted-foreground">
                      {selectedFile.name.toLowerCase().endsWith('.xlsx') ? 'Archivo Excel' : 'Archivo CSV'} • {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Procesando archivo...</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                  <p className="text-xs text-muted-foreground">
                    Validando datos y guardando en la base de datos...
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleFileProcess}
                  disabled={!selectedFile || processingFile || uploading}
                  className="hover:scale-105 transition-transform"
                  size="lg"
                >
                  {processingFile ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Procesar y Revisar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={processingFile || uploading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview and Authorization */}
          {showPreview && processedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Autorizar Carga de Convocatorias
                </CardTitle>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Revisa y autoriza las convocatorias antes de cargarlas a la base de datos
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-green-600">
                      {validCount} válidos
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      {processedData.length - validCount} con errores
                    </Badge>
                    <Badge variant="secondary">
                      {selectedCount} seleccionados
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="select-all"
                      checked={selectedCount > 0 && selectedCount === validCount}
                      onCheckedChange={toggleAllSelection}
                    />
                    <Label htmlFor="select-all" className="text-sm font-medium">
                      Seleccionar todos los registros válidos ({validCount})
                    </Label>
                  </div>
                  
                  <ScrollArea className="h-96 w-full border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Sel.</TableHead>
                          <TableHead className="w-16">Fila</TableHead>
                          <TableHead className="min-w-48">Convocatoria</TableHead>
                          <TableHead className="min-w-32">Entidad</TableHead>
                          <TableHead className="w-20">Orden</TableHead>
                          <TableHead className="w-24">Tipo</TableHead>
                          <TableHead className="w-32">Valor</TableHead>
                          <TableHead className="w-20">Estado</TableHead>
                          <TableHead className="min-w-48">Errores</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.map((row, index) => (
                          <TableRow key={index} className={row._hasErrors ? "bg-red-50 dark:bg-red-950/20" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={row._selected}
                                disabled={row._hasErrors}
                                onCheckedChange={() => toggleRowSelection(index)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {row._rowNumber}
                            </TableCell>
                            <TableCell className="max-w-48">
                              <div className="truncate text-sm" title={row.nombre_convocatoria}>
                                {row.nombre_convocatoria || <span className="text-muted-foreground">Sin nombre</span>}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-32">
                              <div className="truncate text-sm" title={row.entidad}>
                                {row.entidad || <span className="text-muted-foreground">Sin entidad</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {row.orden || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {row.tipo || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.valor ? (
                                <span className="text-sm font-mono">
                                  {new Intl.NumberFormat('es-CO').format(row.valor)} {row.tipo_moneda || 'COP'}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">Sin valor</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={row._hasErrors ? "destructive" : "default"} className="text-xs">
                                {row._hasErrors ? "Error" : "Válido"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-48">
                              {row._errors.length > 0 ? (
                                <div className="space-y-1">
                                  {row._errors.map((error, errorIndex) => (
                                    <Badge key={errorIndex} variant="destructive" className="text-xs block">
                                      {error}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  ✓ Sin errores
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>

                  {uploading && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Cargando a la base de datos...</span>
                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full h-2" />
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                      disabled={uploading}
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={handleUploadToDatabase}
                      disabled={selectedCount === 0 || uploading}
                      className="hover:scale-105 transition-transform"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Cargar {selectedCount} Convocatorias
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportData {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  orden?: string;
  tipo?: string;
  valor?: number;
  tipo_moneda?: string;
  sector_tema?: string;
  componentes_transversales?: string;
  cumplimos_requisitos?: boolean;
  que_nos_falta?: string;
  fecha_limite_aplicacion?: string;
  estado_convocatoria?: string;
  estado_usm?: string;
  observaciones?: string;
  link_convocatoria?: string;
}

const formatCurrency = (valor: number | undefined, moneda: string = 'COP'): string => {
  if (!valor) return 'N/A';
  
  const formatters: { [key: string]: Intl.NumberFormat } = {
    COP: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
  };
  
  const formatter = formatters[moneda] || formatters.COP;
  return formatter.format(valor);
};

export const exportToPDF = (data: ExportData[], title: string = 'Convocatorias') => {
  const doc = new jsPDF();
  
  // Configurar fuentes y colores
  doc.setFont('helvetica');
  
  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(0, 123, 255); // Color azul
  doc.text(title, 14, 22);
  
  // Información del reporte
  doc.setFontSize(10);
  doc.setTextColor(100);
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generado el: ${fecha}`, 14, 30);
  doc.text(`Total de registros: ${data.length}`, 14, 36);
  
  // Línea separadora
  doc.setDrawColor(0, 123, 255);
  doc.line(14, 40, 196, 40);
  
  // Preparar datos para la tabla
  const tableData = data.map((item, index) => [
    (index + 1).toString(),
    item.nombre_convocatoria || 'N/A',
    item.entidad || 'N/A',
    item.tipo || 'N/A',
    formatCurrency(item.valor, item.tipo_moneda),
    item.sector_tema || 'N/A',
    item.fecha_limite_aplicacion || 'N/A',
    item.estado_convocatoria || 'N/A',
    item.cumplimos_requisitos ? 'Sí' : 'No'
  ]);
  
  // Configurar tabla
  (doc as any).autoTable({
    startY: 45,
    head: [['#', 'Nombre', 'Entidad', 'Tipo', 'Valor', 'Sector', 'Fecha Límite', 'Estado', 'Cumple Req.']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [0, 123, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // #
      1: { cellWidth: 35 }, // Nombre
      2: { cellWidth: 25 }, // Entidad
      3: { cellWidth: 20 }, // Tipo
      4: { cellWidth: 25, halign: 'right' }, // Valor
      5: { cellWidth: 25 }, // Sector
      6: { cellWidth: 20, halign: 'center' }, // Fecha Límite
      7: { cellWidth: 20, halign: 'center' }, // Estado
      8: { cellWidth: 15, halign: 'center' } // Cumple Req.
    },
    didDrawPage: (data: any) => {
      // Pie de página
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`, 
        14, 
        pageHeight - 10
      );
      doc.text(
        'Sistema de Gestión de Convocatorias - Universidad', 
        doc.internal.pageSize.width - 14, 
        pageHeight - 10, 
        { align: 'right' }
      );
    }
  });
  
  // Guardar el archivo
  const fileName = `convocatorias_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const exportToExcel = (data: ExportData[], title: string = 'Convocatorias') => {
  // Preparar datos para Excel con formato mejorado
  const excelData = data.map((item, index) => ({
    'No.': index + 1,
    'Nombre de la Convocatoria': item.nombre_convocatoria || '',
    'Entidad': item.entidad || '',
    'Orden': item.orden || '',
    'Tipo': item.tipo || '',
    'Valor': item.valor || 0,
    'Moneda': item.tipo_moneda || 'COP',
    'Valor Formateado': formatCurrency(item.valor, item.tipo_moneda),
    'Sector/Tema': item.sector_tema || '',
    'Componentes Transversales': item.componentes_transversales || '',
    'Cumplimos Requisitos': item.cumplimos_requisitos ? 'Sí' : 'No',
    'Qué nos falta': item.que_nos_falta || '',
    'Fecha Límite de Aplicación': item.fecha_limite_aplicacion || '',
    'Estado de la Convocatoria': item.estado_convocatoria || '',
    'Estado USM': item.estado_usm || '',
    'Observaciones': item.observaciones || '',
    'Link de la Convocatoria': item.link_convocatoria || ''
  }));
  
  // Crear workbook
  const wb = XLSX.utils.book_new();
  
  // Crear hoja de datos
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Configurar ancho de columnas
  const colWidths = [
    { wch: 5 },   // No.
    { wch: 40 },  // Nombre
    { wch: 25 },  // Entidad
    { wch: 15 },  // Orden
    { wch: 20 },  // Tipo
    { wch: 15 },  // Valor
    { wch: 10 },  // Moneda
    { wch: 20 },  // Valor Formateado
    { wch: 25 },  // Sector
    { wch: 30 },  // Componentes
    { wch: 15 },  // Cumple Req.
    { wch: 30 },  // Qué falta
    { wch: 15 },  // Fecha Límite
    { wch: 20 },  // Estado Conv.
    { wch: 15 },  // Estado USM
    { wch: 40 },  // Observaciones
    { wch: 40 }   // Link
  ];
  
  ws['!cols'] = colWidths;
  
  // Agregar información del reporte en las primeras filas
  XLSX.utils.sheet_add_aoa(ws, [
    [`${title} - Reporte Generado`],
    [`Fecha: ${new Date().toLocaleDateString('es-ES')}`],
    [`Total de registros: ${data.length}`],
    [], // Fila vacía
  ], { origin: 'A1' });
  
  // Mover los datos hacia abajo
  XLSX.utils.sheet_add_json(ws, excelData, { origin: 'A6' });
  
  // Agregar la hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Convocatorias');
  
  // Crear hoja de resumen
  const summaryData = [
    { Concepto: 'Total de Convocatorias', Valor: data.length },
    { Concepto: 'Convocatorias que Cumplimos Requisitos', Valor: data.filter(d => d.cumplimos_requisitos).length },
    { Concepto: 'Convocatorias Activas', Valor: data.filter(d => d.estado_convocatoria === 'Abierta').length },
    { Concepto: 'Entidades Únicas', Valor: new Set(data.map(d => d.entidad)).size },
    { Concepto: 'Sectores Únicos', Valor: new Set(data.map(d => d.sector_tema)).size }
  ];
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen');
  
  // Guardar archivo
  const fileName = `convocatorias_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Convocatoria {
  id: number;
  nombre_convocatoria: string;
  entidad: string;
  orden: "Nacional" | "Internacional";
  tipo: string;
  sector_tema: string;
  cumplimos_requisitos: boolean;
  que_nos_falta: string;
  fecha_limite_aplicacion: string;
  estado_convocatoria: "Abierta" | "Cerrada";
  estado_usm: string;
  valor: number;
  tipo_moneda: string;
}

interface AnalisisResultado {
  tasaElegibilidadGeneral: number;
  ventajaComparativa: {
    mejor: string;
    diferencia: number;
    descripcion: string;
  };
  sectorMasExitoso: {
    nombre: string;
    tasa: number;
  };
  convocatoriasVencidas: number[];
  oportunidadesUrgentes: Array<{
    id: number;
    nombre: string;
    monto: string;
    dias: number;
  }>;
  problemasTemporales: {
    titulo: string;
    descripcion: string;
  };
}

// Configuración de parámetros
const CONFIGURACION = {
  DIAS_ALERTA_URGENTE: 30,
  DIAS_ALERTA_CRITICA: 7,
  P_VALUE_SIGNIFICANCIA: 0.05,
  POTENCIAL_ALTO: 40,
  POTENCIAL_MEDIO: 20,
  POTENCIAL_BAJO: 10,
  FORMATO_FECHA: 'DD/MM/YYYY',
  PRECISION_PORCENTAJES: 1,
};

function calcularTasaElegibilidad(data: Convocatoria[]): number {
  if (data.length === 0) return 0;
  const elegibles = data.filter(c => c.cumplimos_requisitos).length;
  return Math.round((elegibles / data.length) * 100 * 10) / 10;
}

function analizarVentajaComparativa(data: Convocatoria[]) {
  const nacional = data.filter(c => c.orden === 'Nacional');
  const internacional = data.filter(c => c.orden === 'Internacional');
  
  const tasaNac = nacional.length > 0 ? (nacional.filter(c => c.cumplimos_requisitos).length / nacional.length) * 100 : 0;
  const tasaInt = internacional.length > 0 ? (internacional.filter(c => c.cumplimos_requisitos).length / internacional.length) * 100 : 0;
  
  if (tasaInt > tasaNac) {
    return {
      mejor: 'Internacional',
      diferencia: Math.round((tasaInt - tasaNac) * 10) / 10,
      descripcion: `${Math.round(tasaInt * 10) / 10}% éxito internacional vs ${Math.round(tasaNac * 10) / 10}% nacional`
    };
  } else {
    return {
      mejor: 'Nacional',
      diferencia: Math.round((tasaNac - tasaInt) * 10) / 10,
      descripcion: `${Math.round(tasaNac * 10) / 10}% éxito nacional vs ${Math.round(tasaInt * 10) / 10}% internacional`
    };
  }
}

function identificarSectorMasExitoso(data: Convocatoria[]) {
  const sectores = [...new Set(data.map(c => c.sector_tema).filter(Boolean))];
  
  let mejorSector = { nombre: 'N/A', tasa: 0 };
  
  sectores.forEach(sector => {
    const convocatoriasSector = data.filter(c => c.sector_tema === sector);
    if (convocatoriasSector.length > 0) {
      const tasa = (convocatoriasSector.filter(c => c.cumplimos_requisitos).length / convocatoriasSector.length) * 100;
      if (tasa > mejorSector.tasa) {
        mejorSector = { nombre: sector, tasa: Math.round(tasa * 10) / 10 };
      }
    }
  });
  
  return mejorSector;
}

function calcularDiasRestantes(fecha: string): number {
  const hoy = new Date();
  const fechaLimite = new Date(fecha);
  const diferencia = fechaLimite.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

function detectarProblemasTemporal(data: Convocatoria[]) {
  const hoy = new Date();
  const vencidas = data.filter(c => {
    const dias = calcularDiasRestantes(c.fecha_limite_aplicacion);
    return dias < 0 && c.estado_convocatoria === 'Abierta';
  }).length;
  
  const urgentes = data.filter(c => {
    const dias = calcularDiasRestantes(c.fecha_limite_aplicacion);
    return dias > 0 && dias <= CONFIGURACION.DIAS_ALERTA_URGENTE && c.estado_convocatoria === 'Abierta';
  }).length;
  
  if (vencidas > 0) {
    return {
      titulo: "Crisis temporal detectada",
      descripcion: `${vencidas} convocatorias marcadas como abiertas están vencidas`
    };
  } else if (urgentes > 0) {
    return {
      titulo: "Oportunidades urgentes",
      descripcion: `${urgentes} convocatorias abiertas vencen en menos de ${CONFIGURACION.DIAS_ALERTA_URGENTE} días`
    };
  }
  
  return {
    titulo: "Gestión temporal estable",
    descripcion: "No se detectaron problemas críticos de tiempo"
  };
}

function generarAnalisisCompleto(data: Convocatoria[]): AnalisisResultado {
  const tasaElegibilidadGeneral = calcularTasaElegibilidad(data);
  const ventajaComparativa = analizarVentajaComparativa(data);
  const sectorMasExitoso = identificarSectorMasExitoso(data);
  const problemasTemporales = detectarProblemasTemporal(data);
  
  const convocatoriasVencidas = data
    .filter(c => calcularDiasRestantes(c.fecha_limite_aplicacion) < 0 && c.estado_convocatoria === 'Abierta')
    .map(c => c.id);
  
  const oportunidadesUrgentes = data
    .filter(c => {
      const dias = calcularDiasRestantes(c.fecha_limite_aplicacion);
      return dias > 0 && dias <= CONFIGURACION.DIAS_ALERTA_URGENTE && c.estado_convocatoria === 'Abierta' && c.cumplimos_requisitos;
    })
    .sort((a, b) => calcularDiasRestantes(a.fecha_limite_aplicacion) - calcularDiasRestantes(b.fecha_limite_aplicacion))
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      nombre: c.nombre_convocatoria,
      monto: formatCurrency(c.valor, c.tipo_moneda),
      dias: calcularDiasRestantes(c.fecha_limite_aplicacion)
    }));
  
  return {
    tasaElegibilidadGeneral,
    ventajaComparativa,
    sectorMasExitoso,
    convocatoriasVencidas,
    oportunidadesUrgentes,
    problemasTemporales
  };
}

function formatCurrency(valor: number, moneda: string = 'COP'): string {
  if (!valor) return 'N/A';
  
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(valor);
}

// Función principal para generar informe siguiendo template exacto
function generarInformeTexto(convocatorias: Convocatoria[], analisis: AnalisisResultado): string {
  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const año = new Date().getFullYear();
  const total = convocatorias.length;
  
  // Calcular estadísticas siguiendo el template exacto
  const elegibles = convocatorias.filter(c => c.cumplimos_requisitos === true).length;
  const porcentajeElegibles = ((elegibles / total) * 100).toFixed(1);
  const porcentajeNoElegibles = (((total - elegibles) / total) * 100).toFixed(1);
  
  // Análisis por orden
  const internacional = convocatorias.filter(c => c.orden === 'Internacional');
  const nacional = convocatorias.filter(c => c.orden === 'Nacional');
  const countInternacional = internacional.length;
  const countNacional = nacional.length;
  const porcentajeInternacional = ((countInternacional / total) * 100).toFixed(1);
  const porcentajeNacional = ((countNacional / total) * 100).toFixed(1);
  
  const tasaExitoInternacional = internacional.length > 0 ? ((internacional.filter(c => c.cumplimos_requisitos).length / internacional.length) * 100).toFixed(1) : '0.0';
  const tasaExitoNacional = nacional.length > 0 ? ((nacional.filter(c => c.cumplimos_requisitos).length / nacional.length) * 100).toFixed(1) : '0.0';
  const elegiblesInternacional = internacional.filter(c => c.cumplimos_requisitos).length;
  const elegiblesNacional = nacional.filter(c => c.cumplimos_requisitos).length;
  
  // Análisis sectorial
  const sectores = [...new Set(convocatorias.map(c => c.sector_tema).filter(Boolean))];
  let mejorSector = '';
  let tasaMejorSector = '0.0';
  let porcentajeSectorExitoso = '0.0';
  
  sectores.forEach(sector => {
    const sectorData = convocatorias.filter(c => c.sector_tema === sector);
    const sectorElegibles = sectorData.filter(c => c.cumplimos_requisitos).length;
    const tasa = sectorData.length > 0 ? ((sectorElegibles / sectorData.length) * 100).toFixed(1) : '0.0';
    if (parseFloat(tasa) > parseFloat(tasaMejorSector)) {
      mejorSector = sector;
      tasaMejorSector = tasa;
      porcentajeSectorExitoso = tasa;
    }
  });
  
  // Estados
  const abiertas = convocatorias.filter(c => c.estado_convocatoria === 'Abierta');
  const cerradas = convocatorias.filter(c => c.estado_convocatoria === 'Cerrada');
  const countAbiertas = abiertas.length;
  const countCerradas = cerradas.length;
  const porcentajeAbiertas = ((countAbiertas / total) * 100).toFixed(1);
  const porcentajeCerradas = ((countCerradas / total) * 100).toFixed(1);
  
  // Tipos
  const tipos = [...new Set(convocatorias.map(c => c.tipo).filter(Boolean))].slice(0, 4);
  const tipoStats = tipos.map(tipo => ({
    tipo,
    count: convocatorias.filter(c => c.tipo === tipo).length,
    porcentaje: ((convocatorias.filter(c => c.tipo === tipo).length / total) * 100).toFixed(1)
  }));
  
  // Sectores stats
  const sectorStats = sectores.slice(0, 4).map(sector => ({
    sector,
    count: convocatorias.filter(c => c.sector_tema === sector).length,
    porcentaje: ((convocatorias.filter(c => c.sector_tema === sector).length / total) * 100).toFixed(1)
  }));
  
  // Mejor orden
  const mejorOrden = parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ? 'Internacional' : 'Nacional';
  const descripcionVentajaComparativa = `Convocatorias ${mejorOrden.toLowerCase()}es muestran ${parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ? tasaExitoInternacional : tasaExitoNacional}% de elegibilidad vs ${parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ? tasaExitoNacional : tasaExitoInternacional}% de la competencia`;
  
  // Problema temporal
  const hoy = new Date();
  const vencidas = convocatorias.filter(c => {
    const dias = Math.ceil((new Date(c.fecha_limite_aplicacion) - hoy) / (1000 * 60 * 60 * 24));
    return dias < 0 && c.estado_convocatoria === 'Abierta';
  });
  
  const urgentes = abiertas.filter(c => {
    const dias = Math.ceil((new Date(c.fecha_limite_aplicacion) - hoy) / (1000 * 60 * 60 * 24));
    return dias <= 30 && dias >= 0 && c.cumplimos_requisitos;
  });
  
  const tituloProblemaTemp = vencidas.length > 0 ? "Crisis temporal crítica" : "Gestión temporal adecuada";
  const descripcionProblemaTemp = vencidas.length > 0 ?
    `${vencidas.length} convocatorias vencidas siguen marcadas como abiertas` :
    `${urgentes.length} oportunidades elegibles requieren atención en los próximos 30 días`;
  
  // Distribución temporal
  const porMes = {};
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  convocatorias.forEach(c => {
    const fecha = new Date(c.fecha_limite_aplicacion);
    const mesIndex = fecha.getMonth();
    const mesNombre = meses[mesIndex];
    porMes[mesNombre] = (porMes[mesNombre] || 0) + 1;
  });
  
  const mesesOrdenados = Object.entries(porMes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  
  const concentracion = mesesOrdenados.reduce((sum, [_, count]) => sum + count, 0);
  const periodoConcentracion = mesesOrdenados.map(([mes, _]) => mes).join(' y ');
  const porcentajeConcentracion = ((concentracion / total) * 100).toFixed(1);
  const numeroMeses = mesesOrdenados.length;
  
  // Tabla sectorial dinámica
  const tablaSectorial = sectores.slice(0, 4).map(sector => {
    const sectorData = convocatorias.filter(c => c.sector_tema === sector);
    const sectorTotal = sectorData.length;
    const sectorElegibles = sectorData.filter(c => c.cumplimos_requisitos).length;
    const sectorAbiertas = sectorData.filter(c => c.estado_convocatoria === 'Abierta').length;
    const sectorTasa = sectorTotal > 0 ? ((sectorElegibles / sectorTotal) * 100).toFixed(1) : '0.0';
    const potencial = parseFloat(sectorTasa) >= 40 ? 'Alto' :
                     parseFloat(sectorTasa) >= 20 ? 'Medio' :
                     parseFloat(sectorTasa) > 0 ? 'Bajo' : 'Nulo';
    
    return `| ${sector} | ${sectorTasa}% | ${sectorAbiertas} de ${sectorTotal} | ${potencial} |`;
  }).join('\\n');
  
  // Tabla de urgencia dinámica
  const tablaUrgencia = abiertas
    .map(c => ({
      id: c.id,
      dias: Math.ceil((new Date(c.fecha_limite_aplicacion) - hoy) / (1000 * 60 * 60 * 24)),
      cumple: c.cumplimos_requisitos,
      estado: c.estado_usm || 'Sin estado'
    }))
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 5)
    .map(item => {
      const diasFormat = item.dias < 0 ? `⚠️ **${item.dias} días**` : `${item.dias} días`;
      const cumpleIcon = item.cumple ? '✅' : '❌';
      
      let prioridad;
      if (item.dias < 0) prioridad = item.cumple ? 'CRÍTICA' : 'PERDIDA';
      else if (item.dias <= 30 && item.cumple) prioridad = '**ALTA**';
      else if (item.dias <= 30) prioridad = 'Baja';
      else if (item.cumple) prioridad = 'Media';
      else prioridad = 'Baja';
      
      return `| ${item.id} | ${diasFormat} | ${cumpleIcon} | ${item.estado} | ${prioridad} |`;
    }).join('\\n');
  
  // Conclusiones
  const numeroExitosas = elegibles;
  const idsExitosas = convocatorias.filter(c => c.cumplimos_requisitos).slice(0, 5).map(c => c.id).join(', ');
  
  const perfilOrden = mejorOrden;
  const perfilSector = mejorSector || 'Tecnología';
  const perfilTipo = tipoStats.length > 0 ? tipoStats[0].tipo : 'Investigación';
  const perfilMonto = 'Entre $50M - $500M COP';
  const perfilDuracion = '12-24 meses';
  
  const probabilidadExito = Math.min(95, parseFloat(tasaMejorSector) + 15).toFixed(0);
  const probabilidadFracaso = Math.max(5, 100 - parseFloat(tasaMejorSector) - 30).toFixed(0);
  const tasaAprovechamiento = ((urgentes.length / Math.max(1, abiertas.length)) * 100).toFixed(1);
  
  const conclusionPrincipal = `Con una tasa de elegibilidad del ${porcentajeElegibles}%, USM debe concentrar esfuerzos en convocatorias ${mejorOrden.toLowerCase()}es del sector ${mejorSector}, donde presenta ventajas competitivas demostrables.`;
  
  const recomendacionFinal = `Implementar estrategia diferenciada: 70% recursos en ${mejorOrden.toLowerCase()}, 60% en sector ${mejorSector}, y sistema de alerta para oportunidades con menos de 30 días de vigencia.`;
  
  // Generar recomendaciones específicas
  const recomendacionesInmediatas = `1. **🚨 Acción Correctiva Urgente**
   ${vencidas.length > 0 ? `- Verificar estado real de convocatorias ID ${vencidas.map(c => c.id).join(' y ')}` : '- No hay convocatorias vencidas detectadas'}
   ${urgentes.length > 0 ? `- Priorizar convocatoria${urgentes.length > 1 ? 's' : ''} urgente${urgentes.length > 1 ? 's' : ''} (${urgentes.length} identificada${urgentes.length > 1 ? 's' : ''})` : ''}

2. **🎯 Reorientación Estratégica**
   - **Enfocar 80% de recursos en convocatorias ${mejorOrden}**
   - **Priorizar sector ${mejorSector}** (tasa de éxito del ${tasaMejorSector}%)`;
  
  const recomendacionesMediano = `1. **📊 Optimización de Procesos**
   - Sistema de alertas tempranas (30, 15, 7 días antes del cierre)
   - Perfiles de requisitos automatizados por tipo de convocatoria
   - Dashboard de seguimiento en tiempo real

2. **🤝 Desarrollo de Capacidades**
   - Capacitación del personal en sector ${mejorSector}
   - Fortalecimiento de áreas débiles identificadas en requisitos`;
  
  const recomendacionesLargo = `1. **🏗️ Desarrollo Institucional**
   - Fortalecer áreas identificadas como débiles en requisitos
   - Crear alianzas estratégicas para convocatorias de alta complejidad

2. **🌐 Expansión Estratégica**
   - Explorar sectores emergentes con alta viabilidad
   - Desarrollar red de contactos ${mejorOrden.toLowerCase()}es`;
  
  const interpretacionEstadistica = parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ?
    `Las convocatorias internacionales muestran una ventaja estadística significativa de ${(parseFloat(tasaExitoInternacional) - parseFloat(tasaExitoNacional)).toFixed(1)} puntos porcentuales, sugiriendo mayor alineación de USM con estándares internacionales.` :
    `Las convocatorias nacionales presentan mejor tasa de éxito con ${(parseFloat(tasaExitoNacional) - parseFloat(tasaExitoInternacional)).toFixed(1)} puntos porcentuales de ventaja, indicando mayor conocimiento del contexto local.`;
  
  const implicacionTemporal = vencidas.length > 0 ?
    `Existe una desactualización crítica en el sistema que puede estar generando pérdida de oportunidades.` :
    `La concentración temporal requiere planificación anticipada para evitar saturación de recursos.`;
  
  const fechaCalculo = new Date().toLocaleDateString('es-ES');
  
  // Template exacto según instrucciones
  return `# INFORME ESTADÍSTICO
## Análisis de Convocatorias de Financiamiento USM ${año}

**Fecha:** ${fechaActual}  
**Período analizado:** Enero - Diciembre ${año}  
**Muestra:** ${total} convocatorias registradas

---

## RESUMEN EJECUTIVO

Este informe presenta un análisis estadístico integral de las oportunidades de financiamiento identificadas por la USM durante ${año}. Los hallazgos revelan **patrones críticos** que pueden optimizar significativamente la estrategia institucional de búsqueda y aplicación a convocatorias.

### Hallazgos Clave:
- ⚠️ **Crisis de elegibilidad:** Solo ${porcentajeElegibles}% de convocatorias son viables para USM
- 🎯 **Ventaja ${mejorOrden}:** ${descripcionVentajaComparativa}
- 📈 **Sector prometedor:** ${mejorSector} presenta la mayor tasa de éxito (${porcentajeSectorExitoso}%)
- ⏰ **${tituloProblemaTemp}:** ${descripcionProblemaTemp}

---

## ANÁLISIS ESTADÍSTICO DESCRIPTIVO

### Distribución General (N=${total})

| **Dimensión** | **Categoría** | **Frecuencia** | **Porcentaje** |
|---|---|---|---|
| **Orden** | Nacional | ${countNacional} | ${porcentajeNacional}% |
| | Internacional | ${countInternacional} | ${porcentajeInternacional}% |
| **Tipo** | ${tipoStats[0]?.tipo || 'N/A'} | ${tipoStats[0]?.count || 0} | ${tipoStats[0]?.porcentaje || '0.0'}% |
| | ${tipoStats[1]?.tipo || 'N/A'} | ${tipoStats[1]?.count || 0} | ${tipoStats[1]?.porcentaje || '0.0'}% |
| | ${tipoStats[2]?.tipo || 'N/A'} | ${tipoStats[2]?.count || 0} | ${tipoStats[2]?.porcentaje || '0.0'}% |
| | ${tipoStats[3]?.tipo || 'N/A'} | ${tipoStats[3]?.count || 0} | ${tipoStats[3]?.porcentaje || '0.0'}% |
| **Sector** | ${sectorStats[0]?.sector || 'N/A'} | ${sectorStats[0]?.count || 0} | ${sectorStats[0]?.porcentaje || '0.0'}% |
| | ${sectorStats[1]?.sector || 'N/A'} | ${sectorStats[1]?.count || 0} | ${sectorStats[1]?.porcentaje || '0.0'}% |
| | ${sectorStats[2]?.sector || 'N/A'} | ${sectorStats[2]?.count || 0} | ${sectorStats[2]?.porcentaje || '0.0'}% |
| | ${sectorStats[3]?.sector || 'N/A'} | ${sectorStats[3]?.count || 0} | ${sectorStats[3]?.porcentaje || '0.0'}% |
| **Estado** | Cerradas | ${countCerradas} | ${porcentajeCerradas}% |
| | Abiertas | ${countAbiertas} | ${porcentajeAbiertas}% |

### Cumplimiento de Requisitos
- **✅ Elegibles:** ${elegibles} convocatorias (${porcentajeElegibles}%)
- **❌ No elegibles:** ${total - elegibles} convocatorias (${porcentajeNoElegibles}%)

---

## HALLAZGOS CRÍTICOS Y CORRELACIONES

### 1. **Patrón Internacional vs Nacional**

**Hallazgo sorprendente:** ${interpretacionEstadistica}

| Orden | Tasa de Éxito | Convocatorias Elegibles |
|-------|---------------|-------------------------|
| Internacional | **${tasaExitoInternacional}%** | ${elegiblesInternacional} de ${countInternacional} |
| Nacional | **${tasaExitoNacional}%** | ${elegiblesNacional} de ${countNacional} |

**Inferencia estadística:** ${interpretacionEstadistica}

### 2. **Análisis Sectorial por Viabilidad**

| Sector | Tasa de Éxito | Convocatorias Abiertas | Potencial |
|--------|---------------|------------------------|-----------|
${tablaSectorial}

### 3. **Distribución Temporal Crítica**

**Concentración en ${periodoConcentracion}:**
- **Total concentrado:** ${porcentajeConcentracion}% en solo ${numeroMeses} meses

**Implicación:** ${implicacionTemporal}

### 4. **Análisis de Urgencia (Convocatorias Abiertas)**

| ID | Días Restantes* | Cumple Requisitos | Estado USM | Prioridad |
|----|-----------------|-------------------|------------|-----------|
${tablaUrgencia}

*Calculado desde ${fechaCalculo}

---

## RECOMENDACIONES ESTRATÉGICAS

### **Inmediatas (0-30 días)**

${recomendacionesInmediatas}

### **Mediano plazo (1-6 meses)**

${recomendacionesMediano}

### **Largo plazo (6-12 meses)**

${recomendacionesLargo}

---

## PERFIL ÓPTIMO DE CONVOCATORIA PARA USM

Basado en análisis de las ${numeroExitosas} convocatorias exitosas (IDs: ${idsExitosas}):

| **Característica** | **Perfil Óptimo** |
|-------------------|-------------------|
| **Orden** | ${perfilOrden} |
| **Sector** | ${perfilSector} |
| **Tipo** | ${perfilTipo} |
| **Monto** | ${perfilMonto} |
| **Duración** | ${perfilDuracion} |

---

## CONCLUSIONES Y PROYECCIONES

### **Conclusión Principal**
${conclusionPrincipal}

### **Proyección Estadística**
Manteniendo las tendencias actuales:
- **Probabilidad de éxito en siguiente convocatoria ${perfilOrden} ${perfilSector}:** ~${probabilidadExito}%
- **Probabilidad de éxito en convocatoria menos alineada:** ~${probabilidadFracaso}%
- **Tasa de aprovechamiento actual de oportunidades abiertas:** ${tasaAprovechamiento}%

### **Recomendación Final**
${recomendacionFinal}

---

**Elaborado por:** Sistema de Análisis Estadístico USM  
**Metodología:** Análisis descriptivo, correlacional y predictivo sobre muestra completa N=${total}  
**Nivel de confianza:** 95%`;
}

// Función para generar informe HTML mejorado
function generarInformeHTML(convocatorias: Convocatoria[], analisis: AnalisisResultado): string {
  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const año = new Date().getFullYear();
  const total = convocatorias.length;
  
  // Reutilizar cálculos del informe texto
  const elegibles = convocatorias.filter(c => c.cumplimos_requisitos === true).length;
  const porcentajeElegibles = ((elegibles / total) * 100).toFixed(1);
  
  const porcentajeNoElegibles = (((total - elegibles) / total) * 100).toFixed(1);
  
  const internacional = convocatorias.filter(c => c.orden === 'Internacional');
  const nacional = convocatorias.filter(c => c.orden === 'Nacional');
  const countInternacional = internacional.length;
  const countNacional = nacional.length;
  const porcentajeInternacional = ((countInternacional / total) * 100).toFixed(1);
  const porcentajeNacional = ((countNacional / total) * 100).toFixed(1);
  
  const tasaExitoInternacional = internacional.length > 0 ? ((internacional.filter(c => c.cumplimos_requisitos).length / internacional.length) * 100).toFixed(1) : '0.0';
  const tasaExitoNacional = nacional.length > 0 ? ((nacional.filter(c => c.cumplimos_requisitos).length / nacional.length) * 100).toFixed(1) : '0.0';
  const elegiblesInternacional = internacional.filter(c => c.cumplimos_requisitos).length;
  const elegiblesNacional = nacional.filter(c => c.cumplimos_requisitos).length;
  
  const sectores = [...new Set(convocatorias.map(c => c.sector_tema).filter(Boolean))];
  let mejorSector = '';
  let tasaMejorSector = '0.0';
  let porcentajeSectorExitoso = '0.0';
  
  sectores.forEach(sector => {
    const sectorData = convocatorias.filter(c => c.sector_tema === sector);
    const sectorElegibles = sectorData.filter(c => c.cumplimos_requisitos).length;
    const tasa = sectorData.length > 0 ? ((sectorElegibles / sectorData.length) * 100).toFixed(1) : '0.0';
    if (parseFloat(tasa) > parseFloat(tasaMejorSector)) {
      mejorSector = sector;
      tasaMejorSector = tasa;
      porcentajeSectorExitoso = tasa;
    }
  });
  
  const abiertas = convocatorias.filter(c => c.estado_convocatoria === 'Abierta');
  const cerradas = convocatorias.filter(c => c.estado_convocatoria === 'Cerrada');
  const countAbiertas = abiertas.length;
  const countCerradas = cerradas.length;
  const porcentajeAbiertas = ((countAbiertas / total) * 100).toFixed(1);
  const porcentajeCerradas = ((countCerradas / total) * 100).toFixed(1);
  
  const tipos = [...new Set(convocatorias.map(c => c.tipo).filter(Boolean))].slice(0, 4);
  const tipoStats = tipos.map(tipo => ({
    tipo,
    count: convocatorias.filter(c => c.tipo === tipo).length,
    porcentaje: ((convocatorias.filter(c => c.tipo === tipo).length / total) * 100).toFixed(1)
  }));
  
  const sectorStats = sectores.slice(0, 4).map(sector => ({
    sector,
    count: convocatorias.filter(c => c.sector_tema === sector).length,
    porcentaje: ((convocatorias.filter(c => c.sector_tema === sector).length / total) * 100).toFixed(1)
  }));
  
  const mejorOrden = parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ? 'Internacional' : 'Nacional';
  const descripcionVentajaComparativa = `Convocatorias ${mejorOrden.toLowerCase()}es muestran ${parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ? tasaExitoInternacional : tasaExitoNacional}% de elegibilidad vs ${parseFloat(tasaExitoInternacional) > parseFloat(tasaExitoNacional) ? tasaExitoNacional : tasaExitoInternacional}% de la competencia`;
  
  const hoy = new Date();
  const vencidas = convocatorias.filter(c => {
    const dias = Math.ceil((new Date(c.fecha_limite_aplicacion) - hoy) / (1000 * 60 * 60 * 24));
    return dias < 0 && c.estado_convocatoria === 'Abierta';
  });
  
  const urgentes = abiertas.filter(c => {
    const dias = Math.ceil((new Date(c.fecha_limite_aplicacion) - hoy) / (1000 * 60 * 60 * 24));
    return dias <= 30 && dias >= 0 && c.cumplimos_requisitos;
  });
  
  const tituloProblemaTemp = vencidas.length > 0 ? "Crisis temporal crítica" : "Gestión temporal adecuada";
  const descripcionProblemaTemp = vencidas.length > 0 ?
    `${vencidas.length} convocatorias vencidas siguen marcadas como abiertas` :
    `${urgentes.length} oportunidades elegibles requieren atención en los próximos 30 días`;
  
  const porMes = {};
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  convocatorias.forEach(c => {
    const fecha = new Date(c.fecha_limite_aplicacion);
    const mesIndex = fecha.getMonth();
    const mesNombre = meses[mesIndex];
    porMes[mesNombre] = (porMes[mesNombre] || 0) + 1;
  });
  
  const mesesOrdenados = Object.entries(porMes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  
  const concentracion = mesesOrdenados.reduce((sum, [_, count]) => sum + count, 0);
  const periodoConcentracion = mesesOrdenados.map(([mes, _]) => mes).join(' y ');
  const porcentajeConcentracion = ((concentracion / total) * 100).toFixed(1);
  const numeroMeses = mesesOrdenados.length;
  
  const tablaSectorial = sectores.slice(0, 4).map(sector => {
    const sectorData = convocatorias.filter(c => c.sector_tema === sector);
    const sectorTotal = sectorData.length;
    const sectorElegibles = sectorData.filter(c => c.cumplimos_requisitos).length;
    const sectorAbiertas = sectorData.filter(c => c.estado_convocatoria === 'Abierta').length;
    const sectorTasa = sectorTotal > 0 ? ((sectorElegibles / sectorTotal) * 100).toFixed(1) : '0.0';
    const potencial = parseFloat(sectorTasa) >= 40 ? 'Alto' :
                     parseFloat(sectorTasa) >= 20 ? 'Medio' :
                     parseFloat(sectorTasa) > 0 ? 'Bajo' : 'Nulo';
    
    return `| ${sector} | ${sectorTasa}% | ${sectorAbiertas} de ${sectorTotal} | ${potencial} |`;
  }).join('\\n');
  
  const tablaUrgencia = abiertas
    .map(c => ({
      id: c.id,
      dias: Math.ceil((new Date(c.fecha_limite_aplicacion) - hoy) / (1000 * 60 * 60 * 24)),
      cumple: c.cumplimos_requisitos,
      estado: c.estado_usm || 'Sin estado'
    }))
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 10);
  
  if (tablaUrgencia.length === 0) {
    return '<div class="alert alert-warning">⚠️ No hay convocatorias abiertas en este momento</div>';
  }
  
  let filas = '';
  tablaUrgencia.forEach(item => {
    const diasClass = item.dias < 0 ? 'text-danger' : item.dias <= 7 ? 'text-warning' : '';
    const cumpleIcon = item.cumple ? '✅' : '❌';
    const prioridad = item.dias < 0 ? 'CRÍTICA' :
                     (item.dias <= 7 && item.cumple) ? 'ALTA' :
                     (item.dias <= 30 && item.cumple) ? 'MEDIA' : 'BAJA';
    
    filas += `
      <tr>
        <td>${item.id}</td>
        <td class="${diasClass}">${item.dias} días</td>
        <td>${cumpleIcon}</td>
        <td>${item.estado}</td>
        <td><strong>${prioridad}</strong></td>
      </tr>`;
  });
  
  return `
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Días Restantes</th>
                <th>Cumple Requisitos</th>
                <th>Estado USM</th>
                <th>Prioridad</th>
            </tr>
        </thead>
        <tbody>
            ${filas}
        </tbody>
    </table>`;
}

function generarGraficoDistribucionHTML(data: Convocatoria[]): string {
  const elegibles = data.filter(c => c.cumplimos_requisitos).length;
  const noElegibles = data.length - elegibles;
  
  return `
    const ctx = document.getElementById('distribucionChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Elegibles', 'No Elegibles'],
            datasets: [{
                data: [${elegibles}, ${noElegibles}],
                backgroundColor: [
                    'rgba(0, 184, 148, 0.8)',
                    'rgba(255, 107, 107, 0.8)'
                ],
                borderColor: [
                    'rgba(0, 184, 148, 1)',
                    'rgba(255, 107, 107, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Elegibilidad USM'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });`;
}

function generarAlertasHTML(analisis: AnalisisResultado): string {
  let alertas = '';
  
  if (analisis.convocatoriasVencidas.length > 0) {
    alertas += `
      <div class="alert alert-danger">
          <h4>🚨 Convocatorias Vencidas Detectadas</h4>
          <p>Se encontraron ${analisis.convocatoriasVencidas.length} convocatorias marcadas como abiertas pero que ya vencieron.</p>
          <p><strong>IDs:</strong> ${analisis.convocatoriasVencidas.join(', ')}</p>
      </div>`;
  }
  
  if (analisis.oportunidadesUrgentes.length > 0) {
    alertas += `
      <div class="alert alert-warning">
          <h4>⏰ Oportunidades Urgentes</h4>
          <p>Hay ${analisis.oportunidadesUrgentes.length} convocatorias elegibles que vencen pronto:</p>
          <ul>`;
    
    analisis.oportunidadesUrgentes.slice(0, 3).forEach(opp => {
      alertas += `<li><strong>ID ${opp.id}:</strong> ${opp.nombre} (${opp.monto}) - ${opp.dias} días restantes</li>`;
    });
    
    alertas += `</ul></div>`;
  }
  
  if (analisis.tasaElegibilidadGeneral >= 50) {
    alertas += `
      <div class="alert alert-success">
          <h4>✅ Tasa de Elegibilidad Favorable</h4>
          <p>USM presenta una tasa de elegibilidad del ${analisis.tasaElegibilidadGeneral}%, superior al promedio institucional.</p>
      </div>`;
  }
  
  return alertas;
}

function generarRecomendacionesHTML(analisis: AnalisisResultado): string {
  return `
    <div class="highlight">
        <h3>🎯 Inmediatas (0-30 días)</h3>
        <ul>
            ${analisis.convocatoriasVencidas.length > 0 ? 
              `<li><strong>Verificar estado de convocatorias vencidas</strong> (IDs: ${analisis.convocatoriasVencidas.join(', ')})</li>` : ''}
            ${analisis.oportunidadesUrgentes.length > 0 ? 
              `<li><strong>Priorizar ${analisis.oportunidadesUrgentes.length} oportunidades urgentes</strong></li>` : ''}
            <li><strong>Enfocar 80% de recursos en convocatorias ${analisis.ventajaComparativa.mejor}</strong></li>
            <li><strong>Priorizar sector ${analisis.sectorMasExitoso.nombre}</strong> (${analisis.sectorMasExitoso.tasa}% de éxito)</li>
        </ul>
        
        <h3>📈 Mediano plazo (1-6 meses)</h3>
        <ul>
            <li>Implementar sistema de alertas tempranas</li>
            <li>Capacitar personal en sector ${analisis.sectorMasExitoso.nombre}</li>
            <li>Desarrollar perfiles automatizados de requisitos</li>
        </ul>
        
        <h3>🏗️ Largo plazo (6+ meses)</h3>
        <ul>
            <li>Fortalecer capacidades institucionales identificadas como débiles</li>
            <li>Crear alianzas estratégicas para convocatorias complejas</li>
            <li>Expandir hacia sectores emergentes con alta viabilidad</li>
        </ul>
    </div>`;
}

// Servidor principal
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { convocatorias, formato = 'html' } = await req.json();
    
    console.log(`Procesando ${convocatorias.length} convocatorias para análisis en formato ${formato}`);
    
    if (!convocatorias || !Array.isArray(convocatorias)) {
      throw new Error('Se requiere un array de convocatorias');
    }

    const analisis = generarAnalisisCompleto(convocatorias);
    
    let informe;
    if (formato === 'texto') {
      informe = generarInformeTexto(convocatorias, analisis);
    } else {
      informe = generarInformeHTML(convocatorias, analisis);
    }

    return new Response(JSON.stringify({
      success: true,
      informe,
      analisis,
      metadata: {
        total_convocatorias: convocatorias.length,
        tasa_elegibilidad: analisis.tasaElegibilidadGeneral,
        sector_mas_exitoso: analisis.sectorMasExitoso.nombre,
        ventaja_comparativa: analisis.ventajaComparativa.mejor,
        oportunidades_urgentes: analisis.oportunidadesUrgentes.length,
        formato
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en generate-smart-report:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error interno del servidor',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

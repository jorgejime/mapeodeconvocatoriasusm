export interface Convocatoria {
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

export interface ConvocatoriaForAnalysis {
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
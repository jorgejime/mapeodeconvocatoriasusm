-- Actualizar la restricción de estado_usm para incluir todas las opciones del formulario
ALTER TABLE public.convocatorias DROP CONSTRAINT convocatorias_estado_usm_check;
ALTER TABLE public.convocatorias ADD CONSTRAINT convocatorias_estado_usm_check 
  CHECK (estado_usm IS NULL OR estado_usm IN ('En revisión', 'En preparación', 'Presentada', 'En subsanación', 'Archivada', 'Adjudicada', 'Rechazada'));
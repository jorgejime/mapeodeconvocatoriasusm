-- Eliminar las restricciones CHECK existentes
ALTER TABLE public.convocatorias DROP CONSTRAINT IF EXISTS convocatorias_orden_check;
ALTER TABLE public.convocatorias DROP CONSTRAINT IF EXISTS convocatorias_tipo_check;
ALTER TABLE public.convocatorias DROP CONSTRAINT IF EXISTS convocatorias_estado_convocatoria_check;
ALTER TABLE public.convocatorias DROP CONSTRAINT IF EXISTS convocatorias_estado_usm_check;

-- Agregar las restricciones CHECK correctas con las opciones exactas
ALTER TABLE public.convocatorias ADD CONSTRAINT convocatorias_orden_check 
  CHECK (orden IS NULL OR orden IN ('Local', 'Nacional', 'Internacional'));

ALTER TABLE public.convocatorias ADD CONSTRAINT convocatorias_tipo_check 
  CHECK (tipo IS NULL OR tipo IN ('Investigación', 'Fortalecimiento institucional', 'Formación', 'Movilidad', 'Otro', 'Varios'));

ALTER TABLE public.convocatorias ADD CONSTRAINT convocatorias_estado_convocatoria_check 
  CHECK (estado_convocatoria IS NULL OR estado_convocatoria IN ('Abierta', 'Cerrada', 'Próxima'));

ALTER TABLE public.convocatorias ADD CONSTRAINT convocatorias_estado_usm_check 
  CHECK (estado_usm IS NULL OR estado_usm IN ('En revisión', 'En preparación', 'Presentada', 'Archivada'));
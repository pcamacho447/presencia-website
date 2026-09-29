-- Tabla Libro de Reclamaciones Virtual - Flores en Paz (Perú Ley 29571 / D.S. 011-2011-PCM)
CREATE SEQUENCE IF NOT EXISTS reclamaciones_seq START 1;

CREATE TABLE IF NOT EXISTS public.reclamaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  tipo_persona TEXT NOT NULL CHECK (tipo_persona IN ('natural', 'juridica')),
  nombre_completo TEXT NOT NULL,
  razon_social TEXT,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('DNI', 'CE', 'Pasaporte', 'RUC')),
  numero_documento TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  es_menor BOOLEAN NOT NULL DEFAULT false,
  apoderado_nombre TEXT,
  apoderado_documento TEXT,
  tipo_bien TEXT NOT NULL CHECK (tipo_bien IN ('producto', 'servicio')),
  monto_reclamado NUMERIC(10,2),
  descripcion_bien TEXT NOT NULL,
  tipo_reclamacion TEXT NOT NULL CHECK (tipo_reclamacion IN ('reclamo', 'queja')),
  detalle TEXT NOT NULL,
  pedido TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'atendido', 'cerrado')),
  observaciones_proveedor TEXT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_limite TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 days')
);

ALTER TABLE public.reclamaciones ENABLE ROW LEVEL SECURITY;

-- Política: Service role puede hacer todo (acceso exclusivo para backend / API endpoints)
DROP POLICY IF EXISTS "Service role full access on reclamaciones" ON public.reclamaciones;
CREATE POLICY "Service role full access on reclamaciones"
  ON public.reclamaciones
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Eliminada política de inserción pública anónima por seguridad (reclamaciones se procesan vía /api/reclamaciones con service_role)
DROP POLICY IF EXISTS "Allow public insert on reclamaciones" ON public.reclamaciones;

-- Función segura para generar el siguiente código correlativo usando la secuencia atómica
CREATE OR REPLACE FUNCTION public.get_next_reclamacion_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_seq BIGINT;
  cur_year INT;
BEGIN
  SELECT nextval('reclamaciones_seq') INTO next_seq;
  cur_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  RETURN 'REC-' || cur_year || '-' || LPAD(next_seq::TEXT, 5, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_next_reclamacion_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_next_reclamacion_code() TO service_role;

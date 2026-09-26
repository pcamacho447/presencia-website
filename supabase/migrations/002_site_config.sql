-- supabase/migrations/002_site_config.sql
CREATE TABLE IF NOT EXISTS site_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS activo sin políticas públicas (solo service_role)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Insertar configuración inicial del sitio
INSERT INTO site_config (key, value) VALUES
('hero', '{
  "video_url": "/videos/hero.mp4",
  "title_es": "FLORES PARA LOS QUE SIEMPRE ESTÁN",
  "title_en": "FLOWERS FOR THOSE WHO ARE ALWAYS WITH YOU",
  "subtitle_es": "Porque cuidar no depende de dónde estés. Con tu decisión, nosotros llegamos por ti.",
  "subtitle_en": "Because caring doesn''t depend on where you are. With your decision, we go for you."
}'::jsonb),
('paquetes', '[
  {
    "id": "serenidad",
    "nombre": "SERENIDAD",
    "destacado": true,
    "precio_sol": "140",
    "precio_usd": "38",
    "beneficios": ["Arreglo floral premium de temporada", "Tarjeta con mensaje personalizado impreso", "Envío de foto y video de confirmación", "Colocación garantizada en la sepultura"],
    "beneficios_en": ["Premium seasonal floral arrangement", "Printed card with personal message", "Photo & video placement confirmation", "Guaranteed cemetery placement"]
  },
  {
    "id": "esencial",
    "nombre": "ESENCIAL",
    "destacado": false,
    "precio_sol": "90",
    "precio_usd": "25",
    "beneficios": ["Arreglo floral clásico de temporada", "Tarjeta con mensaje personalizado", "Envío de foto de confirmación"],
    "beneficios_en": ["Classic seasonal floral arrangement", "Card with personal message", "Photo placement confirmation"]
  },
  {
    "id": "memoria_viva",
    "nombre": "MEMORIA VIVA",
    "destacado": false,
    "precio_sol": "240",
    "precio_usd": "65",
    "beneficios": ["Mantenimiento y arreglo mensual (3 meses)", "Selección preferencial de flores", "Tarjeta con mensaje personalizado en cada entrega", "Reporte fotográfico mensual"],
    "beneficios_en": ["Monthly maintenance & flowers (3 months)", "Preferential flower selection", "Personalized card on each delivery", "Monthly photo report"]
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 001_initial.sql
-- Tabla de leads (solicitudes de contacto)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  fecha_deseada DATE,
  paquete TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscripciones de email
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Sin políticas anónimas: solo el service_role_key puede leer/escribir
-- (ningún cliente browser puede acceder directamente)

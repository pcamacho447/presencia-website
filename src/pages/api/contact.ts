import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null);

  if (!json || !json.whatsapp || !json.nombre) {
    return new Response(JSON.stringify({ error: 'Datos incompletos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from('leads').insert({
    nombre: String(json.nombre).slice(0, 200),
    whatsapp: String(json.whatsapp).slice(0, 50),
    ciudad: String(json.ciudad || 'Lima').slice(0, 100),
    fecha_deseada: json.fecha_deseada || null,
    paquete: String(json.paquete || '').slice(0, 100),
  });

  if (error) {
    console.error('Supabase insert error:', error.message);
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// src/pages/api/admin/leads.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../../../lib/env';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const url = getEnv(context, 'SUPABASE_URL');
    const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY en las variables de Cloudflare' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from('leads')
      .select('nombre, whatsapp, ciudad, paquete, fecha_deseada, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: 'Error al consultar leads' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

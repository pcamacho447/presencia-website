// src/pages/api/admin/leads.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../../../lib/env';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const supabase = createClient(
      getEnv(context, 'SUPABASE_URL'),
      getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase
      .from('leads')
      .select('nombre, whatsapp, ciudad, paquete, fecha_deseada, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: 'Error interno' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Error interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

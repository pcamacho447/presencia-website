import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../../../lib/supabase';
import { getEnv } from '../../../lib/env';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const url = getEnv(context, 'SUPABASE_URL');
    const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

    let supabase: any;
    if (url && serviceKey) {
      supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    } else {
      supabase = createSupabaseServerClient(context);
    }

    const { data, error } = await supabase
      .from('reclamaciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: 'Error al consultar reclamaciones' }), {
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

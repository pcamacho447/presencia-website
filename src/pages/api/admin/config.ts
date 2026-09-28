// src/pages/api/admin/config.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../../../lib/supabase';
import { getEnv } from '../../../lib/env';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const url = getEnv(context, 'SUPABASE_URL');
  const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

  let supabase: any;
  if (url && serviceKey) {
    supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  } else {
    supabase = createSupabaseServerClient(context);
  }

  const key = context.url.searchParams.get('key');

  let query = supabase.from('site_config').select('key, value, updated_at');
  if (key) {
    query = query.eq('key', key);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al consultar configuración' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(key ? (data[0]?.value ?? null) : data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async (context) => {
  const json = await context.request.json().catch(() => null);

  if (!json || !json.key || json.value === undefined) {
    return new Response(JSON.stringify({ error: 'Parámetros inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = getEnv(context, 'SUPABASE_URL');
  const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

  let supabase: any;
  if (url && serviceKey) {
    supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  } else {
    supabase = createSupabaseServerClient(context);
  }

  const { error } = await supabase
    .from('site_config')
    .upsert(
      { key: String(json.key), value: json.value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

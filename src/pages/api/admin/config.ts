// src/pages/api/admin/config.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const key = url.searchParams.get('key');
  
  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

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

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null);

  if (!json || !json.key || json.value === undefined) {
    return new Response(JSON.stringify({ error: 'Parámetros inválidos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

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

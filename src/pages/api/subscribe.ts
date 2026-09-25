import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const json = await request.json().catch(() => null);

  if (!json || !json.email || !String(json.email).includes('@')) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  // ON CONFLICT DO NOTHING — no exponer si el email ya existe
  const { error } = await supabase
    .from('subscriptions')
    .upsert({ email: String(json.email).toLowerCase().trim() }, { onConflict: 'email' });

  if (error) {
    console.error('Supabase subscribe error:', error.message);
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

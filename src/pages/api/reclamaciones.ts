import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../../lib/env.ts';
import { validateClaimPayload, generateClaimCode } from '../../lib/claims-validation.ts';
import type { ClaimPayload } from '../../types/claims.ts';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const json = (await context.request.json().catch(() => null)) as Partial<ClaimPayload> | null;

  if (!json) {
    return new Response(JSON.stringify({ error: 'Cuerpo de petición inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateClaimPayload(json);
  if (!validation.isValid) {
    return new Response(JSON.stringify({ error: 'Datos incompletos o inválidos', details: validation.errors }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = getEnv(context, 'SUPABASE_URL');
  const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

  const supabase =
    (context?.locals as any)?.supabase ||
    (url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null);

  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Configuración incompleta del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Obtener siguiente correlativo atómicamente desde la secuencia de base de datos
  let codigo: string;
  const { data: rpcCode, error: rpcError } = await supabase.rpc('get_next_reclamacion_code');
  if (!rpcError && rpcCode) {
    codigo = String(rpcCode);
  } else {
    // Fallback con conteo si la función RPC no estuviera disponible
    const { count } = await supabase.from('reclamaciones').select('*', { count: 'exact', head: true });
    const nextSeq = (count || 0) + 1;
    codigo = generateClaimCode(nextSeq);
  }

  const now = new Date();
  const fechaLimite = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  const tipoPersona = json.tipo_persona === 'juridica' ? 'juridica' : 'natural';
  const montoReclamado =
    json.monto_reclamado != null && !isNaN(Number(json.monto_reclamado))
      ? Number(json.monto_reclamado)
      : null;

  const { error: insertError } = await supabase.from('reclamaciones').insert({
    codigo,
    tipo_persona: tipoPersona,
    nombre_completo: String(json.nombre_completo).slice(0, 250),
    razon_social: json.razon_social ? String(json.razon_social).slice(0, 250) : null,
    tipo_documento: json.tipo_documento,
    numero_documento: String(json.numero_documento).slice(0, 50),
    telefono: String(json.telefono).slice(0, 50),
    email: String(json.email).slice(0, 150),
    direccion: String(json.direccion).slice(0, 300),
    ciudad: String(json.ciudad).slice(0, 100),
    es_menor: Boolean(json.es_menor),
    apoderado_nombre: json.apoderado_nombre ? String(json.apoderado_nombre).slice(0, 250) : null,
    apoderado_documento: json.apoderado_documento ? String(json.apoderado_documento).slice(0, 50) : null,
    tipo_bien: json.tipo_bien,
    monto_reclamado: montoReclamado,
    descripcion_bien: String(json.descripcion_bien).slice(0, 500),
    tipo_reclamacion: json.tipo_reclamacion,
    detalle: String(json.detalle).slice(0, 2000),
    pedido: String(json.pedido).slice(0, 1000),
    estado: 'pendiente',
    fecha_registro: now.toISOString(),
    fecha_limite: fechaLimite.toISOString(),
  });

  if (insertError) {
    console.error('Error insertando reclamación:', insertError.message);
    return new Response(JSON.stringify({ error: 'Error al registrar la reclamación en el sistema' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      codigo,
      fecha_registro: now.toISOString(),
      fecha_limite: fechaLimite.toISOString(),
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

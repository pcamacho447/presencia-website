import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';
import { debugEnvInfo } from './lib/env';

const ADMIN_ROUTES = /^\/admin(\/|$)/;
const API_ADMIN_ROUTES = /^\/api\/admin(\/|$)/;

// Rutas públicas dentro de /admin que no requieren sesión
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth-callback'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Endpoint de diagnóstico rápido para verificar el entorno en Cloudflare
  if (pathname === '/api/debug-env') {
    return new Response(JSON.stringify(debugEnvInfo(context), null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Saltar guard en desarrollo local cuando PUBLIC_SKIP_AUTH=true
  if (import.meta.env.PUBLIC_SKIP_AUTH === 'true') {
    return next();
  }

  // Solo actúa en rutas /admin/* y /api/admin/*
  const isAdminRoute = ADMIN_ROUTES.test(pathname);
  const isApiAdminRoute = API_ADMIN_ROUTES.test(pathname);

  if (!isAdminRoute && !isApiAdminRoute) {
    return next();
  }

  // Rutas públicas de autenticación no necesitan guard de sesión
  if (PUBLIC_ADMIN_PATHS.includes(pathname) || PUBLIC_ADMIN_PATHS.includes(pathname.replace(/\/$/, ''))) {
    try {
      return await next();
    } catch (err: any) {
      return new Response(
        `[Admin Public Route Error] ${err?.message || err}\n${err?.stack || ''}\n\nEnv Diagnostics:\n${JSON.stringify(debugEnvInfo(context), null, 2)}`,
        { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }
  }

  // Validar sesión
  try {
    const supabase = createSupabaseServerClient(context);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // API routes responden 401 JSON
      if (isApiAdminRoute) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Admin pages redirigen al login
      return context.redirect('/admin/login');
    }

    return await next();
  } catch (err: any) {
    console.error('Middleware Error:', err);
    return new Response(
      `[Admin Middleware Error] ${err?.message || err}\n${err?.stack || ''}\n\nEnv Diagnostics:\n${JSON.stringify(debugEnvInfo(context), null, 2)}`,
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
});

import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';

const ADMIN_ROUTES = /^\/admin(\/|$)/;
const API_ADMIN_ROUTES = /^\/api\/admin(\/|$)/;

// Rutas públicas dentro de /admin que no requieren sesión
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth-callback'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

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

  console.log('MIDDLEWARE INTERCEPT:', pathname);

  // Rutas públicas de autenticación no necesitan guard
  if (PUBLIC_ADMIN_PATHS.includes(pathname) || PUBLIC_ADMIN_PATHS.includes(pathname.replace(/\/$/, ''))) {
    console.log('MIDDLEWARE BYPASS PUBLIC:', pathname);
    return next();
  }

  // Validar sesión
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

  return next();
});

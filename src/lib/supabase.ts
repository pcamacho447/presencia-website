import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import { getEnv } from './env';

export function createSupabaseServerClient(context: any) {
  const url = getEnv(context, 'SUPABASE_URL');
  const key = getEnv(context, 'SUPABASE_ANON_KEY');

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.request.headers.get('cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
          });
        });
      },
    },
  });
}

import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { getEnv } from './env';

export function createSupabaseServerClient(context: any) {
  const url = getEnv(context, 'SUPABASE_URL');
  const key = getEnv(context, 'SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error(
      `[Supabase Config Error] Missing credentials. SUPABASE_URL: ${url ? 'present' : 'MISSING'}, SUPABASE_ANON_KEY: ${key ? 'present' : 'MISSING'}.`
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(context?.request?.headers?.get('cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context?.cookies?.set(name, value, {
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

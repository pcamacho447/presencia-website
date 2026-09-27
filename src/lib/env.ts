export function getEnv(context: any, key: string): string {
  // 1. Cloudflare Workers / Pages runtime variables
  if (context?.locals?.runtime?.env && context.locals.runtime.env[key]) {
    return context.locals.runtime.env[key];
  }

  // 2. Process.env (enabled by nodejs_compat flag in Cloudflare Workers)
  if (typeof process !== 'undefined' && process?.env && process.env[key]) {
    return process.env[key];
  }

  // 3. Astro build-time / local env variables (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
    return (import.meta.env as any)[key];
  }

  // 4. GlobalThis fallback
  if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
    return (globalThis as any)[key];
  }

  return '';
}

export function debugEnvInfo(context: any) {
  const runtimeKeys = context?.locals?.runtime?.env ? Object.keys(context.locals.runtime.env) : [];
  const processKeys = typeof process !== 'undefined' && process?.env ? Object.keys(process.env) : [];
  const importMetaKeys = typeof import.meta !== 'undefined' && import.meta.env ? Object.keys(import.meta.env) : [];

  return {
    runtimeKeys,
    processKeys,
    importMetaKeys,
    hasSupabaseUrl: Boolean(getEnv(context, 'SUPABASE_URL')),
    hasAnonKey: Boolean(getEnv(context, 'SUPABASE_ANON_KEY')),
    hasServiceRoleKey: Boolean(getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY')),
  };
}

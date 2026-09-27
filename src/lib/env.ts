export function getEnv(context: any, key: string): string {
  // 1. Cloudflare Pages runtime variables (for encrypted secrets in prod)
  if (context?.locals?.runtime?.env && context.locals.runtime.env[key]) {
    return context.locals.runtime.env[key];
  }
  
  // 2. Astro build-time / local env variables
  if (import.meta.env && (import.meta.env as any)[key]) {
    return (import.meta.env as any)[key];
  }

  return '';
}

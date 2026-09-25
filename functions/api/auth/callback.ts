// functions/api/auth/callback.ts
// Worker que maneja el OAuth callback de GitHub para Decap CMS
// Basado en: https://github.com/Herohtar/netlify-cms-oauth-firebase

type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params?: Record<string, string | string[]>;
  waitUntil?: (promise: Promise<unknown>) => void;
  next?: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data?: Record<string, unknown>;
}) => Response | Promise<Response>;

export const onRequest: PagesFunction<{
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };

  if (!tokenData.access_token) {
    return new Response(`Auth error: ${tokenData.error}`, { status: 400 });
  }

  // Devolver el token a Decap CMS via postMessage
  const script = `
    <script>
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' })}',
        '*'
      );
      window.close();
    </script>
  `;

  return new Response(script, {
    headers: { 'Content-Type': 'text/html' },
  });
};

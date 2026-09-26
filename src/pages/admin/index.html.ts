// src/pages/admin/index.html.ts
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ redirect }) => {
  return redirect('/admin/', 301);
};

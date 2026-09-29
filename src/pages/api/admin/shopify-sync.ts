// src/pages/api/admin/shopify-sync.ts
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../../../lib/supabase';
import { getEnv } from '../../../lib/env';
import { fetchShopifyProducts } from '../../../lib/shopify';
import type { CatalogItem } from '../../../types/catalog';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    const json = await context.request.json().catch(() => ({}));
    const domain = json.domain?.trim() || getEnv(context, 'SHOPIFY_STORE_DOMAIN');
    const token = json.token?.trim() || getEnv(context, 'SHOPIFY_STOREFRONT_ACCESS_TOKEN');
    const autoSave = json.autoSave !== false;

    if (!domain || !token) {
      return new Response(JSON.stringify({ 
        error: 'Debes ingresar el Dominio de Shopify (ej. mi-tienda.myshopify.com) y el Storefront Access Token.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Consultar productos a Shopify Storefront API
    const shopifyProducts = await fetchShopifyProducts(domain, token);

    if (!shopifyProducts || shopifyProducts.length === 0) {
      return new Response(JSON.stringify({ 
        warning: 'La tienda de Shopify respondió, pero no tiene productos activos o con visibilidad en el canal Storefront.',
        products: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convertir productos de Shopify al formato CatalogItem
    const newCatalogItems: CatalogItem[] = shopifyProducts.map((p, idx) => ({
      id: p.handle || `shopify-item-${idx}`,
      nombre_es: p.title,
      nombre_en: p.title,
      flores_es: p.description || 'Arreglo floral exclusivo confeccionado con flores frescas seleccionadas.',
      flores_en: p.description || 'Exclusive floral arrangement crafted with fresh selected flowers.',
      precio_sol: Number(p.price) || 0,
      precio_usd: Math.round((Number(p.price) || 0) / 3.75),
      imagen_url: p.imageUrl,
      disponible: p.availableForSale,
      destacado: idx === 0, // Destacar el primero por defecto
      shopify_enabled: true,
      shopify_checkout_url: p.checkoutUrl,
    }));

    // Si autoSave está activo, persistir en Supabase site_config
    if (autoSave) {
      const url = getEnv(context, 'SUPABASE_URL');
      const serviceKey = getEnv(context, 'SUPABASE_SERVICE_ROLE_KEY');

      let supabase: any;
      if (url && serviceKey) {
        supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
      } else {
        supabase = createSupabaseServerClient(context);
      }

      await supabase.from('site_config').upsert({
        key: 'catalogo',
        value: newCatalogItems,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

      // Guardar también las credenciales para futuras sincronizaciones (en clave shopify_config)
      await supabase.from('site_config').upsert({
        key: 'shopify_config',
        value: { domain, token_hint: token.slice(0, 6) + '...' + token.slice(-4) },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      count: newCatalogItems.length,
      products: newCatalogItems 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Error al conectar con Shopify Storefront API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

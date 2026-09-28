export interface PackageItem {
  id: string;
  nombre: string;
  nombre_en?: string;
  destacado: boolean;
  precio_sol: string;
  precio_usd: string;
  beneficios: string[];
  beneficios_en?: string[];
  shopify_enabled?: boolean;
  shopify_checkout_url?: string;
}

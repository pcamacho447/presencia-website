import type { CatalogItem } from '../types/catalog';

export const defaultCatalog: CatalogItem[] = [
  {
    id: 'lirios-paz',
    nombre_es: 'Lirios de la Paz',
    nombre_en: 'Lilies of Peace',
    flores_es: 'Lirios blancos, rosas y follaje fino',
    flores_en: 'White lilies, roses, and fine foliage',
    precio_sol: 190,
    precio_usd: 55,
    imagen_url: '/images/arrangements/lirios-paz.jpg',
    disponible: true,
    destacado: true
  },
  {
    id: 'girasoles-esperanza',
    nombre_es: 'Girasoles de Esperanza',
    nombre_en: 'Sunflowers of Hope',
    flores_es: 'Girasoles vibrantes, margaritas y eucalipto',
    flores_en: 'Vibrant sunflowers, daisies, and eucalyptus',
    precio_sol: 220,
    precio_usd: 65,
    imagen_url: '/images/arrangements/girasoles-esperanza.jpg',
    disponible: true,
    destacado: true
  },
  {
    id: 'manto-claveles',
    nombre_es: 'Manto de Claveles',
    nombre_en: 'Mantle of Carnations',
    flores_es: 'Claveles seleccionados, hortensias y siemprevivas',
    flores_en: 'Selected carnations, hydrangeas, and everlastings',
    precio_sol: 180,
    precio_usd: 50,
    imagen_url: '/images/arrangements/manto-claveles.jpg',
    disponible: true,
    destacado: false
  },
  {
    id: 'armonia-astromelias',
    nombre_es: 'Armonía de Astromelias',
    nombre_en: 'Harmony of Alstroemerias',
    flores_es: 'Astromelias multicolores, lirios y rosas',
    flores_en: 'Multicolored alstroemerias, lilies, and roses',
    precio_sol: 200,
    precio_usd: 58,
    imagen_url: '/images/arrangements/armonia-astromelias.jpg',
    disponible: true,
    destacado: false
  },
  {
    id: 'corazon-rosas',
    nombre_es: 'Corazón de Rosas',
    nombre_en: 'Heart of Roses',
    flores_es: 'Rosas premium blancas y rosadas con velo de novia',
    flores_en: 'Premium white and pink roses with baby\'s breath',
    precio_sol: 250,
    precio_usd: 72,
    imagen_url: '/images/arrangements/corazon-rosas.jpg',
    disponible: true,
    destacado: true
  }
];
